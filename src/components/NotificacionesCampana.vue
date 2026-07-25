<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/api/axios'
import type { NotificacionResponse } from '@/types'

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
      🔔
      <span v-if="notificaciones.length > 0" class="contador">{{ notificaciones.length }}</span>
    </button>

    <div v-if="abierto" class="desplegable">
      <p class="titulo-desplegable">Notificaciones</p>
      <div v-if="notificaciones.length === 0" class="vacio">Sin notificaciones nuevas.</div>
      <div v-else class="lista-notis">
        <div v-for="noti in notificaciones" :key="noti.id" class="noti-item" @click="marcarLeida(noti)">
          <span class="noti-icono">📌</span>
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  font-size: 1.1rem;
  cursor: pointer;
}

.contador {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
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
  width: 300px;
  max-height: 340px;
  overflow-y: auto;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.9rem;
  z-index: 50;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.titulo-desplegable {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #f3f4f6;
}

.vacio { color: #9ca3af; font-size: 0.85rem; text-align: center; padding: 1rem 0; }

.lista-notis { display: flex; flex-direction: column; gap: 0.4rem; }

.noti-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.55rem 0.6rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  font-size: 0.82rem;
  color: #e5e7eb;
}

.noti-item:hover { background: rgba(99, 102, 241, 0.15); }
.noti-icono { flex-shrink: 0; }
</style>