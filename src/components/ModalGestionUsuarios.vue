<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/types'
import type { EmpleadoResponse, TareaResponse } from '@/types'
import { colorAvatar, inicial } from '@/utils/avatarColor'
import IconX from '@/components/icons/IconX.vue'
import IconPower from '@/components/icons/IconPower.vue'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'
import ModalEditarUsuario from '@/components/ModalEditarUsuario.vue'

const emit = defineEmits<{
  cerrar: []
}>()

const authStore = useAuthStore()
const cargando = ref(false)
const errorLista = ref<string | null>(null)

// EmpleadoResponse no trae un campo "activo": el estado se determina cruzando
// la lista de activos (/usuario/empleados/todos o .../departamento, segun el
// rol) con /usuario/empleados/inactivos.
interface FilaUsuario extends EmpleadoResponse {
  activo: boolean
}
const filas = ref<FilaUsuario[]>([])

const vista = ref<'lista' | 'confirmar'>('lista')
const empleadoSeleccionado = ref<FilaUsuario | null>(null)
const empleadoEditando = ref<FilaUsuario | null>(null)
const accionSeleccionada = ref<'activar' | 'desactivar'>('activar')
const tareasActivas = ref<TareaResponse[]>([])
const cargandoTareas = ref(false)
const procesando = ref(false)
const error = ref<string | null>(null)

const ESTADOS_FINALES = ['Completada', 'Cancelada']

async function inicializar() {
  cargando.value = true
  errorLista.value = null
  try {
    const endpointActivos = authStore.usuario?.rol === ROLES.JEFE
      ? '/usuario/empleados/todos'
      : '/usuario/empleados/departamento'

    const [activos, inactivos] = await Promise.all([
      api.get<EmpleadoResponse[]>(endpointActivos),
      api.get<EmpleadoResponse[]>('/usuario/empleados/inactivos')
    ])

    filas.value = [
      ...activos.data.map(e => ({ ...e, activo: true })),
      ...inactivos.data.map(e => ({ ...e, activo: false }))
    ]
  } catch {
    errorLista.value = 'No se pudo cargar la lista de empleados.'
  } finally {
    cargando.value = false
  }
}

async function calcularTareasActivas(empleadoId: number): Promise<TareaResponse[]> {
  let todas: TareaResponse[] = []

  if (authStore.usuario?.rol === ROLES.JEFE) {
    const { data } = await api.get<TareaResponse[]>('/tareas/obtener')
    todas = data
  } else {
    const deptIds = authStore.usuario?.departamentosIds ?? []
    const respuestas = await Promise.all(
      deptIds.map(id => api.get<TareaResponse[]>(`/tareas/departamento/${id}`))
    )
    const mapa = new Map<number, TareaResponse>()
    respuestas.forEach(r => r.data.forEach(t => mapa.set(t.id, t)))
    todas = [...mapa.values()]
  }

  return todas.filter(t => t.asignadoA === empleadoId && !ESTADOS_FINALES.includes(t.estado))
}

async function abrirConfirmacion(empleado: FilaUsuario, accion: 'activar' | 'desactivar') {
  empleadoSeleccionado.value = empleado
  accionSeleccionada.value = accion
  error.value = null
  tareasActivas.value = []
  vista.value = 'confirmar'

  if (accion === 'desactivar') {
    cargandoTareas.value = true
    try {
      tareasActivas.value = await calcularTareasActivas(empleado.id)
    } catch {
      // Si falla el calculo no bloqueamos la confirmacion, solo no mostramos la advertencia.
    } finally {
      cargandoTareas.value = false
    }
  }
}

function cancelarConfirmacion() {
  vista.value = 'lista'
  empleadoSeleccionado.value = null
  tareasActivas.value = []
  error.value = null
}

async function confirmar() {
  if (!empleadoSeleccionado.value) return
  procesando.value = true
  error.value = null
  try {
    await api.patch(`/usuario/${empleadoSeleccionado.value.id}/${accionSeleccionada.value}`)
    vista.value = 'lista'
    empleadoSeleccionado.value = null
    await inicializar()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? `No se pudo ${accionSeleccionada.value} el usuario.`
  } finally {
    procesando.value = false
  }
}

onMounted(inicializar)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Gestionar usuarios</h2>
          <p class="subtitulo">Activa o desactiva miembros del equipo</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <template v-if="vista === 'lista'">
        <p v-if="cargando" class="estado-info">Cargando usuarios...</p>
        <p v-if="errorLista" class="mensaje-error">{{ errorLista }}</p>

        <div v-if="!cargando && filas.length > 0" class="lista-usuarios">
          <div v-for="fila in filas" :key="fila.id" class="usuario-item">
            <span class="avatar" :style="{ background: colorAvatar(fila.nombre) }">{{ inicial(fila.nombre) }}</span>
            <span class="usuario-info">
              <span class="usuario-nombre">{{ fila.nombre }}</span>
              <span class="usuario-rol">{{ fila.nombreRol }}</span>
            </span>
            <span class="badge" :class="fila.activo ? 'badge-activo' : 'badge-inactivo'">
              {{ fila.activo ? 'Activo' : 'Inactivo' }}
            </span>
            <span class="fila-acciones">
              <button type="button" class="btn-mini" @click="empleadoEditando = fila">
                Editar
              </button>
              <button
                type="button"
                class="btn-mini"
                :class="{ peligroso: fila.activo }"
                @click="abrirConfirmacion(fila, fila.activo ? 'desactivar' : 'activar')"
              >
                <IconPower :size="13" />
                {{ fila.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </span>
          </div>
        </div>
        <p v-else-if="!cargando" class="estado-info">No hay usuarios para mostrar.</p>

        <button class="btn-cancelar" @click="emit('cerrar')">Cerrar</button>
      </template>

      <template v-else-if="vista === 'confirmar' && empleadoSeleccionado">
        <p v-if="cargandoTareas" class="estado-info">Verificando tareas asignadas...</p>

        <div v-else-if="accionSeleccionada === 'desactivar' && tareasActivas.length > 0" class="alerta">
          <p class="alerta-titulo"><IconAlertCircle :size="14" /> {{ empleadoSeleccionado.nombre }} tiene {{ tareasActivas.length }} tarea(s) activa(s)</p>
          <p class="alerta-texto">Te recomendamos reasignarlas antes de desactivarlo. Puedes continuar de todas formas si lo prefieres.</p>
          <ul class="alerta-lista">
            <li v-for="tarea in tareasActivas" :key="tarea.id">{{ tarea.titulo }} · {{ tarea.estado }}</li>
          </ul>
        </div>

        <p v-else class="confirmar-texto">
          ¿Seguro que deseas {{ accionSeleccionada === 'activar' ? 'activar' : 'desactivar' }} a
          <strong>{{ empleadoSeleccionado.nombre }}</strong>?
        </p>

        <p v-if="error" class="mensaje-error">{{ error }}</p>

        <div class="acciones">
          <button type="button" class="btn-secundario" @click="cancelarConfirmacion" :disabled="procesando">Cancelar</button>
          <button
            type="button"
            class="btn-primario"
            :class="{ peligroso: accionSeleccionada === 'desactivar' }"
            :disabled="procesando || cargandoTareas"
            @click="confirmar"
          >
            {{ procesando ? 'Procesando...' : (accionSeleccionada === 'activar' ? 'Activar' : 'Desactivar de todas formas') }}
          </button>
        </div>
      </template>

      <ModalEditarUsuario
        v-if="empleadoEditando"
        :usuario="empleadoEditando"
        @cerrar="empleadoEditando = null"
        @editado="() => { empleadoEditando = null; inicializar() }"
      />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.82rem; color: var(--color-text-muted); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem;
}
.btn-cerrar:hover { color: var(--color-text); }

.estado-info { color: var(--color-text-muted); font-size: 0.85rem; }
.nota { color: var(--color-text-faint); font-size: 0.76rem; line-height: 1.4; margin: 0 0 0.9rem; }
.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.82rem;
  margin: 0.75rem 0;
}

.lista-usuarios {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.usuario-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: white;
  flex-shrink: 0;
}

.usuario-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.usuario-nombre { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.usuario-rol { font-size: 0.74rem; color: var(--color-text-faint); }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge-activo { background: var(--color-success-subtle); color: var(--color-success); }
.badge-inactivo { background: var(--color-danger-subtle); color: var(--color-danger); }

.fila-acciones { display: flex; gap: 0.4rem; flex-wrap: wrap; flex-shrink: 0; }

.btn-mini {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-size: 0.78rem; font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.12s ease;
}
.btn-mini:hover { background: var(--color-accent); color: var(--color-text-on-accent); }
.btn-mini.peligroso { background: var(--color-danger-subtle); color: var(--color-danger); }
.btn-mini.peligroso:hover { background: var(--color-danger); color: var(--color-text-on-accent); }

.alerta {
  background: var(--color-warning-subtle);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}
.alerta-titulo {
  display: flex; align-items: center; gap: 0.4rem;
  margin: 0 0 0.35rem;
  font-size: 0.88rem; font-weight: 700;
  color: var(--color-warning);
}
.alerta-texto { margin: 0 0 0.6rem; font-size: 0.82rem; color: var(--color-text-muted); }
.alerta-lista { margin: 0; padding-left: 1.1rem; font-size: 0.82rem; color: var(--color-text); display: flex; flex-direction: column; gap: 0.2rem; }

.confirmar-texto { font-size: 0.9rem; color: var(--color-text); margin: 0 0 1rem; }

.acciones { display: flex; gap: 0.6rem; justify-content: flex-end; }

.btn-primario, .btn-secundario {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.12s ease;
}

.btn-primario {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}
.btn-primario:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-primario:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primario.peligroso { background: var(--color-danger); }
.btn-primario.peligroso:hover:not(:disabled) { background: var(--color-danger); opacity: 0.9; }

.btn-secundario {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.btn-secundario:hover:not(:disabled) { background: var(--color-surface-hover); }
.btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-cancelar {
  width: 100%;
  padding: 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.12s ease;
}
.btn-cancelar:hover { background: var(--color-surface-hover); }
</style>
