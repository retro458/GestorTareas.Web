<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api/axios'
import type { TareaResponse, HistorialTareaResponse, ComentarioResponse, EventoComentario } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { colorAvatar, inicial } from '@/utils/avatarColor'
import BadgeAtraso from '@/components/BadgeAtraso.vue'
import IconClock from '@/components/icons/IconClock.vue'

const props = defineProps<{
  tarea: TareaResponse
  eventoComentario?: EventoComentario | null
}>()

const authStore = useAuthStore()
const puedeGestionarComentarios = computed(() => authStore.esJefeOEncargado)

const historial = ref<HistorialTareaResponse[]>([])
const cargando = ref(false)
const error = ref<string | null>(null)

const historialOrdenado = computed(() =>
  [...historial.value].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
)

async function cargarHistorial() {
  cargando.value = true
  error.value = null
  try {
    const { data } = await api.get<HistorialTareaResponse[]>(`/tareas/${props.tarea.id}/historial`)
    historial.value = data
  } catch {
    error.value = 'No se pudo cargar el historial de la tarea.'
  } finally {
    cargando.value = false
  }
}

const comentarios = ref<ComentarioResponse[]>([])
const cargandoComentarios = ref(false)
const errorComentarios = ref<string | null>(null)

const comentariosOrdenados = computed(() =>
  [...comentarios.value].sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
)

async function cargarComentarios() {
  cargandoComentarios.value = true
  errorComentarios.value = null
  try {
    const { data } = await api.get<ComentarioResponse[]>(`/tareas/${props.tarea.id}/comentarios`)
    comentarios.value = data
  } catch {
    errorComentarios.value = 'No se pudieron cargar los comentarios.'
  } finally {
    cargandoComentarios.value = false
  }
}

const nuevoComentario = ref('')
const enviandoComentario = ref(false)

async function enviarComentario() {
  const contenido = nuevoComentario.value.trim()
  if (!contenido) return
  enviandoComentario.value = true
  errorComentarios.value = null
  try {
    const { data } = await api.post<ComentarioResponse>(`/tareas/${props.tarea.id}/comentarios`, { contenido })
    if (!comentarios.value.some(c => c.id === data.id)) comentarios.value.push(data)
    nuevoComentario.value = ''
  } catch {
    errorComentarios.value = 'No se pudo enviar el comentario.'
  } finally {
    enviandoComentario.value = false
  }
}

const comentarioEditandoId = ref<number | null>(null)
const textoEdicion = ref('')
const guardandoEdicion = ref(false)

function iniciarEdicion(comentario: ComentarioResponse) {
  comentarioEditandoId.value = comentario.id
  textoEdicion.value = comentario.contenido
}

function cancelarEdicion() {
  comentarioEditandoId.value = null
  textoEdicion.value = ''
}

async function guardarEdicion(id: number) {
  const contenido = textoEdicion.value.trim()
  if (!contenido) return
  guardandoEdicion.value = true
  errorComentarios.value = null
  try {
    const { data } = await api.patch<ComentarioResponse>(`/comentarios/${id}`, { contenido })
    const idx = comentarios.value.findIndex(c => c.id === id)
    if (idx !== -1) comentarios.value[idx] = data
    cancelarEdicion()
  } catch {
    errorComentarios.value = 'No se pudo editar el comentario.'
  } finally {
    guardandoEdicion.value = false
  }
}

const comentarioConfirmandoEliminarId = ref<number | null>(null)
const eliminandoComentarioId = ref<number | null>(null)

async function eliminarComentario(id: number) {
  eliminandoComentarioId.value = id
  errorComentarios.value = null
  try {
    await api.delete(`/comentarios/${id}`)
    comentarios.value = comentarios.value.filter(c => c.id !== id)
    if (comentarioEditandoId.value === id) cancelarEdicion()
  } catch {
    errorComentarios.value = 'No se pudo eliminar el comentario.'
  } finally {
    eliminandoComentarioId.value = null
    comentarioConfirmandoEliminarId.value = null
  }
}

// Mantiene el hilo sincronizado si otra persona comenta/edita/elimina en esta
// misma tarea mientras el panel esta abierto (eventos via useTareasHub).
watch(() => props.eventoComentario, (evento) => {
  if (!evento || evento.payload.tareaId !== props.tarea.id) return

  if (evento.tipo === 'nuevo') {
    if (!comentarios.value.some(c => c.id === evento.payload.id)) {
      comentarios.value.push(evento.payload)
    }
  } else if (evento.tipo === 'editado') {
    const idx = comentarios.value.findIndex(c => c.id === evento.payload.id)
    if (idx !== -1) comentarios.value[idx] = evento.payload
  } else if (evento.tipo === 'eliminado') {
    comentarios.value = comentarios.value.filter(c => c.id !== evento.payload.comentarioId)
    if (comentarioEditandoId.value === evento.payload.comentarioId) cancelarEdicion()
  }
})

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
  cargarHistorial()
  cargarComentarios()
})
</script>

<template>
  <div class="resumen">
    <div class="resumen-titulo-fila">
      <h3>{{ tarea.titulo }}</h3>
      <span class="badge" :class="colorEstado(tarea.estado)">{{ tarea.estado }}</span>
      <span class="badge" :class="colorPrioridad(tarea.prioridad)">{{ tarea.prioridad }}</span>
      <BadgeAtraso :dias-atraso="tarea.diaAtraso" :estado="tarea.estado" />
    </div>
    <p v-if="tarea.descripcion" class="resumen-descripcion">{{ tarea.descripcion }}</p>
    <div class="resumen-meta">
      <span>Asignado a: {{ tarea.asignadoANombre }}</span>
      <span v-if="tarea.fechaVencimiento">
        Vence: {{ new Date(tarea.fechaVencimiento).toLocaleDateString() }}
      </span>
    </div>
  </div>

  <p class="etiqueta-seccion">Historial</p>

  <p v-if="cargando" class="estado-info">Cargando historial...</p>
  <p v-if="error" class="mensaje-error">{{ error }}</p>

  <template v-if="!cargando && !error">
    <div class="timeline" v-if="historialOrdenado.length > 0">
      <div v-for="item in historialOrdenado" :key="item.id" class="timeline-item">
        <span class="timeline-punto"><IconClock :size="12" /></span>
        <div class="timeline-contenido">
          <p class="timeline-accion">{{ item.accion }}</p>
          <p class="timeline-meta">{{ item.usuarioNombre }} · {{ new Date(item.fecha).toLocaleString() }}</p>
        </div>
      </div>
    </div>
    <p v-else class="estado-info">Sin historial registrado.</p>
  </template>

  <p class="etiqueta-seccion">Comentarios</p>

  <p v-if="cargandoComentarios" class="estado-info">Cargando comentarios...</p>
  <p v-if="errorComentarios" class="mensaje-error">{{ errorComentarios }}</p>

  <template v-if="!cargandoComentarios">
    <div class="comentarios" v-if="comentariosOrdenados.length > 0">
      <div v-for="comentario in comentariosOrdenados" :key="comentario.id" class="comentario-item">
        <span class="avatar-mini" :style="{ background: colorAvatar(comentario.usuarioNombre) }">
          {{ inicial(comentario.usuarioNombre) }}
        </span>
        <div class="comentario-cuerpo">
          <p class="comentario-meta">
            <span class="comentario-autor">{{ comentario.usuarioNombre }}</span>
            · {{ new Date(comentario.fechaCreacion).toLocaleString() }}
            <span v-if="comentario.fechaEdicion">(editado)</span>
          </p>

          <template v-if="comentarioEditandoId === comentario.id">
            <textarea v-model="textoEdicion" rows="2" class="comentario-textarea"></textarea>
            <div class="comentario-acciones-edicion">
              <button type="button" class="btn-mini-secundario" @click="cancelarEdicion" :disabled="guardandoEdicion">
                Cancelar
              </button>
              <button type="button" class="btn-mini-primario" @click="guardarEdicion(comentario.id)" :disabled="guardandoEdicion || !textoEdicion.trim()">
                {{ guardandoEdicion ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </template>
          <template v-else>
            <p class="comentario-texto">{{ comentario.contenido }}</p>
            <div v-if="puedeGestionarComentarios" class="comentario-acciones">
              <button type="button" class="btn-enlace" @click="iniciarEdicion(comentario)">Editar</button>

              <template v-if="comentarioConfirmandoEliminarId === comentario.id">
                <span class="comentario-confirmar-texto">¿Eliminar?</span>
                <button
                  type="button"
                  class="btn-enlace btn-enlace-peligro"
                  :disabled="eliminandoComentarioId === comentario.id"
                  @click="eliminarComentario(comentario.id)"
                >
                  {{ eliminandoComentarioId === comentario.id ? 'Eliminando...' : 'Sí' }}
                </button>
                <button type="button" class="btn-enlace" @click="comentarioConfirmandoEliminarId = null">No</button>
              </template>
              <button v-else type="button" class="btn-enlace btn-enlace-peligro" @click="comentarioConfirmandoEliminarId = comentario.id">
                Eliminar
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <p v-else class="estado-info">Sin comentarios todavía.</p>
  </template>

  <form class="comentario-form" @submit.prevent="enviarComentario">
    <textarea
      v-model="nuevoComentario"
      rows="2"
      placeholder="Escribe un comentario..."
      class="comentario-textarea"
    ></textarea>
    <button type="submit" class="btn-primario" :disabled="enviandoComentario || !nuevoComentario.trim()">
      {{ enviandoComentario ? 'Enviando...' : 'Comentar' }}
    </button>
  </form>
</template>

<style scoped>
.estado-info { color: var(--color-text-muted); font-size: 0.85rem; }
.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
}

.resumen {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.25rem;
}
.resumen-titulo-fila { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.resumen-titulo-fila h3 { margin: 0; font-size: 0.98rem; color: var(--color-text); }
.resumen-descripcion { margin: 0.5rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }
.resumen-meta {
  display: flex; gap: 1rem; margin-top: 0.6rem; flex-wrap: wrap;
  font-size: 0.78rem; color: var(--color-text-faint);
}

.etiqueta-seccion {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-text-faint); margin: 0 0 0.75rem;
}

.timeline { display: flex; flex-direction: column; margin-bottom: 1.25rem; }

.timeline-item {
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 22px;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
}

.timeline-punto {
  flex-shrink: 0;
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  z-index: 1;
}

.timeline-contenido { padding-top: 0.1rem; }
.timeline-accion { margin: 0; font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.timeline-meta { margin: 0.15rem 0 0; font-size: 0.76rem; color: var(--color-text-faint); }

.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.badge-pendiente { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-progreso { background: var(--color-info-subtle); color: var(--color-info); }
.badge-revision { background: var(--color-highlight-subtle); color: var(--color-highlight); }
.badge-completada { background: var(--color-success-subtle); color: var(--color-success); }
.badge-cancelada { background: var(--color-danger-subtle); color: var(--color-danger); }

.badge-baja { background: var(--color-surface-sunken); color: var(--color-text-muted); }
.badge-media { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-alta { background: var(--color-danger-subtle); color: var(--color-danger); }

.comentarios { display: flex; flex-direction: column; gap: 0.9rem; margin-bottom: 1rem; }

.comentario-item { display: flex; gap: 0.6rem; }

.avatar-mini {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: white;
}

.comentario-cuerpo { flex: 1; min-width: 0; }
.comentario-meta { margin: 0 0 0.2rem; font-size: 0.74rem; color: var(--color-text-faint); }
.comentario-autor { font-weight: 600; color: var(--color-text-muted); }
.comentario-texto { margin: 0; font-size: 0.86rem; color: var(--color-text); white-space: pre-wrap; word-break: break-word; }

.comentario-acciones { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.3rem; flex-wrap: wrap; }
.comentario-confirmar-texto { font-size: 0.78rem; color: var(--color-text-muted); }

.btn-enlace {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 0.76rem; font-weight: 600; color: var(--color-text-muted);
  font-family: inherit;
}
.btn-enlace:hover:not(:disabled) { color: var(--color-accent); text-decoration: underline; }
.btn-enlace:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-enlace-peligro { color: var(--color-danger); }
.btn-enlace-peligro:hover:not(:disabled) { color: var(--color-danger); }

.comentario-textarea {
  width: 100%;
  resize: vertical;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: inherit;
  box-sizing: border-box;
}
.comentario-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.comentario-acciones-edicion { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.4rem; }

.btn-mini-primario, .btn-mini-secundario {
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  font-family: inherit;
}
.btn-mini-primario { background: var(--color-accent); color: var(--color-text-on-accent); }
.btn-mini-primario:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-mini-secundario { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border); }
.btn-mini-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.comentario-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.comentario-form .btn-primario {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.comentario-form .btn-primario:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
