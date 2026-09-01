<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import type { TareaResponse, CrearTareaRequest } from '@/types'
import { ROLES } from '@/types'
import AppShell from '@/components/layout/AppShell.vue'
import ModalReasignarTarea from '@/components/ModalReasignarTarea.vue'
import ModalCrearDepartamento from '@/components/ModalCrearDepartamento.vue'
import ModalCrearUsuario from '@/components/ModalCrearUsuario.vue'
import ModalEditarTarea from '@/components/ModalEditarTarea.vue'
import ModalDetalleTarea from '@/components/ModalDetalleTarea.vue'
import ModalGestionUsuarios from '@/components/ModalGestionUsuarios.vue'
import ModalGestionDepartamentos from '@/components/ModalGestionDepartamentos.vue'
import ModalTareasUsuario from '@/components/ModalTareasUsuario.vue'
import ModalReporteDepartamentos from '@/components/ModalReporteDepartamentos.vue'
import BadgeAtraso from '@/components/BadgeAtraso.vue'
import { useTareasHub } from '@/composables/useTareasHub'
import { useEmpleados } from '@/composables/useEmpleados'
import { useDepartamentos } from '@/composables/useDepartamentos'
import { useAuthStore } from '@/stores/auth'
import { colorAvatar, inicial } from '@/utils/avatarColor'
import IconClipboardList from '@/components/icons/IconClipboardList.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconClock from '@/components/icons/IconClock.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import IconEye from '@/components/icons/IconEye.vue'

const ESTADOS_FINALES = ['Completada', 'Cancelada']

const tareas = ref<TareaResponse[]>([])
const cargando = ref(false)
const errorCarga = ref<string | null>(null)
const modalTareaId = ref<number | null>(null)
const modalTareaTitulo = ref('')
const mostrarCrearDepartamento = ref(false)
const mostrarCrearUsuario = ref(false)
const mostrarGestionUsuarios = ref(false)
const mostrarGestionDepartamentos = ref(false)

const pestanaActiva = ref<'activas' | 'completadas'>('activas')
const tareasCompletadas = ref<TareaResponse[]>([])
const cargandoCompletadas = ref(false)
const errorCompletadas = ref<string | null>(null)

const tareaEditando = ref<TareaResponse | null>(null)
const tareaDetalleSeleccionada = ref<TareaResponse | null>(null)
const usuarioVerTareas = ref<{ id: number; nombre: string } | null>(null)
const mostrarReporteDepartamentos = ref(false)

const { notificaciones, quitarNotificacion, eventoComentario } = useTareasHub(() => { cargarTareas(); cargarCompletadas() })
const { empleados, cargarEmpleados } = useEmpleados()
const { departamentos, cargarDepartamentos } = useDepartamentos()
const authStore = useAuthStore()

const esJefe = computed(() => authStore.usuario?.rol === ROLES.JEFE)

// Un Jefe ve todos los departamentos; un Encargado solo a los que pertenece.
const departamentosAccesibles = computed(() => {
  if (esJefe.value) return departamentos.value
  const propios = authStore.usuario?.departamentosIds ?? []
  return departamentos.value.filter(d => propios.includes(d.id))
})

const departamentoFiltroId = ref<number | null>(null)

function abrirModalReasignar(tarea: TareaResponse) {
  modalTareaId.value = tarea.id
  modalTareaTitulo.value = tarea.titulo
}

function nombreDepartamento(departamentoId: number | null) {
  return departamentos.value.find(d => d.id === departamentoId)?.nombre ?? '—'
}

function esEstadoFinal(estado: string) {
  return ESTADOS_FINALES.includes(estado)
}

const totalTareas = computed(() => tareas.value.length)
const completadas = computed(() => tareas.value.filter(t => t.estado === 'Completada').length)
const enProgreso = computed(() => tareas.value.filter(t => t.estado === 'En Progreso').length)
const pendientes = computed(() => tareas.value.filter(t => t.estado === 'Pendiente').length)

// La pestana "Activas" no mezcla las tareas ya completadas: esas viven en su propia
// pestana, cargada desde /tareas/completadas.
const tareasActivasMostradas = computed(() => tareas.value.filter(t => t.estado !== 'Completada'))
const tareasMostradas = computed(() => pestanaActiva.value === 'activas' ? tareasActivasMostradas.value : tareasCompletadas.value)

const mostrarFormulario = ref(false)
const nuevaTarea = ref<CrearTareaRequest>({
  titulo: '', descripcion: '', asignadoA: 0, departamentoId: 0, prioridadId: 2, fechaVencimiento: undefined
})
const creando = ref(false)
const errorCreacion = ref<string | null>(null)

async function cargarTareas() {
  cargando.value = true
  errorCarga.value = null
  try {
    const { data } = departamentoFiltroId.value
      ? await api.get<TareaResponse[]>(`/tareas/departamento/${departamentoFiltroId.value}`)
      : await api.get<TareaResponse[]>('/tareas/obtener')
    tareas.value = data
  } catch {
    errorCarga.value = 'No se pudieron cargar las tareas.'
  } finally {
    cargando.value = false
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

async function crearTarea() {
  creando.value = true
  errorCreacion.value = null
  try {
    await api.post('/tareas/crear', nuevaTarea.value)
    nuevaTarea.value = { titulo: '', descripcion: '', asignadoA: 0, departamentoId: 0, prioridadId: 2, fechaVencimiento: undefined }
    mostrarFormulario.value = false
    await cargarTareas()
  } catch (err: any) {
    errorCreacion.value = err.response?.data?.error ?? 'No se pudo crear la tarea.'
  } finally {
    creando.value = false
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

onMounted(() => {
  // Un Encargado no tiene acceso a /tareas/obtener (da 401); arrancamos
  // el filtro en su primer departamento para que la carga inicial use
  // /tareas/departamento/{id} en vez del endpoint general. Un Jefe si
  // puede usar /tareas/obtener, asi que su filtro arranca en "Todos".
  if (!esJefe.value) {
    departamentoFiltroId.value = authStore.usuario?.departamentosIds?.[0] ?? null
  }
  cargarTareas()
  cargarCompletadas()
  cargarEmpleados()
  cargarDepartamentos()
})
</script>

<template>
  <AppShell
    titulo="Panel de tareas"
    :notificaciones="notificaciones"
    @quitar-notificacion="quitarNotificacion"
    @crear-departamento="mostrarCrearDepartamento = true"
    @crear-usuario="mostrarCrearUsuario = true"
    @gestionar-usuarios="mostrarGestionUsuarios = true"
    @gestionar-departamentos="mostrarGestionDepartamentos = true"
  >
    <div class="kpis">
      <div class="kpi-card">
        <span class="kpi-icono kpi-icono-neutro"><IconClipboardList :size="19" /></span>
        <div><p class="kpi-numero">{{ totalTareas }}</p><p class="kpi-label">Total tareas</p></div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icono kpi-icono-success"><IconCheckCircle :size="19" /></span>
        <div><p class="kpi-numero">{{ completadas }}</p><p class="kpi-label">Completadas</p></div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icono kpi-icono-info"><IconPlay :size="19" /></span>
        <div><p class="kpi-numero">{{ enProgreso }}</p><p class="kpi-label">En progreso</p></div>
      </div>
      <div class="kpi-card">
        <span class="kpi-icono kpi-icono-warning"><IconClock :size="19" /></span>
        <div><p class="kpi-numero">{{ pendientes }}</p><p class="kpi-label">Pendientes</p></div>
      </div>
    </div>

    <div class="acciones">
      <button class="btn-primario" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : '+ Nueva tarea' }}
      </button>
      <button class="btn-secundario" @click="actualizarTodo" :disabled="cargando || cargandoCompletadas">
        <IconRefresh :size="14" />
        {{ (cargando || cargandoCompletadas) ? 'Actualizando...' : 'Actualizar' }}
      </button>
      <button class="btn-secundario" @click="mostrarReporteDepartamentos = true">
        <IconClipboardList :size="14" />
        Reporte por departamentos
      </button>
      <div class="campo campo-filtro">
        <label>Departamento</label>
        <select v-model.number="departamentoFiltroId" @change="cargarTareas">
          <option v-if="esJefe" :value="null">Todos los departamentos</option>
          <option v-for="depto in departamentosAccesibles" :key="depto.id" :value="depto.id">
            {{ depto.nombre }}
          </option>
        </select>
      </div>
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
          <label>Empleado asignado</label>
          <select v-model.number="nuevaTarea.asignadoA" required>
            <option :value="0" disabled>Selecciona un empleado</option>
            <option v-for="empleado in empleados" :key="empleado.id" :value="empleado.id">
              {{ empleado.nombre }} · {{ empleado.nombreRol }}
            </option>
          </select>
        </div>
        <div class="campo">
          <label>Departamento</label>
          <select v-model.number="nuevaTarea.departamentoId" required>
            <option :value="0" disabled>Selecciona un departamento</option>
            <option v-for="depto in departamentosAccesibles" :key="depto.id" :value="depto.id">
              {{ depto.nombre }}
            </option>
          </select>
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

    <div class="tabla-wrapper" v-if="tareasMostradas.length > 0">
      <table class="tabla-tareas">
        <thead>
          <tr>
            <th>Tarea</th><th>Asignado a</th><th>Estado</th><th>Prioridad</th><th>Vencimiento</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tarea in tareasMostradas" :key="tarea.id">
            <td class="celda-titulo">
              {{ tarea.titulo }}
              <BadgeAtraso :dias-atraso="tarea.diaAtraso" />
            </td>
            <td>
              <button
                type="button"
                class="persona persona-boton"
                title="Ver tareas de este usuario"
                @click="usuarioVerTareas = { id: tarea.asignadoA, nombre: tarea.asignadoANombre }"
              >
                <span class="avatar-mini" :style="{ background: colorAvatar(tarea.asignadoANombre) }">
                  {{ inicial(tarea.asignadoANombre) }}
                </span>
                <span class="persona-info">
                  <span class="persona-nombre">{{ tarea.asignadoANombre }}</span>
                  <span class="persona-departamento">{{ nombreDepartamento(tarea.departamentoId) }}</span>
                </span>
              </button>
            </td>
            <td><span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span></td>
            <td><span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span></td>
            <td class="celda-fecha">{{ tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleDateString() : '—' }}</td>
            <td class="celda-acciones">
              <button class="btn-mini" @click="tareaDetalleSeleccionada = tarea">
                <IconEye :size="13" />
                Detalle
              </button>
              <button v-if="!esEstadoFinal(tarea.estado)" class="btn-mini" @click="tareaEditando = tarea">Editar</button>
              <button v-if="!esEstadoFinal(tarea.estado)" class="btn-mini" @click="abrirModalReasignar(tarea)">Reasignar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!(pestanaActiva === 'activas' ? cargando : cargandoCompletadas)" class="vacio">
      {{ pestanaActiva === 'activas' ? 'No hay tareas activas registradas todavía.' : 'No hay tareas completadas todavía.' }}
    </p>

    <ModalReasignarTarea
      v-if="modalTareaId"
      :tarea-id="modalTareaId"
      :titulo-tarea="modalTareaTitulo"
      @cerrar="modalTareaId = null"
      @reasignado="() => { modalTareaId = null; cargarTareas() }"
    />

    <ModalEditarTarea
      v-if="tareaEditando"
      :tarea="tareaEditando"
      @cerrar="tareaEditando = null"
      @editado="() => { tareaEditando = null; cargarTareas(); cargarCompletadas() }"
    />

    <ModalDetalleTarea
      v-if="tareaDetalleSeleccionada"
      :tarea="tareaDetalleSeleccionada"
      :evento-comentario="eventoComentario"
      @cerrar="tareaDetalleSeleccionada = null"
    />

    <ModalCrearDepartamento
      v-if="mostrarCrearDepartamento"
      @cerrar="mostrarCrearDepartamento = false"
      @creado="mostrarCrearDepartamento = false"
    />

    <ModalCrearUsuario
      v-if="mostrarCrearUsuario"
      @cerrar="mostrarCrearUsuario = false"
      @creado="() => { mostrarCrearUsuario = false; cargarEmpleados() }"
    />

    <ModalGestionUsuarios
      v-if="mostrarGestionUsuarios"
      @cerrar="mostrarGestionUsuarios = false"
    />

    <ModalGestionDepartamentos
      v-if="mostrarGestionDepartamentos"
      @cerrar="mostrarGestionDepartamentos = false"
    />

    <ModalTareasUsuario
      v-if="usuarioVerTareas"
      :usuario-id="usuarioVerTareas.id"
      :usuario-nombre="usuarioVerTareas.nombre"
      @cerrar="usuarioVerTareas = null"
    />

    <ModalReporteDepartamentos
      v-if="mostrarReporteDepartamentos"
      :evento-comentario="eventoComentario"
      @cerrar="mostrarReporteDepartamentos = false"
    />
  </AppShell>
</template>

<style scoped>
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex; align-items: center; gap: 0.75rem;
}
.kpi-icono {
  display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border-radius: var(--radius-md); flex-shrink: 0;
}
.kpi-icono-neutro { background: var(--color-accent-subtle); color: var(--color-accent); }
.kpi-icono-success { background: var(--color-success-subtle); color: var(--color-success); }
.kpi-icono-info { background: var(--color-info-subtle); color: var(--color-info); }
.kpi-icono-warning { background: var(--color-warning-subtle); color: var(--color-warning); }
.kpi-numero { margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--color-text); font-variant-numeric: tabular-nums; }
.kpi-label { margin: 0; font-size: 0.75rem; color: var(--color-text-muted); }

.acciones { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }

.campo-filtro {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
}
.campo-filtro label { margin: 0; white-space: nowrap; }
.campo-filtro select {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: inherit;
}

@media (max-width: 560px) {
  .campo-filtro {
    margin-left: 0;
    width: 100%;
  }
  .campo-filtro select {
    flex: 1;
    min-width: 0;
  }
}
.campo-filtro select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.btn-primario, .btn-secundario, .btn-mini {
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
}
.vacio { color: var(--color-text-faint); text-align: center; padding: 2rem 0; }

.tabs { display: flex; gap: 0.25rem; margin-bottom: 1rem; border-bottom: 1px solid var(--color-border); }
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

.celda-acciones { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.tabla-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  overflow-x: auto;
}

.tabla-tareas { width: 100%; border-collapse: collapse; }
.tabla-tareas th {
  text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-text-faint); border-bottom: 1px solid var(--color-border);
  padding: 0.7rem 1rem; background: var(--color-surface-sunken);
}
.tabla-tareas td {
  padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border);
  font-size: 0.86rem; color: var(--color-text);
}
.tabla-tareas tr:last-child td { border-bottom: none; }
.tabla-tareas tr:hover td { background: var(--color-surface-hover); }
.celda-titulo { font-weight: 500; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.celda-fecha { font-variant-numeric: tabular-nums; color: var(--color-text-muted); }

.persona { display: flex; align-items: center; gap: 0.5rem; }
.persona-boton {
  background: none; border: none; padding: 0; margin: 0; cursor: pointer;
  font-family: inherit; text-align: left; border-radius: var(--radius-sm);
}
.persona-boton:hover .persona-nombre { color: var(--color-accent); text-decoration: underline; }
.avatar-mini {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; color: white;
  flex-shrink: 0;
}
.persona-info { display: flex; flex-direction: column; line-height: 1.25; }
.persona-nombre { font-size: 0.86rem; color: var(--color-text); }
.persona-departamento { font-size: 0.72rem; color: var(--color-text-faint); }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge-pendiente { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-progreso { background: var(--color-info-subtle); color: var(--color-info); }
.badge-revision { background: var(--color-highlight-subtle); color: var(--color-highlight); }
.badge-completada { background: var(--color-success-subtle); color: var(--color-success); }
.badge-cancelada { background: var(--color-danger-subtle); color: var(--color-danger); }

.badge-baja { background: var(--color-surface-sunken); color: var(--color-text-muted); }
.badge-media { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-alta { background: var(--color-danger-subtle); color: var(--color-danger); }

.btn-mini { background: var(--color-accent-subtle); color: var(--color-accent); padding: 0.3rem 0.6rem; font-size: 0.78rem; }
.btn-mini:hover { background: var(--color-accent); color: var(--color-text-on-accent); }
</style>
