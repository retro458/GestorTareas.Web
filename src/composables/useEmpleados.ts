import { ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/types'
import type { EmpleadoResponse } from '@/types'

export function useEmpleados() {
  const authStore = useAuthStore()
  const empleados = ref<EmpleadoResponse[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarEmpleados() {
    cargando.value = true
    error.value = null
    try {
      const endpoint = authStore.usuario?.rol === ROLES.JEFE
        ? '/usuario/empleados/todos'
        : '/usuario/empleados/departamento'

      const { data } = await api.get<EmpleadoResponse[]>(endpoint)
      empleados.value = data
    } catch {
      error.value = 'No se pudo cargar la lista de empleados.'
    } finally {
      cargando.value = false
    }
  }

  return { empleados, cargando, error, cargarEmpleados }
}
