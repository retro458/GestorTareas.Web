<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/types'

const authStore = useAuthStore()
interface Empleado {
  id: number
  nombre: string
  nombreRol: string
}

const props = defineProps<{
  tareaId: number
  tituloTarea: string
}>()

const emit = defineEmits<{
  cerrar: []
  reasignado: []
}>()

const empleados = ref<Empleado[]>([])
const cargando = ref(false)
const reasignando = ref(false)
const error = ref<string | null>(null)

async function cargarEmpleados() {
  cargando.value = true
  error.value = null
  try {
    const endpoint = authStore.usuario?.rol === ROLES.JEFE
      ? '/usuario/empleados/todos'
      : '/usuario/empleados/departamento'

    const { data } = await api.get<Empleado[]>(endpoint)
    empleados.value = data
  } catch {
    error.value = 'No se pudo cargar la lista de empleados.'
  } finally {
    cargando.value = false
  }
}

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
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
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
          <span class="avatar">{{ empleado.nombre.charAt(0).toUpperCase() }}</span>
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.5rem;
  color: #e5e7eb;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

h2 { margin: 0; font-size: 1.1rem; color: #f3f4f6; }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.85rem; color: #9ca3af; }

.btn-cerrar {
  background: none; border: none; color: #9ca3af;
  font-size: 1rem; cursor: pointer; padding: 0.2rem;
}

.etiqueta-seccion {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em;
  color: #9ca3af; margin: 0 0 0.6rem;
}

.estado-info { color: #9ca3af; font-size: 0.85rem; }
.mensaje-error { color: #f87171; font-size: 0.85rem; }

.lista-empleados {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.empleado-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  text-align: left;
}

.empleado-item:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
}

.empleado-item:disabled { opacity: 0.5; cursor: not-allowed; }

.avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; color: white;
  flex-shrink: 0;
}

.empleado-info { display: flex; flex-direction: column; }
.empleado-nombre { font-size: 0.9rem; font-weight: 600; color: #f3f4f6; }
.empleado-rol { font-size: 0.75rem; color: #9ca3af; }

.btn-cancelar {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  cursor: pointer;
  font-size: 0.85rem;
}
</style>