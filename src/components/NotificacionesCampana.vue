<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api/axios'
import type { NotificacionResponse } from '@/types'
import IconBell from '@/components/icons/IconBell.vue'

const props = defineProps<{
  notificaciones: NotificacionResponse[]
}>()

const emit = defineEmits<{
  quitar: [id: number]
}>()

const abierto = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

async function marcarLeida(noti: NotificacionResponse) {
  try {
    await api.patch(`/notificaciones/${noti.id}/marcar-leida`)
    emit('quitar', noti.id)
  } catch {
    // si falla, la dejamos visible para reintentar
  }
}

function manejarClickFuera(evento: MouseEvent) {
  if (abierto.value && wrapperRef.value && !wrapperRef.value.contains(evento.target as Node)) {
    abierto.value = false
  }
}

onMounted(() => document.addEventListener('click', manejarClickFuera))
onUnmounted(() => document.removeEventListener('click', manejarClickFuera))
</script>

<template>
  <div class="campana-wrapper" ref="wrapperRef">
    <button class="btn-campana" @click="abierto = !abierto">
      <IconBell :size="17" />
      <span v-if="notificaciones.length > 0" class="contador">{{ notificaciones.length }}</span>
    </button>

    <div v-if="abierto" class="desplegable">
      <p class="titulo-desplegable">Notificaciones</p>
      <div v-if="notificaciones.length === 0" class="vacio">Sin notificaciones nuevas.</div>
      <div v-else class="lista-notis">
        <div v-for="noti in notificaciones" :key="noti.id" class="noti-item" @click="marcarLeida(noti)">
          <span class="noti-punto"></span>
          <span class="noti-mensaje">{{ noti.mensaje }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campana-wrapper { position: relative; }

.btn-campana {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.btn-campana:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}

.contador {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--color-danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.desplegable {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  max-width: calc(100vw - 1.5rem);
  max-height: 360px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  z-index: 50;
  box-shadow: var(--shadow-lg);
}

@media (max-width: 480px) {
  .desplegable {
    position: fixed;
    top: 64px;
    right: 0.75rem;
    left: 0.75rem;
    width: auto;
    max-width: none;
    max-height: calc(100vh - 80px);
  }
}

.titulo-desplegable {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.vacio { color: var(--color-text-faint); font-size: 0.85rem; text-align: center; padding: 1rem 0; }

.lista-notis { display: flex; flex-direction: column; gap: 0.3rem; }

.noti-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.55rem 0.6rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--color-text);
  transition: background-color 0.12s ease;
}

.noti-item:hover { background: var(--color-surface-hover); }

.noti-punto {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  margin-top: 0.4rem;
  border-radius: 50%;
  background: var(--color-accent);
}
</style>