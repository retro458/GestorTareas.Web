<script setup lang="ts">
import { RouterView } from 'vue-router'
import AvisoNuevaVersion from '@/components/AvisoNuevaVersion.vue'
import FranjaDemo from '@/components/FranjaDemo.vue'
</script>

<template>
  <FranjaDemo />
  <RouterView />
  <AvisoNuevaVersion />
</template>

<style scoped>

</style>
