import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL,
  withCredentials: true, // CLAVE: para que la cookie X-Access-Token viaje en cada peticion
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de respuesta: si el backend devuelve 401, la sesion expiro o no existe.
// Redirige al login de forma centralizada, sin repetir esta logica en cada componente.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api