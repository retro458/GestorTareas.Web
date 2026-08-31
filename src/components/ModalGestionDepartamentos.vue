<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import type { DepartamentoResponse } from '@/types'
import IconX from '@/components/icons/IconX.vue'
import IconPower from '@/components/icons/IconPower.vue'
import ModalEditarDepartamento from '@/components/ModalEditarDepartamento.vue'

const emit = defineEmits<{
  cerrar: []
}>()

const departamentos = ref<DepartamentoResponse[]>([])
const cargando = ref(false)
const errorLista = ref<string | null>(null)

const departamentoSeleccionado = ref<DepartamentoResponse | null>(null)
const departamentoEditando = ref<DepartamentoResponse | null>(null)
const accionSeleccionada = ref<'activar' | 'desactivar'>('activar')
const procesando = ref(false)
const error = ref<string | null>(null)

// GET /departamento/obtener no llena el campo "activo" (siempre viene false),
// asi que el estado real se calcula cruzando esa lista con GET /departamento/inactivos,
// que si lo refleja correctamente.
async function cargarDepartamentos() {
  cargando.value = true
  errorLista.value = null
  try {
    const [todos, inactivos] = await Promise.all([
      api.get<DepartamentoResponse[]>('/departamento/obtener'),
      api.get<DepartamentoResponse[]>('/departamento/inactivos')
    ])
    const idsInactivos = new Set(inactivos.data.map(d => d.id))
    departamentos.value = todos.data.map(d => ({ ...d, activo: !idsInactivos.has(d.id) }))
  } catch {
    errorLista.value = 'No se pudieron cargar los departamentos.'
  } finally {
    cargando.value = false
  }
}

function abrirConfirmacion(depto: DepartamentoResponse, accion: 'activar' | 'desactivar') {
  departamentoSeleccionado.value = depto
  accionSeleccionada.value = accion
  error.value = null
}

function cancelarConfirmacion() {
  departamentoSeleccionado.value = null
  error.value = null
}

async function confirmar() {
  if (!departamentoSeleccionado.value) return
  procesando.value = true
  error.value = null
  try {
    await api.patch(`/departamento/${departamentoSeleccionado.value.id}/${accionSeleccionada.value}`)
    departamentoSeleccionado.value = null
    await cargarDepartamentos()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? `No se pudo ${accionSeleccionada.value} el departamento.`
  } finally {
    procesando.value = false
  }
}

onMounted(cargarDepartamentos)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Gestionar departamentos</h2>
          <p class="subtitulo">Activa o desactiva departamentos de la organización</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <template v-if="!departamentoSeleccionado">
        <p v-if="cargando" class="estado-info">Cargando departamentos...</p>
        <p v-if="errorLista" class="mensaje-error">{{ errorLista }}</p>

        <div v-if="!cargando && departamentos.length > 0" class="lista-deptos">
          <div v-for="depto in departamentos" :key="depto.id" class="depto-item">
            <span class="depto-info">
              <span class="depto-nombre">{{ depto.nombre }}</span>
              <span v-if="depto.descripcion" class="depto-descripcion">{{ depto.descripcion }}</span>
            </span>
            <span class="badge" :class="depto.activo ? 'badge-activo' : 'badge-inactivo'">
              {{ depto.activo ? 'Activo' : 'Inactivo' }}
            </span>
            <span class="fila-acciones">
              <button type="button" class="btn-mini" @click="departamentoEditando = depto">
                Editar
              </button>
              <button
                type="button"
                class="btn-mini"
                :class="{ peligroso: depto.activo }"
                @click="abrirConfirmacion(depto, depto.activo ? 'desactivar' : 'activar')"
              >
                <IconPower :size="13" />
                {{ depto.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </span>
          </div>
        </div>
        <p v-else-if="!cargando" class="estado-info">No hay departamentos para mostrar.</p>

        <button class="btn-cancelar" @click="emit('cerrar')">Cerrar</button>
      </template>

      <template v-else>
        <p class="confirmar-texto">
          ¿Seguro que deseas {{ accionSeleccionada === 'activar' ? 'activar' : 'desactivar' }} el departamento
          <strong>{{ departamentoSeleccionado.nombre }}</strong>?
        </p>

        <p v-if="error" class="mensaje-error">{{ error }}</p>

        <div class="acciones">
          <button type="button" class="btn-secundario" @click="cancelarConfirmacion" :disabled="procesando">Cancelar</button>
          <button
            type="button"
            class="btn-primario"
            :class="{ peligroso: accionSeleccionada === 'desactivar' }"
            :disabled="procesando"
            @click="confirmar"
          >
            {{ procesando ? 'Procesando...' : (accionSeleccionada === 'activar' ? 'Activar' : 'Desactivar') }}
          </button>
        </div>
      </template>

      <ModalEditarDepartamento
        v-if="departamentoEditando"
        :departamento="departamentoEditando"
        @cerrar="departamentoEditando = null"
        @editado="() => { departamentoEditando = null; cargarDepartamentos() }"
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

.lista-deptos {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.depto-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.depto-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.depto-nombre { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.depto-descripcion { font-size: 0.76rem; color: var(--color-text-faint); }

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
