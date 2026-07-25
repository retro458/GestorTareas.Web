<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import type { TareaResponse } from '@/types'
import AppShell from '@/components/layout/AppShell.vue'
import { useTareasHub } from '@/composables/useTareasHub'
import { useEstados } from '@/composables/useEstados'
import IconRefresh from '@/components/icons/IconRefresh.vue'

const tareas = ref<TareaResponse[]>([])
const cargando = ref(false)
const errorCarga = ref<string | null>(null)
const actualizandoId = ref<number | null>(null)

const { notificaciones, quitarNotificacion } = useTareasHub(() => cargarTareas())
const { estados, cargarEstados } = useEstados()

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
    await cargarTareas()
  } catch (err: any) {
    alert(err.response?.data?.error ?? 'No se pudo actualizar el estado.')
  } finally {
    actualizandoId.value = null
  }
}

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
  cargarEstados()
})
</script>

<template>
  <AppShell titulo="Mis tareas" :notificaciones="notificaciones" @quitar-notificacion="quitarNotificacion">
    <div class="acciones">
      <button class="btn-secundario" @click="cargarTareas" :disabled="cargando">
        <IconRefresh :size="14" />
        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <p v-if="errorCarga" class="mensaje-error">{{ errorCarga }}</p>

    <div class="lista-tareas" v-if="tareas.length > 0">
      <div v-for="tarea in tareas" :key="tarea.id" class="tarea-card">
        <div class="tarea-info">
          <div class="tarea-titulo-fila">
            <h3>{{ tarea.titulo }}</h3>
            <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
            <span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span>
          </div>
          <p v-if="tarea.descripcion" class="tarea-descripcion">{{ tarea.descripcion }}</p>
          <div class="tarea-meta" v-if="tarea.fechaVencimiento">
            <span>Vence: {{ new Date(tarea.fechaVencimiento).toLocaleDateString() }}</span>
          </div>
        </div>

        <div class="tarea-accion">
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
        </div>
      </div>
    </div>
    <p v-else-if="!cargando" class="vacio">No tienes tareas asignadas por el momento.</p>
  </AppShell>
</template>

<style scoped>
.acciones { margin-bottom: 1.25rem; }

.btn-secundario {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);
  background: var(--color-surface); color: var(--color-text);
  font-size: 0.88rem; font-weight: 600; cursor: pointer;
  transition: background-color 0.12s ease;
}
.btn-secundario:hover:not(:disabled) { background: var(--color-surface-hover); }
.btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

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
</style>
