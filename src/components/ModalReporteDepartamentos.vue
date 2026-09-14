<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/api/axios'
import type { ReporteDepartamento, TareaResponse, EventoComentario, ConteoPorEstado } from '@/types'
import BadgeAtraso from '@/components/BadgeAtraso.vue'
import IconX from '@/components/icons/IconX.vue'
import PanelDetalleTarea from '@/components/PanelDetalleTarea.vue'
import { useDepartamentos } from '@/composables/useDepartamentos'

defineProps<{
  eventoComentario?: EventoComentario | null
}>()

const emit = defineEmits<{
  cerrar: []
}>()

const { departamentos, cargarDepartamentos } = useDepartamentos()

// El reporte no trae la descripcion del departamento; la sacamos del listado
// completo de /departamento/obtener y la cruzamos por id. Un Encargado recibe
// ahi todos los departamentos (no solo los suyos), pero eso no importa: solo
// se usa como diccionario para los departamentos que el reporte ya filtro.
function descripcionDepartamento(departamentoId: number) {
  return departamentos.value.find(d => d.id === departamentoId)?.descripcion ?? null
}

const reporte = ref<ReporteDepartamento[]>([])
const cargando = ref(false)
const error = ref<string | null>(null)
// Mismas pestanas que el panel de tareas. Se pide el reporte con filtro=todas
// una sola vez y cada pestana filtra en el cliente, asi cambiar de pestana es
// instantaneo y los contadores de todas las pestanas salen de la misma carga.
type Pestana = 'pendientes' | 'progreso' | 'completadas' | 'otras'
const pestanaActiva = ref<Pestana>('pendientes')
const departamentoFiltroId = ref<number | null>(null)
const empleadoFiltroId = ref<number | null>(null)
const deptosExpandidos = ref<Set<number>>(new Set())
const tareaPanelSeleccionada = ref<TareaResponse | null>(null)

// Las opciones del filtro salen de lo que ya devolvio el backend: para un
// Encargado eso ya viene limitado a sus propios departamentos, asi que el
// filtro nunca ofrece departamentos a los que no tiene acceso.
const reportePorDepartamento = computed(() =>
  departamentoFiltroId.value === null
    ? reporte.value
    : reporte.value.filter(d => d.departamentoId === departamentoFiltroId.value)
)

// Igual que con los departamentos, los empleados salen de las tareas del propio
// reporte (asignadoA), asi un Encargado solo ve gente de sus departamentos y la
// lista se acota al departamento elegido.
const empleadosDelReporte = computed(() => {
  const nombres = new Map<number, string>()
  for (const t of reportePorDepartamento.value.flatMap(d => d.tareas)) {
    nombres.set(t.asignadoA, t.asignadoANombre)
  }
  return [...nombres]
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
})

// Si al cambiar de departamento el empleado elegido ya no tiene tareas ahi,
// volvemos a "Todos" en vez de dejar un filtro invisible que vacia el reporte.
watch(empleadosDelReporte, lista => {
  if (empleadoFiltroId.value !== null && !lista.some(e => e.id === empleadoFiltroId.value)) {
    empleadoFiltroId.value = null
  }
})

// Con un empleado elegido solo quedan sus tareas, y se ocultan los departamentos
// donde no tiene ninguna (en cualquier estado) para no llenar la vista de vacios.
const reporteFiltrado = computed(() => {
  const empleadoId = empleadoFiltroId.value
  if (empleadoId === null) return reportePorDepartamento.value
  return reportePorDepartamento.value
    .map(depto => ({ ...depto, tareas: depto.tareas.filter(t => t.asignadoA === empleadoId) }))
    .filter(depto => depto.tareas.length > 0)
})

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const { data } = await api.get<ReporteDepartamento[]>('/tareas/reporte-departamentos', {
      params: { filtro: 'todas' }
    })
    reporte.value = data
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo cargar el reporte por departamentos.'
  } finally {
    cargando.value = false
  }
}

function alternarExpandido(departamentoId: number) {
  if (deptosExpandidos.value.has(departamentoId)) {
    deptosExpandidos.value.delete(departamentoId)
  } else {
    deptosExpandidos.value.add(departamentoId)
  }
  // forzar reactividad: Set no dispara actualizaciones al mutar in-place
  deptosExpandidos.value = new Set(deptosExpandidos.value)
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

const ESTADOS_PRINCIPALES = ['Pendiente', 'En Progreso', 'Completada']

function perteneceAPestana(estado: string, pestana: Pestana) {
  switch (pestana) {
    case 'pendientes': return estado === 'Pendiente'
    case 'progreso': return estado === 'En Progreso'
    case 'completadas': return estado === 'Completada'
    case 'otras': return !ESTADOS_PRINCIPALES.includes(estado)
  }
}

function desglose(tareas: TareaResponse[]): ConteoPorEstado[] {
  const conteos = new Map<string, number>()
  for (const t of tareas) conteos.set(t.estado, (conteos.get(t.estado) ?? 0) + 1)
  return [...conteos].map(([estado, cantidad]) => ({ estado, cantidad }))
}

// Cada departamento con sus tareas, total y desglose recalculados para la pestana activa.
const deptosPestana = computed(() =>
  reporteFiltrado.value.map(depto => {
    const tareas = depto.tareas.filter(t => perteneceAPestana(t.estado, pestanaActiva.value))
    return { ...depto, tareas, total: tareas.length, desglosePorEstado: desglose(tareas) }
  })
)

const conteoPorPestana = computed(() => {
  const tareas = reporteFiltrado.value.flatMap(d => d.tareas)
  const contar = (pestana: Pestana) => tareas.filter(t => perteneceAPestana(t.estado, pestana)).length
  return {
    pendientes: contar('pendientes'),
    progreso: contar('progreso'),
    completadas: contar('completadas'),
    otras: contar('otras')
  }
})

const totalGeneral = computed(() => conteoPorPestana.value[pestanaActiva.value])

onMounted(() => {
  cargar()
  cargarDepartamentos()
})
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Reporte por departamentos</h2>
          <p class="subtitulo">Total de tareas y desglose por estado en cada departamento</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="fila-filtros">
        <div class="campo campo-filtro">
          <label>Departamento</label>
          <select v-model.number="departamentoFiltroId">
            <option :value="null">Todos los departamentos</option>
            <option v-for="depto in reporte" :key="depto.departamentoId" :value="depto.departamentoId">
              {{ depto.departamentoNombre }}
            </option>
          </select>
        </div>
        <div class="campo campo-filtro">
          <label>Empleado</label>
          <select v-model.number="empleadoFiltroId">
            <option :value="null">Todos los empleados</option>
            <option v-for="empleado in empleadosDelReporte" :key="empleado.id" :value="empleado.id">
              {{ empleado.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="tabs">
        <button class="tab" :class="{ 'tab-activa': pestanaActiva === 'pendientes' }" @click="pestanaActiva = 'pendientes'">
          Pendientes <span class="tab-conteo">{{ conteoPorPestana.pendientes }}</span>
        </button>
        <button class="tab" :class="{ 'tab-activa': pestanaActiva === 'progreso' }" @click="pestanaActiva = 'progreso'">
          En progreso <span class="tab-conteo">{{ conteoPorPestana.progreso }}</span>
        </button>
        <button class="tab" :class="{ 'tab-activa': pestanaActiva === 'completadas' }" @click="pestanaActiva = 'completadas'">
          Completadas <span class="tab-conteo">{{ conteoPorPestana.completadas }}</span>
        </button>
        <button
          v-if="conteoPorPestana.otras > 0 || pestanaActiva === 'otras'"
          class="tab"
          :class="{ 'tab-activa': pestanaActiva === 'otras' }"
          @click="pestanaActiva = 'otras'"
        >
          En revisión / canceladas <span class="tab-conteo">{{ conteoPorPestana.otras }}</span>
        </button>
      </div>

      <p v-if="cargando" class="estado-info">Cargando reporte...</p>
      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <template v-if="!cargando && !error">
        <p class="resumen-total">Total general: <strong>{{ totalGeneral }}</strong> tarea(s)</p>

        <div v-if="deptosPestana.length > 0" class="lista-deptos-reporte">
          <div
            v-for="depto in deptosPestana"
            :key="depto.departamentoId"
            class="depto-reporte"
            :class="{ 'depto-reporte-vacio': depto.total === 0 }"
          >
            <div class="depto-reporte-header">
              <span class="depto-reporte-nombre">{{ depto.departamentoNombre }}</span>
              <span class="depto-reporte-total">{{ depto.total }} tarea(s)</span>
            </div>
            <p v-if="descripcionDepartamento(depto.departamentoId)" class="depto-reporte-descripcion">
              {{ descripcionDepartamento(depto.departamentoId) }}
            </p>

            <div v-if="depto.desglosePorEstado.length > 1" class="depto-reporte-desglose">
              <span v-for="conteo in depto.desglosePorEstado" :key="conteo.estado" class="badge" :class="colorEstado(conteo.estado)">
                {{ conteo.estado }}: {{ conteo.cantidad }}
              </span>
            </div>
            <p v-else-if="depto.total === 0" class="estado-info">Sin tareas en este estado.</p>

            <button
              v-if="depto.total > 0"
              type="button"
              class="btn-enlace"
              @click="alternarExpandido(depto.departamentoId)"
            >
              {{ deptosExpandidos.has(depto.departamentoId) ? 'Ocultar tareas' : 'Ver tareas' }}
            </button>

            <div v-if="deptosExpandidos.has(depto.departamentoId)" class="lista-tareas">
              <button
                v-for="tarea in depto.tareas"
                :key="tarea.id"
                type="button"
                class="tarea-item"
                @click="tareaPanelSeleccionada = tarea"
              >
                <div class="tarea-item-titulo">
                  {{ tarea.titulo }}
                  <BadgeAtraso :dias-atraso="tarea.diaAtraso" :estado="tarea.estado" />
                </div>
                <div class="tarea-item-meta">
                  <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
                  <span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span>
                  <span class="tarea-item-fecha">Asignado a: {{ tarea.asignadoANombre }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        <p v-else class="estado-info">
          {{ empleadoFiltroId !== null ? 'Este empleado no tiene tareas en el reporte.' : 'No hay departamentos para mostrar.' }}
        </p>
      </template>

      <button class="btn-cancelar" @click="emit('cerrar')">Cerrar</button>
    </div>

    <PanelDetalleTarea
      v-if="tareaPanelSeleccionada"
      :tarea="tareaPanelSeleccionada"
      :evento-comentario="eventoComentario"
      @cerrar="tareaPanelSeleccionada = null"
    />
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
  max-width: 560px;
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

.fila-filtros {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.campo-filtro {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 180px;
  flex-wrap: wrap;
}
.campo-filtro label {
  font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; color: var(--color-text-muted);
}
.campo-filtro select {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: inherit;
  flex: 1;
  min-width: 140px;
}
.campo-filtro select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.tabs {
  display: flex; gap: 0.25rem; margin-bottom: 1rem; overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
}
.tab {
  padding: 0.55rem 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: inherit;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.tab:hover { color: var(--color-text); }
.tab-activa { color: var(--color-accent); border-bottom-color: var(--color-accent); }
.tab-conteo {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}
.tab-activa .tab-conteo { background: var(--color-accent-subtle); color: var(--color-accent); }

.estado-info { color: var(--color-text-muted); font-size: 0.85rem; }
.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
}

.resumen-total { font-size: 0.85rem; color: var(--color-text-muted); margin: 0 0 1rem; }
.resumen-total strong { color: var(--color-text); }

.lista-deptos-reporte { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 0.5rem; }

.depto-reporte {
  padding: 0.8rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: opacity 0.12s ease;
}
.depto-reporte-vacio {
  opacity: 0.55;
  background: var(--color-surface-sunken);
}
.depto-reporte-vacio:hover { opacity: 0.85; }
.depto-reporte-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;
}
.depto-reporte-nombre { font-size: 0.92rem; font-weight: 600; color: var(--color-text); }
.depto-reporte-total { font-size: 0.78rem; color: var(--color-text-faint); white-space: nowrap; }
.depto-reporte-descripcion { margin: 0.1rem 0 0.6rem; font-size: 0.8rem; color: var(--color-text-muted); }

.depto-reporte-desglose { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem; }

.btn-enlace {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 0.78rem; font-weight: 600; color: var(--color-accent);
  font-family: inherit;
}
.btn-enlace:hover { text-decoration: underline; }

.lista-tareas { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.7rem; }

.tarea-item {
  display: block;
  width: 100%;
  padding: 0.55rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}
.tarea-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}
.tarea-item-titulo {
  font-size: 0.84rem; font-weight: 500; color: var(--color-text);
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.tarea-item-meta {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
  font-size: 0.74rem; color: var(--color-text-faint);
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
  margin-top: 0.75rem;
  transition: background-color 0.12s ease;
}
.btn-cancelar:hover { background: var(--color-surface-hover); }
</style>
