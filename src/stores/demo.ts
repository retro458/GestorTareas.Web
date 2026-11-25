import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export interface CuentaDemo {
  usuario: string
  password: string
  rol: string
  nombre: string
}

// Modo demo publico: la API dice si esta activo (GET /api/demo) y, si lo
// esta, las cuentas de prueba. Si la consulta falla se asume que NO es demo,
// para que produccion se vea igual.
export const useDemoStore = defineStore('demo', () => {
  const activo = ref(false)
  const cuentas = ref<CuentaDemo[]>([])
  let cargado: Promise<void> | null = null

  function cargar() {
    cargado ??= api
      .get<{ activo: boolean; cuentas?: CuentaDemo[] }>('/demo')
      .then(({ data }) => {
        activo.value = data.activo === true
        cuentas.value = activo.value ? data.cuentas ?? [] : []
      })
      .catch(() => { activo.value = false })
    return cargado
  }

  // Las cuentas de demo no se pueden editar, desactivar ni cambiar de
  // contrasena (la API responde 403); el front oculta esas acciones.
  function esCuentaProtegida(nombreUsuario: string | null | undefined) {
    return activo.value && !!nombreUsuario && cuentas.value.some(c => c.usuario === nombreUsuario)
  }

  return { activo, cuentas, cargar, esCuentaProtegida }
})
