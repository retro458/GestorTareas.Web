<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 19v-1a4 4 0 0 0-4-4h-3a4 4 0 0 0-4 4v1" />
    <circle cx="9" cy="7.2" r="3.2" />
    <line x1="18" y1="8" x2="18" y2="14" />
    <line x1="15" y1="11" x2="21" y2="11" />
  </svg>
</template>
