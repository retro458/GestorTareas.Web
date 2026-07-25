import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'
import type { LoginRequest, LoginResponse } from '@/types'
import { ROLES } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<LoginResponse | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const estaAutenticado = computed(() => usuario.value !== null)
  const esJefeOEncargado = computed(() =>
    usuario.value?.rol === ROLES.JEFE || usuario.value?.rol === ROLES.ENCARGADO
  )

  async function login(credenciales: LoginRequest) {
    cargando.value = true
    error.value = null
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credenciales)
      usuario.value = data
      // Guardamos tambien en sessionStorage para sobrevivir un refresh de pagina.
      // No es sensible (no incluye el JWT, solo datos de visualizacion, por si llego a olvidar por que esta esto aca :) ),
      // el token real sigue solo en la cookie HttpOnly.
      sessionStorage.setItem('usuario', JSON.stringify(data))
      return true
    } catch (err: any) {
      error.value = err.response?.data?.mensaje ?? 'Error al iniciar sesión.'
      return false
    } finally {
      cargando.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      usuario.value = null
      sessionStorage.removeItem('usuario')
    }
  }

  function restaurarSesion() {
    const guardado = sessionStorage.getItem('usuario')
    if (guardado) {
      usuario.value = JSON.parse(guardado)
    }
  }

  return { usuario, cargando, error, estaAutenticado, esJefeOEncargado, login, logout, restaurarSesion }
})