<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import type { TareaResponse, AutoasignarTareaRequest } from '@/types'
import { ROLES } from '@/types'
import AppShell from '@/components/layout/AppShell.vue'
import ModalDetalleTarea from '@/components/ModalDetalleTarea.vue'
import BadgeAtraso from '@/components/BadgeAtraso.vue'
import { useTareasHub } from '@/composables/useTareasHub'
import { useEstados } from '@/composables/useEstados'
import { useMisDepartamentos } from '@/composables/useMisDepartamentos'
import { useAuthStore } from '@/stores/auth'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import IconEye from '@/components/icons/IconEye.vue'

const tareas = ref<TareaResponse[]>([])
const cargando = ref(false)
const errorCarga = ref<string | null>(null)
const actualizandoId = ref<number | null>(null)

const pestanaActiva = ref<'activas' | 'completadas'>('activas')
const tareasCompletadas = ref<TareaResponse[]>([])
const cargandoCompletadas = ref(false)
const errorCompletadas = ref<string | null>(null)
const tareaDetalleSeleccionada = ref<TareaResponse | null>(null)

const { notificaciones, quitarNotificacion, eventoComentario } = useTareasHub(() => { cargarTareas(); cargarCompletadas() })
const { estados, cargarEstados } = useEstados()
const { misDepartamentos, cargarMisDepartamentos } = useMisDepartamentos()
const authStore = useAuthStore()

const esEmpleado = computed(() => authStore.usuario?.rol === ROLES.EMPLEADO)

const mostrarFormularioAutoasignar = ref(false)
const nuevaTareaAutoasignada = ref<AutoasignarTareaRequest>({
  titulo: '', descripcion: '', departamentoId: 0, prioridadId: 2, fechaVencimiento: undefined
})
const autoasignando = ref(false)
const errorAutoasignar = ref<string | null>(null)

async function autoasignarTarea() {
  autoasignando.value = true
  errorAutoasignar.value = null
  try {
    await api.post('/tareas/autoasignar', nuevaTareaAutoasignada.value)
    nuevaTareaAutoasignada.value = { titulo: '', descripcion: '', departamentoId: 0, prioridadId: 2, fechaVencimiento: undefined }
    mostrarFormularioAutoasignar.value = false
    // No hacemos refetch manual: el backend emite "TareaActualizada" por SignalR
    // y el listener ya montado arriba (useTareasHub) se encarga de recargar la lista.
  } catch (err: any) {
    errorAutoasignar.value = err.response?.data?.error ?? 'No se pudo crear la tarea.'
  } finally {
    autoasignando.value = false
  }
}

// Un empleado no cancela sus propias tareas, eso queda a criterio de Jefe/Encargado
const estadosDisponibles = computed(() => estados.value.filter(e => e.nombre !== 'Cancelada'))

async function cargarTareas() {
  cargando.value = true
  errorCarga.value = null
  try {
    const { data } = await api.get<TareaResponse[]>('/tareas/obtener')
    tareas.value = data
  } catch {
    errorCarga.value = 'No se pudieron cargar tus tareas.'
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(tareaId: number, estadoId: number) {
  actualizandoId.value = tareaId
  try {
    await api.patch(`/tareas/${tareaId}/estado`, { estadoId })
    await Promise.all([cargarTareas(), cargarCompletadas()])
  } catch (err: any) {
    alert(err.response?.data?.error ?? 'No se pudo actualizar el estado.')
  } finally {
    actualizandoId.value = null
  }
}

async function cargarCompletadas() {
  cargandoCompletadas.value = true
  errorCompletadas.value = null
  try {
    const { data } = await api.get<TareaResponse[]>('/tareas/completadas')
    tareasCompletadas.value = data
  } catch {
    errorCompletadas.value = 'No se pudieron cargar las tareas completadas.'
  } finally {
    cargandoCompletadas.value = false
  }
}

async function actualizarTodo() {
  await Promise.all([cargarTareas(), cargarCompletadas()])
}

const tareasActivasMostradas = computed(() => tareas.value.filter(t => t.estado !== 'Completada'))
const tareasMostradas = computed(() => pestanaActiva.value === 'activas' ? tareasActivasMostradas.value : tareasCompletadas.value)

function colorEstado(estado: string) {
  switch (estado) {
    case 'Pendiente': return 'badge-pendiente'
    case 'En Progreso': return 'badge-progreso'
    case 'En Revisión': return 'badge-revision'
    case 'Completada': return 'badge-completada'
    case 'Cancelada': return 'badge-cancelada'
    default: return ''
  }
}

function colorPrioridad(prioridad: string) {
  switch (prioridad) {
    case 'Baja': return 'badge-baja'
    case 'Media': return 'badge-media'
    case 'Alta': return 'badge-alta'
    default: return ''
  }
}

function esEstadoFinal(estado: string) {
  return estado === 'Completada' || estado === 'Cancelada'
}

onMounted(() => {
  cargarTareas()
  cargarCompletadas()
  cargarEstados()
  cargarMisDepartamentos()
})
</script>

<template>
  <AppShell titulo="Mis tareas" :notificaciones="notificaciones" @quitar-notificacion="quitarNotificacion">
    <div class="acciones">
      <button v-if="esEmpleado" class="btn-primario" @click="mostrarFormularioAutoasignar = !mostrarFormularioAutoasignar">
        {{ mostrarFormularioAutoasignar ? 'Cancelar' : '+ Nueva tarea' }}
      </button>
      <button class="btn-secundario" @click="actualizarTodo" :disabled="cargando || cargandoCompletadas">
        <IconRefresh :size="14" />
        {{ (cargando || cargandoCompletadas) ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <form v-if="esEmpleado && mostrarFormularioAutoasignar" class="form-tarea" @submit.prevent="autoasignarTarea">
      <div class="campo">
        <label>Título</label>
        <input v-model="nuevaTareaAutoasignada.titulo" required placeholder="Ej. Actualizar reporte semanal" />
      </div>
      <div class="campo">
        <label>Descripción</label>
        <textarea v-model="nuevaTareaAutoasignada.descripcion" rows="2" placeholder="Detalles de la tarea..."></textarea>
      </div>
      <div class="fila">
        <div class="campo">
          <label>Departamento</label>
          <select v-model.number="nuevaTareaAutoasignada.departamentoId" required>
            <option :value="0" disabled>Selecciona un departamento</option>
            <option v-for="depto in misDepartamentos" :key="depto.id" :value="depto.id">
              {{ depto.nombre }}
            </option>
          </select>
        </div>
        <div class="campo">
          <label>Prioridad</label>
          <select v-model.number="nuevaTareaAutoasignada.prioridadId">
            <option :value="1">Baja</option>
            <option :value="2">Media</option>
            <option :value="3">Alta</option>
          </select>
        </div>
        <div class="campo">
          <label>Fecha límite</label>
          <input v-model="nuevaTareaAutoasignada.fechaVencimiento" type="date" />
        </div>
      </div>
      <p v-if="errorAutoasignar" class="mensaje-error">{{ errorAutoasignar }}</p>
      <button type="submit" class="btn-primario" :disabled="autoasignando">
        {{ autoasignando ? 'Creando...' : 'Autoasignarme la tarea' }}
      </button>
    </form>

    <div class="tabs">
      <button class="tab" :class="{ 'tab-activa': pestanaActiva === 'activas' }" @click="pestanaActiva = 'activas'">
        Activas
      </button>
      <button class="tab" :class="{ 'tab-activa': pestanaActiva === 'completadas' }" @click="pestanaActiva = 'completadas'">
        Completadas
      </button>
    </div>

    <p v-if="pestanaActiva === 'activas' && errorCarga" class="mensaje-error">{{ errorCarga }}</p>
    <p v-if="pestanaActiva === 'completadas' && errorCompletadas" class="mensaje-error">{{ errorCompletadas }}</p>

    <div class="lista-tareas" v-if="tareasMostradas.length > 0">
      <div v-for="tarea in tareasMostradas" :key="tarea.id" class="tarea-card">
        <div class="tarea-info">
          <div class="tarea-titulo-fila">
            <h3>{{ tarea.titulo }}</h3>
            <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
            <span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span>
            <BadgeAtraso :dias-atraso="tarea.diaAtraso" />
          </div>
          <p v-if="tarea.descripcion" class="tarea-descripcion">{{ tarea.descripcion }}</p>
          <div class="tarea-meta" v-if="tarea.fechaVencimiento">
            <span>Vence: {{ new Date(tarea.fechaVencimiento).toLocaleDateString() }}</span>
          </div>
        </div>

        <div class="tarea-accion">
          <button class="btn-mini" @click="tareaDetalleSeleccionada = tarea">
            <IconEye :size="13" />
            Detalle
          </button>
          <template v-if="pestanaActiva === 'activas'">
            <label>Actualizar estado</label>
            <select
              :value="estados.find(e => e.nombre === tarea.estado)?.id"
              :disabled="actualizandoId === tarea.id || esEstadoFinal(tarea.estado)"
              @change="cambiarEstado(tarea.id, Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="estado in estadosDisponibles" :key="estado.id" :value="estado.id">
                {{ estado.nombre }}
              </option>
            </select>
          </template>
        </div>
      </div>
    </div>
    <p v-else-if="!(pestanaActiva === 'activas' ? cargando : cargandoCompletadas)" class="vacio">
      {{ pestanaActiva === 'activas' ? 'No tienes tareas activas por el momento.' : 'Todavía no tienes tareas completadas.' }}
    </p>

    <ModalDetalleTarea
      v-if="tareaDetalleSeleccionada"
      :tarea="tareaDetalleSeleccionada"
      :evento-comentario="eventoComentario"
      @cerrar="tareaDetalleSeleccionada = null"
    />
  </AppShell>
</template>

<style scoped>
.acciones { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }

.btn-primario, .btn-secundario {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1rem; border-radius: var(--radius-sm); border: 1px solid transparent;
  font-size: 0.88rem; font-weight: 600; cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}
.btn-primario { background: var(--color-accent); color: var(--color-text-on-accent); }
.btn-primario:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-secundario {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn-secundario:hover:not(:disabled) { background: var(--color-surface-hover); }
.btn-primario:disabled, .btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.form-tarea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.campo { margin-bottom: 0.9rem; display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-text-muted); }
.campo input, .campo textarea, .campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
}
.campo input:focus, .campo textarea:focus, .campo select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.fila { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }

.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.82rem;
  margin-bottom: 1rem;
}
.vacio { color: var(--color-text-faint); text-align: center; padding: 2rem 0; }

.tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--color-border); }
.tab {
  padding: 0.6rem 0.9rem;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: inherit;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.tab:hover { color: var(--color-text); }
.tab-activa { color: var(--color-accent); border-bottom-color: var(--color-accent); }

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

.lista-tareas { display: flex; flex-direction: column; gap: 0.75rem; }

.tarea-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.12s ease;
}
.tarea-card:hover { border-color: var(--color-border-strong); }

.tarea-info { flex: 1; min-width: 0; }

.tarea-titulo-fila { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
.tarea-titulo-fila h3 { margin: 0; font-size: 0.98rem; color: var(--color-text); }

.tarea-descripcion { margin: 0.4rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }

.tarea-meta {
  display: flex; gap: 1rem; margin-top: 0.5rem;
  font-size: 0.78rem; color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
}

.tarea-accion {
  display: flex; flex-direction: column; gap: 0.3rem;
  min-width: 150px;
}
.tarea-accion label {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-text-muted);
}
.tarea-accion select {
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
}
.tarea-accion select:disabled { opacity: 0.6; cursor: not-allowed; }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge-pendiente { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-progreso { background: var(--color-info-subtle); color: var(--color-info); }
.badge-revision { background: var(--color-highlight-subtle); color: var(--color-highlight); }
.badge-completada { background: var(--color-success-subtle); color: var(--color-success); }
.badge-cancelada { background: var(--color-danger-subtle); color: var(--color-danger); }

.badge-baja { background: var(--color-surface-sunken); color: var(--color-text-muted); }
.badge-media { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-alta { background: var(--color-danger-subtle); color: var(--color-danger); }

@media (max-width: 560px) {
  .tarea-card {
    flex-direction: column;
    align-items: stretch;
  }
  .tarea-accion {
    min-width: 0;
    width: 100%;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
  .tarea-accion select {
    flex: 1;
    min-width: 120px;
  }
}
</style>
