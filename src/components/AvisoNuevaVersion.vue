<script setup lang="ts">
import { useNuevaVersion } from '@/composables/useNuevaVersion'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import IconX from '@/components/icons/IconX.vue'

const { hayNuevaVersion, actualizar, descartar } = useNuevaVersion()
</script>

<template>
  <div v-if="hayNuevaVersion" class="aviso" role="status">
    <span class="aviso-texto">Hay una nueva versión del sistema disponible.</span>
    <button type="button" class="btn-actualizar" @click="actualizar">
      <IconRefresh :size="14" />
      Actualizar
    </button>
    <button type="button" class="btn-cerrar" title="Más tarde" @click="descartar">
      <IconX :size="14" />
    </button>
  </div>
</template>

<style scoped>
.aviso {
  position: fixed;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  /* por encima de modales (100) y del panel de detalle (110) */
  z-index: 120;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: calc(100vw - 2rem);
  padding: 0.6rem 0.6rem 0.6rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  color: var(--color-text);
  font-size: 0.86rem;
}

.aviso-texto { flex: 1; }

.btn-actualizar {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-size: 0.84rem; font-weight: 600; font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.btn-actualizar:hover { background: var(--color-accent-hover); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; padding: 0.3rem;
  color: var(--color-text-muted); cursor: pointer;
}
.btn-cerrar:hover { color: var(--color-text); }
</style>
