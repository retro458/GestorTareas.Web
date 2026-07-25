<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import NotificacionesCampana from '@/components/NotificacionesCampana.vue'
import type { NotificacionResponse } from '@/types'
import { inicial } from '@/utils/avatarColor'
import IconPower from '@/components/icons/IconPower.vue'

defineProps<{
  titulo: string
  notificaciones: NotificacionResponse[]
}>()

const emit = defineEmits<{
  quitarNotificacion: [id: number]
}>()

const authStore = useAuthStore()

async function cerrarSesion() {
  await authStore.logout()
  window.location.href = '/login'
}
</script>

<template>
  <header class="topbar">
    <h1 class="topbar-titulo">{{ titulo }}</h1>

    <div class="topbar-acciones">
      <ThemeToggle />
      <NotificacionesCampana :notificaciones="notificaciones" @quitar="emit('quitarNotificacion', $event)" />

      <div class="separador"></div>

      <div class="usuario-chip">
        <span class="usuario-avatar">{{ inicial(authStore.usuario?.nombre ?? '?') }}</span>
        <span class="usuario-info">
          <span class="usuario-nombre">{{ authStore.usuario?.nombre }}</span>
          <span class="usuario-rol">{{ authStore.usuario?.rol }}</span>
        </span>
      </div>

      <button class="btn-salir" title="Cerrar sesión" @click="cerrarSesion">
        <IconPower :size="17" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.topbar-titulo {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.topbar-acciones {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.separador {
  width: 1px;
  height: 22px;
  background: var(--color-border);
  margin: 0 0.15rem;
}

.usuario-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border-radius: var(--radius-md);
}

.usuario-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.usuario-info {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.usuario-nombre {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

.usuario-rol {
  font-size: 0.7rem;
  color: var(--color-text-faint);
}

.btn-salir {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.btn-salir:hover {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

@media (max-width: 640px) {
  .usuario-info {
    display: none;
  }
}
</style>
