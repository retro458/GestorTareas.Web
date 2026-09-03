<script setup lang="ts">
import { computed } from 'vue'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'

const props = defineProps<{
  diasAtraso: number | null
  estado?: string
}>()

const visible = computed(() => props.diasAtraso !== null && props.estado !== 'Completada')
</script>

<template>
  <span v-if="visible" class="badge-atraso">
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
