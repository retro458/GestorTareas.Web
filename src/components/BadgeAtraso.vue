<script setup lang="ts">
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'

defineProps<{
  diasAtraso: number | null
}>()
</script>

<template>
  <span v-if="diasAtraso !== null" class="badge-atraso">
    <IconAlertCircle :size="12" />
    Atrasada {{ diasAtraso }} {{ diasAtraso === 1 ? 'día' : 'días' }}
  </span>
</template>

<style scoped>
.badge-atraso {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}
</style>
