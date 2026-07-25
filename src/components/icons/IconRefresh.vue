<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 16 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 11A8 8 0 0 0 6.5 6.5L4 9" />
    <path d="M4 4v5h5" />
    <path d="M4 13a8 8 0 0 0 13.5 4.5L20 15" />
    <path d="M20 20v-5h-5" />
  </svg>
</template>
