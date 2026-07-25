<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useEmpleados } from '@/composables/useEmpleados'
import { colorAvatar, inicial } from '@/utils/avatarColor'
import IconX from '@/components/icons/IconX.vue'

const props = defineProps<{
  tareaId: number
  tituloTarea: string
}>()

const emit = defineEmits<{
  cerrar: []
  reasignado: []
}>()

const { empleados, cargando, error, cargarEmpleados } = useEmpleados()
const reasignando = ref(false)

async function seleccionar(empleadoId: number) {
  reasignando.value = true
  error.value = null
  try {
    await api.patch(`/tareas/${props.tareaId}/reasignar`, { nuevoAsignadoA: empleadoId })
    emit('reasignado')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo reasignar la tarea.'
  } finally {
    reasignando.value = false
  }
}

onMounted(cargarEmpleados)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Reasignar tarea</h2>
          <p class="subtitulo">{{ tituloTarea }}</p>
        </div>
        <button class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <p class="etiqueta-seccion">Seleccionar nuevo responsable</p>

      <p v-if="cargando" class="estado-info">Cargando empleados...</p>
      <p v-if="error" class="mensaje-error">{{ error }}</p>

      <div v-if="!cargando && empleados.length > 0" class="lista-empleados">
        <button
          v-for="empleado in empleados"
          :key="empleado.id"
          class="empleado-item"
          :disabled="reasignando"
          @click="seleccionar(empleado.id)"
        >
          <span class="avatar" :style="{ background: colorAvatar(empleado.nombre) }">{{ inicial(empleado.nombre) }}</span>
          <span class="empleado-info">
            <span class="empleado-nombre">{{ empleado.nombre }}</span>
            <span class="empleado-rol">{{ empleado.nombreRol }}</span>
          </span>
        </button>
      </div>

      <p v-else-if="!cargando" class="estado-info">No hay empleados disponibles.</p>

      <button class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem;
}
.btn-cerrar:hover { color: var(--color-text); }

.etiqueta-seccion {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-text-faint); margin: 0 0 0.6rem;
}

.estado-info { color: var(--color-text-muted); font-size: 0.85rem; }
.mensaje-error { color: var(--color-danger); font-size: 0.85rem; }

.lista-empleados {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.empleado-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.empleado-item:hover:not(:disabled) {
  background: var(--color-accent-subtle);
  border-color: var(--color-accent);
}

.empleado-item:disabled { opacity: 0.5; cursor: not-allowed; }

.avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: white;
  flex-shrink: 0;
}

.empleado-info { display: flex; flex-direction: column; }
.empleado-nombre { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
.empleado-rol { font-size: 0.74rem; color: var(--color-text-faint); }

.btn-cancelar {
  width: 100%;
  padding: 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.12s ease;
}

.btn-cancelar:hover {
  background: var(--color-surface-hover);
}
</style>