import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

// Modo demo publico: la API dice si esta activo (GET /api/demo). Si la
// consulta falla se asume que NO es demo, para que produccion se vea igual.
export const useDemoStore = defineStore('demo', () => {
  const activo = ref(false)
  let cargado: Promise<void> | null = null

  function cargar() {
    cargado ??= api
      .get<{ activo: boolean }>('/demo')
      .then(({ data }) => { activo.value = data.activo === true })
      .catch(() => { activo.value = false })
    return cargado
  }

  return { activo, cargar }
})
