<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api/axios'
import type { TareaResponse, EditarTareaRequest } from '@/types'
import { PRIORIDAD_IDS } from '@/utils/prioridad'
import IconX from '@/components/icons/IconX.vue'

const props = defineProps<{
  tarea: TareaResponse
}>()

const emit = defineEmits<{
  cerrar: []
  editado: []
}>()

const form = ref<EditarTareaRequest>({
  titulo: props.tarea.titulo,
  descripcion: props.tarea.descripcion ?? '',
  prioridadId: PRIORIDAD_IDS[props.tarea.prioridad] ?? 2,
  fechaVencimiento: props.tarea.fechaVencimiento ? props.tarea.fechaVencimiento.slice(0, 10) : undefined
})

const guardando = ref(false)
const error = ref<string | null>(null)

async function guardar() {
  guardando.value = true
  error.value = null
  try {
    await api.patch(`/tareas/${props.tarea.id}/editar`, form.value)
    emit('editado')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo editar la tarea.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <form class="modal" @submit.prevent="guardar">
      <div class="modal-header">
        <div>
          <h2>Editar tarea</h2>
          <p class="subtitulo">{{ tarea.titulo }}</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="campo">
        <label>Título</label>
        <input v-model="form.titulo" required placeholder="Ej. Auditar finanzas empresa X" />
      </div>

      <div class="campo">
        <label>Descripción</label>
        <textarea v-model="form.descripcion" rows="3" placeholder="Detalles de la tarea..."></textarea>
      </div>

      <div class="fila">
        <div class="campo">
          <label>Prioridad</label>
          <select v-model.number="form.prioridadId">
            <option :value="1">Baja</option>
            <option :value="2">Media</option>
            <option :value="3">Alta</option>
          </select>
        </div>
        <div class="campo">
          <label>Fecha límite</label>
          <input v-model="form.fechaVencimiento" type="date" />
        </div>
      </div>

      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <div class="acciones">
        <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" class="btn-primario" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
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
  max-width: 480px;
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
  margin-bottom: 1.1rem;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.82rem; color: var(--color-text-muted); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem;
}
.btn-cerrar:hover { color: var(--color-text); }

.campo { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.campo label {
  font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; color: var(--color-text-muted);
}
.campo input, .campo textarea, .campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
  resize: vertical;
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
  font-size: 0.8rem;
  margin: 0 0 1rem;
}

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

.btn-secundario {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.btn-secundario:hover { background: var(--color-surface-hover); }
</style>
