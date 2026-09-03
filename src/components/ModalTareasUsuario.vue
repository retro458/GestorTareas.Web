<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import type { TareasPorUsuarioResponse } from '@/types'
import BadgeAtraso from '@/components/BadgeAtraso.vue'
import IconX from '@/components/icons/IconX.vue'

const props = defineProps<{
  usuarioId: number
  usuarioNombre: string
}>()

const emit = defineEmits<{
  cerrar: []
}>()

const datos = ref<TareasPorUsuarioResponse | null>(null)
const cargando = ref(false)
const error = ref<string | null>(null)

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const { data } = await api.get<TareasPorUsuarioResponse>(`/tareas/usuario/${props.usuarioId}`)
    datos.value = data
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudieron cargar las tareas de este usuario.'
  } finally {
    cargando.value = false
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

onMounted(cargar)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Tareas de {{ usuarioNombre }}</h2>
          <p class="subtitulo">Tareas asignadas a este usuario</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <p v-if="cargando" class="estado-info">Cargando tareas...</p>
      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <template v-if="datos && !cargando && !error">
        <p class="etiqueta-seccion">Asignadas ({{ datos.asignadas.length }})</p>
        <div v-if="datos.asignadas.length > 0" class="lista-tareas">
          <div v-for="tarea in datos.asignadas" :key="tarea.id" class="tarea-item">
            <div class="tarea-item-titulo">
              {{ tarea.titulo }}
              <BadgeAtraso :dias-atraso="tarea.diaAtraso" :estado="tarea.estado" />
            </div>
            <p v-if="tarea.descripcion" class="tarea-item-descripcion">{{ tarea.descripcion }}</p>
            <div class="tarea-item-meta">
              <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
              <span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span>
              <span v-if="tarea.fechaVencimiento" class="tarea-item-fecha">
                Vence: {{ new Date(tarea.fechaVencimiento).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
        <p v-else class="estado-info">No tiene tareas asignadas.</p>
      </template>

      <button class="btn-cancelar" @click="emit('cerrar')">Cerrar</button>
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

@media (max-width: 480px) {
  .modal { padding: 1.1rem; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--color-text-muted); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem; flex-shrink: 0;
}
.btn-cerrar:hover { color: var(--color-text); }

.estado-info { color: var(--color-text-muted); font-size: 0.85rem; }
.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
}

.etiqueta-seccion {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-text-faint); margin: 1.25rem 0 0.75rem;
}
.etiqueta-seccion:first-of-type { margin-top: 0; }

.lista-tareas { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.5rem; }

.tarea-item {
  padding: 0.6rem 0.7rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.tarea-item-titulo {
  font-size: 0.86rem; font-weight: 500; color: var(--color-text);
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  margin-bottom: 0.3rem;
}
.tarea-item-descripcion {
  margin: 0 0 0.4rem; font-size: 0.78rem; color: var(--color-text-muted);
}
.tarea-item-meta {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  font-size: 0.76rem; color: var(--color-text-faint);
}
.tarea-item-fecha { font-variant-numeric: tabular-nums; }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge-pendiente { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-progreso { background: var(--color-info-subtle); color: var(--color-info); }
.badge-revision { background: var(--color-highlight-subtle); color: var(--color-highlight); }
.badge-completada { background: var(--color-success-subtle); color: var(--color-success); }
.badge-cancelada { background: var(--color-danger-subtle); color: var(--color-danger); }

.badge-baja { background: var(--color-surface-sunken); color: var(--color-text-muted); }
.badge-media { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-alta { background: var(--color-danger-subtle); color: var(--color-danger); }

.btn-cancelar {
  width: 100%;
  padding: 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  transition: background-color 0.12s ease;
}
.btn-cancelar:hover { background: var(--color-surface-hover); }
</style>
