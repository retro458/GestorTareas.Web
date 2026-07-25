<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 20 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.3v7.4l6-3.7Z" fill="currentColor" stroke="none" />
  </svg>
</template>
