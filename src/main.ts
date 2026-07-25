
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import './styles/tokens.css'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaurar sesion desde sessionStorage ANTES de montar la app,
// para que el router y los componentes vean el usuario ya cargado
// desde el primer render (evita el "parpadeo" de estar deslogueado
// por un instante al recargar la pagina).
const authStore = useAuthStore()
authStore.restaurarSesion()

// Igual con el tema: se aplica antes del mount para evitar parpadeo
// entre el tema por defecto y el guardado/preferido por el sistema.
const themeStore = useThemeStore()
themeStore.inicializar()

app.mount('#app')