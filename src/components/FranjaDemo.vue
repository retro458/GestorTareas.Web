<script setup lang="ts">
import { watchEffect } from 'vue'
import { useDemoStore } from '@/stores/demo'

const demoStore = useDemoStore()

// La clase en <html> desplaza los elementos fijos del layout (ver style.css).
watchEffect(() => {
  document.documentElement.classList.toggle('con-franja-demo', demoStore.activo)
})
</script>

<template>
  <div v-if="demoStore.activo" class="franja-demo" role="status">
    Demo con datos ficticios · se reinicia cada noche
  </div>
</template>

<style scoped>
.franja-demo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 130;
  height: var(--alto-franja-demo);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  /* solido: el tinte de acento va sobre el color de superficie */
  background: linear-gradient(var(--color-accent-subtle), var(--color-accent-subtle)), var(--color-surface);
  color: var(--color-accent);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
