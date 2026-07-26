<script setup lang="ts">
withDefaults(
  defineProps<{
    titulo: string
    mensaje: string
    textoConfirmar?: string
    textoCancelar?: string
    peligroso?: boolean
  }>(),
  {
    textoConfirmar: 'Confirmar',
    textoCancelar: 'Cancelar',
    peligroso: false
  }
)

const emit = defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<template>
  <div class="overlay" @click.self="emit('cancelar')">
    <div class="modal">
      <h2>{{ titulo }}</h2>
      <p class="mensaje">{{ mensaje }}</p>

      <div class="acciones">
        <button class="btn-cancelar" @click="emit('cancelar')">{{ textoCancelar }}</button>
        <button class="btn-confirmar" :class="{ peligroso }" @click="emit('confirmar')">{{ textoConfirmar }}</button>
      </div>
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
}

.modal {
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.mensaje {
  margin: 0 0 1.25rem;
  font-size: 0.88rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.acciones {
  display: flex;
  gap: 0.6rem;
}

.btn-cancelar,
.btn-confirmar {
  flex: 1;
  padding: 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.btn-cancelar {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}

.btn-cancelar:hover {
  background: var(--color-surface-hover);
}

.btn-confirmar {
  border: none;
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.btn-confirmar:hover {
  background: var(--color-accent-hover);
}

.btn-confirmar.peligroso {
  background: var(--color-danger);
}

.btn-confirmar.peligroso:hover {
  background: var(--color-danger-hover, var(--color-danger));
  opacity: 0.9;
}
</style>
