<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import IconSun from '@/components/icons/IconSun.vue'
import IconMoon from '@/components/icons/IconMoon.vue'

const themeStore = useThemeStore()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :title="themeStore.tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="themeStore.alternar()"
  >
    <IconSun v-if="themeStore.tema === 'dark'" :size="17" />
    <IconMoon v-else :size="17" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.theme-toggle:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}
</style>
