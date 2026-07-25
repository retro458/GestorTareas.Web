<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)

async function manejarSubmit() {
  const exito = await authStore.login({ email: email.value, password: password.value })
  if (exito) router.push('/')
}
</script>

<template>
  <div class="fondo">
    <form class="card" @submit.prevent="manejarSubmit">
      <div class="logo">📋</div>
      <h1>TaskFlow</h1>
      <p class="subtitulo">Sistema de gestión de tareas</p>

      <div class="campo">
        <label>Correo electrónico</label>
        <input v-model="email" type="email" required autocomplete="username" placeholder="correo.com" />
      </div>

      <div class="campo">
        <label>Contraseña</label>
        <div class="input-password">
          <input
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
          <button type="button" class="toggle-password" @click="mostrarPassword = !mostrarPassword">
            {{ mostrarPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <p v-if="authStore.error" class="mensaje-error">{{ authStore.error }}</p>

      <button type="submit" class="btn-submit" :disabled="authStore.cargando">
        {{ authStore.cargando ? 'Ingresando...' : 'Iniciar sesión →' }}
      </button>

      <p class="footer">© 2026 TaskFlow · Sistema interno de gestión</p>
    </form>
  </div>
</template>

<style scoped>
.fondo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #1e1b4b 0%, #0f0e1a 60%);
  padding: 1rem;
}

.card {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: #e5e7eb;
  text-align: center;
}

.logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitulo {
  margin: 0 0 1.75rem;
  color: #9ca3af;
  font-size: 0.85rem;
}

.campo {
  text-align: left;
  margin-bottom: 1rem;
}

.campo label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.35rem;
}

.campo input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.campo input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

.input-password {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.mensaje-error {
  color: #f87171;
  font-size: 0.8rem;
  margin: 0.5rem 0;
  text-align: left;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.7rem;
  color: #6b7280;
}
</style>