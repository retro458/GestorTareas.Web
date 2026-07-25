import { ref } from 'vue'
import api from '@/api/axios'
import type { DepartamentoResponse } from '@/types'

export function useDepartamentos() {
  const departamentos = ref<DepartamentoResponse[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarDepartamentos() {
    cargando.value = true
    error.value = null
    try {
      const { data } = await api.get<DepartamentoResponse[]>('/departamento/obtener')
      departamentos.value = data
    } catch {
      error.value = 'No se pudieron cargar los departamentos.'
    } finally {
      cargando.value = false
    }
  }

  return { departamentos, cargando, error, cargarDepartamentos }
}
