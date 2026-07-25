<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16Z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
</template>
