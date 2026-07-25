<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="2.5" width="16" height="19" rx="1" />
    <rect x="7.2" y="5.5" width="2" height="2" />
    <rect x="14.8" y="5.5" width="2" height="2" />
    <rect x="7.2" y="10.5" width="2" height="2" />
    <rect x="14.8" y="10.5" width="2" height="2" />
    <rect x="7.2" y="15.5" width="2" height="2" />
    <rect x="14.8" y="15.5" width="2" height="2" />
  </svg>
</template>
