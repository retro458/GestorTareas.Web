<script setup lang="ts">
import type { TareaResponse, EventoComentario } from '@/types'
import DetalleTareaContenido from '@/components/DetalleTareaContenido.vue'
import IconX from '@/components/icons/IconX.vue'

defineProps<{
  tarea: TareaResponse
  eventoComentario?: EventoComentario | null
}>()

const emit = defineEmits<{
  cerrar: []
}>()
</script>

<template>
  <div class="overlay-panel" @click.self="emit('cerrar')">
    <div class="panel">
      <div class="panel-header">
        <h2>Detalle de tarea</h2>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="panel-cuerpo">
        <DetalleTareaContenido :tarea="tarea" :evento-comentario="eventoComentario" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-panel {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 110;
  animation: fondo-aparecer 0.18s ease-out;
}

@keyframes fondo-aparecer {
  from { opacity: 0; }
  to { opacity: 1; }
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(440px, 100vw);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  animation: panel-entrar 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes panel-entrar {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem;
}
.btn-cerrar:hover { color: var(--color-text); }

.panel-cuerpo {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem 1.5rem;
}

@media (max-width: 480px) {
  .panel { width: 100vw; }
  .panel-header { padding: 1rem 1.1rem 0.85rem; }
  .panel-cuerpo { padding: 1.1rem; }
}
</style>
