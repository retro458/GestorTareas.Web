
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css' // ajusta o elimina segun tu CSS base
 
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
 
app.mount('#app')