<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'
import ThemeToggle from '@/components/ThemeToggle.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'

const route = useRoute()

const estado = ref<'cargando' | 'exito' | 'error'>('cargando')
const mensaje = ref('')

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    estado.value = 'error'
    mensaje.value = 'El enlace de verificación no es válido: falta el token.'
    return
  }

  try {
    const respuesta = await api.get('/Usuario/verificar-cuenta', { params: { token } })
    estado.value = 'exito'
    mensaje.value = respuesta.data?.mensaje || 'Tu cuenta fue verificada correctamente.'
  } catch (error: any) {
    estado.value = 'error'
    mensaje.value = error.response?.data?.mensaje || 'No se pudo verificar la cuenta. El enlace puede haber expirado o ser inválido.'
  }
})
</script>

<template>
  <div class="fondo">
    <ThemeToggle class="toggle-flotante" />

    <div class="card">
      <div class="logo"><IconLogo :size="19" /></div>
      <h1>TaskFlow</h1>

      <div v-if="estado === 'cargando'" class="estado">
        <span class="spinner"></span>
        <p>Verificando tu cuenta...</p>
      </div>

      <div v-else-if="estado === 'exito'" class="estado">
        <IconCheckCircle :size="40" class="icono-exito" />
        <p class="mensaje-texto">{{ mensaje }}</p>
        <RouterLink to="/login" class="btn-link">Ir al inicio de sesión</RouterLink>
      </div>

      <div v-else class="estado">
        <IconAlertCircle :size="40" class="icono-error" />
        <p class="mensaje-texto">{{ mensaje }}</p>
        <RouterLink to="/login" class="btn-link">Ir al inicio de sesión</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fondo {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 1rem;
}

.toggle-flotante {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
}

@keyframes entrada {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  width: 100%;
  max-width: 380px;
  padding: 2.25rem 2rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
  text-align: center;
  animation: entrada 0.2s ease both;
}

.logo {
  width: 44px;
  height: 44px;
  margin: 0 auto 1.1rem;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.icono-exito {
  color: var(--color-success, #16a34a);
}

.icono-error {
  color: var(--color-danger);
}

.mensaje-texto {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  animation: girar 0.6s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.btn-link {
  margin-top: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.12s ease;
}

.btn-link:hover {
  background: var(--color-accent-hover);
}
</style>
