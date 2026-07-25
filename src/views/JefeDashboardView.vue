<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import type { TareaResponse, CrearTareaRequest } from '@/types'
import ModalReasignarTarea from '@/components/ModalReasignarTarea.vue'
import NotificacionesCampana from '@/components/NotificacionesCampana.vue'
import { useTareasHub } from '@/composables/useTareasHub'
const authStore = useAuthStore()

const tareas = ref<TareaResponse[]>([])
const cargando = ref(false)
const errorCarga = ref<string | null>(null)
const modalTareaId = ref<number | null>(null)
const modalTareaTitulo = ref('')

const { notificaciones, quitarNotificacion } = useTareasHub(() => cargarTareas())

function abrirModalReasignar(tarea: TareaResponse) {
  modalTareaId.value = tarea.id
  modalTareaTitulo.value = tarea.titulo
}

const totalTareas = computed(() => tareas.value.length)
const completadas = computed(() => tareas.value.filter(t => t.estado === 'Completada').length)
const enProgreso = computed(() => tareas.value.filter(t => t.estado === 'En Progreso').length)
const pendientes = computed(() => tareas.value.filter(t => t.estado === 'Pendiente').length)

const mostrarFormulario = ref(false)
const nuevaTarea = ref<CrearTareaRequest>({
  titulo: '', descripcion: '', asignadoA: 0, prioridadId: 2, fechaVencimiento: undefined
})
const creando = ref(false)
const errorCreacion = ref<string | null>(null)

const reasignandoId = ref<number | null>(null)
const nuevoEmpleadoId = ref<number | null>(null)

async function cargarTareas() {
  cargando.value = true
  errorCarga.value = null
  try {
    const { data } = await api.get<TareaResponse[]>('/tareas/obtener')
    tareas.value = data
  } catch {
    errorCarga.value = 'No se pudieron cargar las tareas.'
  } finally {
    cargando.value = false
  }
}

async function crearTarea() {
  creando.value = true
  errorCreacion.value = null
  try {
    await api.post('/tareas/crear', nuevaTarea.value)
    nuevaTarea.value = { titulo: '', descripcion: '', asignadoA: 0, prioridadId: 2, fechaVencimiento: undefined }
    mostrarFormulario.value = false
    await cargarTareas()
  } catch (err: any) {
    errorCreacion.value = err.response?.data?.error ?? 'No se pudo crear la tarea.'
  } finally {
    creando.value = false
  }
}

function abrirReasignacion(tareaId: number) {
  reasignandoId.value = tareaId
  nuevoEmpleadoId.value = null
}

async function confirmarReasignacion(tareaId: number) {
  if (!nuevoEmpleadoId.value) return
  try {
    await api.patch(`/tareas/${tareaId}/reasignar`, { nuevoAsignadoA: nuevoEmpleadoId.value })
    reasignandoId.value = null
    await cargarTareas()
  } catch (err: any) {
    alert(err.response?.data?.error ?? 'No se pudo reasignar la tarea.')
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
</script>

<template>
  <div class="fondo">
    <div class="contenedor">
      <header class="header">
        <div>
          <h1>Panel de {{ authStore.usuario?.rol }}</h1>
          <p class="bienvenida">Hola, {{ authStore.usuario?.nombre }} 👋</p>
        </div>
        <NotificacionesCampana :notificaciones="notificaciones" @quitar="quitarNotificacion" />
        <button class="btn-secundario" @click="cerrarSesion">Cerrar sesión</button>
      </header>

      <div class="kpis">
        <div class="kpi-card">
          <span class="kpi-icono">📋</span>
          <div><p class="kpi-numero">{{ totalTareas }}</p><p class="kpi-label">Total tareas</p></div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icono">✅</span>
          <div><p class="kpi-numero">{{ completadas }}</p><p class="kpi-label">Completadas</p></div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icono">▶️</span>
          <div><p class="kpi-numero">{{ enProgreso }}</p><p class="kpi-label">En progreso</p></div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icono">⏳</span>
          <div><p class="kpi-numero">{{ pendientes }}</p><p class="kpi-label">Pendientes</p></div>
        </div>
      </div>

      <div class="acciones">
        <button class="btn-primario" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : '+ Nueva tarea' }}
        </button>
        <button class="btn-secundario" @click="cargarTareas" :disabled="cargando">
          {{ cargando ? 'Actualizando...' : '↻ Actualizar' }}
        </button>
      </div>

      <form v-if="mostrarFormulario" class="form-tarea" @submit.prevent="crearTarea">
        <div class="campo">
          <label>Título</label>
          <input v-model="nuevaTarea.titulo" required placeholder="Ej. Auditar finanzas empresa X" />
        </div>
        <div class="campo">
          <label>Descripción</label>
          <textarea v-model="nuevaTarea.descripcion" rows="2" placeholder="Detalles de la tarea..."></textarea>
        </div>
        <div class="fila">
          <div class="campo">
            <label>ID del empleado asignado</label>
            <input v-model.number="nuevaTarea.asignadoA" type="number" required placeholder="Ej. 3" />
          </div>
          <div class="campo">
            <label>Prioridad</label>
            <select v-model.number="nuevaTarea.prioridadId">
              <option :value="1">Baja</option>
              <option :value="2">Media</option>
              <option :value="3">Alta</option>
            </select>
          </div>
          <div class="campo">
            <label>Fecha límite</label>
            <input v-model="nuevaTarea.fechaVencimiento" type="date" />
          </div>
        </div>
        <p v-if="errorCreacion" class="mensaje-error">{{ errorCreacion }}</p>
        <button type="submit" class="btn-primario" :disabled="creando">
          {{ creando ? 'Creando...' : 'Crear y asignar tarea' }}
        </button>
      </form>

      <p v-if="errorCarga" class="mensaje-error">{{ errorCarga }}</p>

      <div class="tabla-wrapper" v-if="tareas.length > 0">
        <table class="tabla-tareas">
          <thead>
            <tr>
              <th>Título</th><th>Asignado a</th><th>Estado</th><th>Prioridad</th><th>Vencimiento</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tarea in tareas" :key="tarea.id">
              <td>{{ tarea.titulo }}</td>
              <td>{{ tarea.asignadoANombre }}</td>
              <td><span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span></td>
              <td>{{ tarea.prioridad }}</td>
              <td>{{ tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleDateString() : '—' }}</td>
              <td>
                <div v-if="reasignandoId === tarea.id" class="reasignar-inline">
                  <input v-model.number="nuevoEmpleadoId" type="number" placeholder="ID" class="input-reasignar" />
                  <button class="btn-mini btn-confirmar" @click="confirmarReasignacion(tarea.id)">✓</button>
                  <button class="btn-mini btn-cancelar" @click="reasignandoId = null">✕</button>
                </div>
                <button class="btn-mini" @click="abrirModalReasignar(tarea)">Reasignar</button>
                <ModalReasignarTarea
                v-if="modalTareaId"
                :tarea-id="modalTareaId"
                :titulo-tarea="modalTareaTitulo"
                @cerrar="modalTareaId = null"
                @reasignado="() => { modalTareaId = null; cargarTareas() }"
                />
                <span v-else class="texto-tenue">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="!cargando" class="vacio">No hay tareas registradas todavía.</p>
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

.contenedor { max-width: 1100px; margin: 0 auto; }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
h1 { margin: 0; font-size: 1.4rem; color: #f3f4f6; }
.bienvenida { margin: 0.15rem 0 0; color: #9ca3af; font-size: 0.9rem; }

.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }

.kpi-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex; align-items: center; gap: 0.75rem;
}
.kpi-icono { font-size: 1.5rem; }
.kpi-numero { margin: 0; font-size: 1.4rem; font-weight: 700; color: #f3f4f6; }
.kpi-label { margin: 0; font-size: 0.75rem; color: #9ca3af; }

.acciones { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }

.btn-primario, .btn-secundario, .btn-mini {
  padding: 0.55rem 1rem; border-radius: 8px; border: none;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.btn-primario { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
.btn-secundario {
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-primario:disabled, .btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.form-tarea {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.campo { margin-bottom: 0.9rem; display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #9ca3af; }
.campo input, .campo textarea, .campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  font-size: 0.9rem;
  font-family: inherit;
}
.campo input:focus, .campo textarea:focus, .campo select:focus {
  outline: none; border-color: #6366f1;
}

.fila { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.mensaje-error { color: #f87171; font-size: 0.85rem; }
.vacio { color: #6b7280; text-align: center; padding: 2rem 0; }

.tabla-wrapper {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.tabla-tareas { width: 100%; border-collapse: collapse; }
.tabla-tareas th {
  text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: #9ca3af; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.02);
}
.tabla-tareas td {
  padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.88rem; color: #e5e7eb;
}
.tabla-tareas tr:last-child td { border-bottom: none; }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.badge-pendiente { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.badge-progreso { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
.badge-completada { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.badge-cancelada { background: rgba(248, 113, 113, 0.15); color: #f87171; }

.btn-mini { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 0.3rem 0.6rem; font-size: 0.8rem; }
.reasignar-inline { display: flex; gap: 0.35rem; align-items: center; }
.input-reasignar {
  width: 60px; padding: 0.3rem 0.4rem; border-radius: 6px; font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.04); color: #e5e7eb;
}
.btn-confirmar { background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.3rem 0.5rem; }
.btn-cancelar { background: rgba(248, 113, 113, 0.15); color: #f87171; padding: 0.3rem 0.5rem; }
.texto-tenue { color: #6b7280; font-size: 0.85rem; }
</style>