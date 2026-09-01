<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import type { NotificacionResponse } from '@/types'

defineProps<{
  titulo: string
  notificaciones: NotificacionResponse[]
}>()

const emit = defineEmits<{
  quitarNotificacion: [id: number]
  crearDepartamento: []
  crearUsuario: []
  gestionarUsuarios: []
  gestionarDepartamentos: []
}>()
</script>

<template>
  <div class="shell">
    <AppSidebar
      @crear-departamento="emit('crearDepartamento')"
      @crear-usuario="emit('crearUsuario')"
      @gestionar-usuarios="emit('gestionarUsuarios')"
      @gestionar-departamentos="emit('gestionarDepartamentos')"
    />
    <div class="shell-contenido">
      <AppTopbar
        :titulo="titulo"
        :notificaciones="notificaciones"
        @quitar-notificacion="emit('quitarNotificacion', $event)"
      />
      <main class="shell-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  background: var(--color-bg);
}

.shell-contenido {
  margin-left: 232px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shell-main {
  flex: 1;
  padding: 1.5rem 2rem 3rem;
  min-width: 0;
}

@media (max-width: 900px) {
  .shell-contenido {
    margin-left: 60px;
  }
}

@media (max-width: 640px) {
  .shell-main {
    padding: 1.1rem 1rem 2rem;
  }
}
</style>
