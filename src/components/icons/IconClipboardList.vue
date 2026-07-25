<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 20 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="4" width="12" height="17" rx="1.5" />
    <rect x="9" y="2.5" width="6" height="3" rx="1" />
    <line x1="9" y1="10.5" x2="15" y2="10.5" />
    <line x1="9" y1="14" x2="15" y2="14" />
    <line x1="9" y1="17.5" x2="13" y2="17.5" />
  </svg>
</template>
