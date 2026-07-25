import { ref } from 'vue'
import api from '@/api/axios'
import type { EstadoResponse } from '@/types'

export function useEstados() {
  const estados = ref<EstadoResponse[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarEstados() {
    cargando.value = true
    error.value = null
    try {
      const { data } = await api.get<EstadoResponse[]>('/estados/obtener')
      estados.value = data
    } catch {
      error.value = 'No se pudieron cargar los estados.'
    } finally {
      cargando.value = false
    }
  }

  return { estados, cargando, error, cargarEstados }
}
