<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api/axios'
import type { CrearDepartamentoRequest } from '@/types'
import IconX from '@/components/icons/IconX.vue'

const emit = defineEmits<{
  cerrar: []
  creado: []
}>()

const form = ref<CrearDepartamentoRequest>({ nombre: '', descripcion: '' })
const guardando = ref(false)
const error = ref<string | null>(null)

async function guardar() {
  guardando.value = true
  error.value = null
  try {
    await api.post('/departamento/crear', form.value)
    emit('creado')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo crear el departamento.'
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
          <h2>Crear departamento</h2>
          <p class="subtitulo">Define un nuevo departamento en la organización</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="campo">
        <label>Nombre</label>
        <input v-model="form.nombre" required placeholder="Ej. Auditoría" />
      </div>

      <div class="campo">
        <label>Descripción</label>
        <textarea v-model="form.descripcion" rows="3" placeholder="Descripción breve del departamento..."></textarea>
      </div>

      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <div class="acciones">
        <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" class="btn-primario" :disabled="guardando">
          {{ guardando ? 'Creando...' : 'Crear departamento' }}
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
  max-width: 440px;
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
.campo input, .campo textarea {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
  resize: vertical;
}
.campo input:focus, .campo textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

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
