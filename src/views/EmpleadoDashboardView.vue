<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import type { TareaResponse } from '@/types'

const authStore = useAuthStore()

const tareas = ref<TareaResponse[]>([])
const cargando = ref(false)
const errorCarga = ref<string | null>(null)
const actualizandoId = ref<number | null>(null)

// Ajusta estos IDs a los reales de tu tabla Estados
const ESTADOS = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'En Progreso' },
  { id: 3, nombre: 'Completada' }
]

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
    case 'Completada': return 'badge-completada'
    case 'Cancelada': return 'badge-cancelada'
    default: return ''
  }
}

async function cerrarSesion() {
  await authStore.logout()
  window.location.href = '/login'
}

onMounted(cargarTareas)

// NOTA: aqui es donde conectas useTareasHub() para escuchar "NuevaNotificacion"
// (ej. cuando el jefe/encargado te reasigna o asigna una tarea nueva) y
// refrescar la lista automaticamente sin que el empleado tenga que recargar.
</script>

<template>
  <div class="fondo">
    <div class="contenedor">
      <header class="header">
        <div>
          <h1>Mis tareas</h1>
          <p class="bienvenida">Hola, {{ authStore.usuario?.nombre }} 👋</p>
        </div>
        <button class="btn-secundario" @click="cerrarSesion">Cerrar sesión</button>
      </header>

      <div class="acciones">
        <button class="btn-secundario" @click="cargarTareas" :disabled="cargando">
          {{ cargando ? 'Actualizando...' : '↻ Actualizar' }}
        </button>
      </div>

      <p v-if="errorCarga" class="mensaje-error">{{ errorCarga }}</p>

      <div class="lista-tareas" v-if="tareas.length > 0">
        <div v-for="tarea in tareas" :key="tarea.id" class="tarea-card">
          <div class="tarea-info">
            <div class="tarea-titulo-fila">
              <h3>{{ tarea.titulo }}</h3>
              <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
            </div>
            <p v-if="tarea.descripcion" class="tarea-descripcion">{{ tarea.descripcion }}</p>
            <div class="tarea-meta">
              <span>Prioridad: {{ tarea.prioridad }}</span>
              <span v-if="tarea.fechaVencimiento">
                Vence: {{ new Date(tarea.fechaVencimiento).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <div class="tarea-accion">
            <label>Actualizar estado</label>
            <select
              :value="ESTADOS.find(e => e.nombre === tarea.estado)?.id"
              :disabled="actualizandoId === tarea.id || tarea.estado === 'Completada'"
              @change="cambiarEstado(tarea.id, Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="estado in ESTADOS" :key="estado.id" :value="estado.id">
                {{ estado.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <p v-else-if="!cargando" class="vacio">No tienes tareas asignadas por el momento.</p>
    </div>
  </div>
</template>

<style scoped>
.fondo {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12), transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(34, 211, 238, 0.1), transparent 40%),
              radial-gradient(circle at top, #1e1b4b 0%, #0f0e1a 60%);
  padding: 2rem 1rem;
  color: #e5e7eb;
  font-family: system-ui, sans-serif;
}

.contenedor { max-width: 800px; margin: 0 auto; }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1 { margin: 0; font-size: 1.4rem; color: #f3f4f6; }
.bienvenida { margin: 0.15rem 0 0; color: #9ca3af; font-size: 0.9rem; }

.acciones { margin-bottom: 1.25rem; }

.btn-secundario {
  padding: 0.55rem 1rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06); color: #e5e7eb;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.mensaje-error { color: #f87171; font-size: 0.85rem; }
.vacio { color: #6b7280; text-align: center; padding: 2rem 0; }

.lista-tareas { display: flex; flex-direction: column; gap: 0.9rem; }

.tarea-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tarea-info { flex: 1; min-width: 0; }

.tarea-titulo-fila { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
.tarea-titulo-fila h3 { margin: 0; font-size: 1rem; color: #f3f4f6; }

.tarea-descripcion { margin: 0.4rem 0 0; font-size: 0.85rem; color: #9ca3af; }

.tarea-meta {
  display: flex; gap: 1rem; margin-top: 0.5rem;
  font-size: 0.78rem; color: #6b7280;
}

.tarea-accion {
  display: flex; flex-direction: column; gap: 0.3rem;
  min-width: 140px;
}
.tarea-accion label {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; color: #9ca3af;
}
.tarea-accion select {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  font-size: 0.85rem;
}
.tarea-accion select:disabled { opacity: 0.6; cursor: not-allowed; }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.badge-pendiente { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.badge-progreso { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.badge-completada { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.badge-cancelada { background: rgba(248, 113, 113, 0.15); color: #f87171; }
</style>