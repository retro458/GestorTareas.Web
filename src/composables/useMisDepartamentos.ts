import { ref } from 'vue'
import api from '@/api/axios'
import type { DepartamentoResponse } from '@/types'

// A diferencia de useDepartamentos (GET /departamento/obtener, solo Jefe/Encargado),
// este endpoint es accesible a cualquier rol autenticado y ya viene filtrado a los
// departamentos activos del usuario logueado.
export function useMisDepartamentos() {
  const misDepartamentos = ref<DepartamentoResponse[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarMisDepartamentos() {
    cargando.value = true
    error.value = null
    try {
      const { data } = await api.get<DepartamentoResponse[]>('/departamento/mis-departamentos')
      misDepartamentos.value = data
    } catch {
      error.value = 'No se pudieron cargar tus departamentos.'
    } finally {
      cargando.value = false
    }
  }

  return { misDepartamentos, cargando, error, cargarMisDepartamentos }
}
