import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL,
  withCredentials: true, // CLAVE: para que la cookie X-Access-Token viaje en cada peticion
  headers: {
    'Content-Type': 'application/json'
  }
})

// Si varias peticiones fallan con 401 casi al mismo tiempo (ej. al cargar el
// dashboard), esta bandera evita que cada una dispare su propia redireccion
// y produzca el parpadeo/ciclo hacia el login.
let yaRedirigiendo = false

// Interceptor de respuesta: si el backend devuelve 401, la sesion expiro o no existe.
// Redirige al login de forma centralizada, sin repetir esta logica en cada componente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !yaRedirigiendo) {
      if (window.location.pathname !== '/login') {
        yaRedirigiendo = true

        // Limpiamos la sesion en el store para que el guard del router no
        // intente reautenticar con datos que ya sabemos invalidos.
        const authStore = useAuthStore()
        authStore.usuario = null
        sessionStorage.removeItem('usuario')

        window.location.href = '/sesion-expirada'
      }
    }
    return Promise.reject(error)
  }
)

export default api