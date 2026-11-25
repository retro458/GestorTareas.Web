<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'
import type { CuentaDemo } from '@/stores/demo'
import ThemeToggle from '@/components/ThemeToggle.vue'
import IconEye from '@/components/icons/IconEye.vue'
import IconEyeOff from '@/components/icons/IconEyeOff.vue'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'

const router = useRouter()
const authStore = useAuthStore()
const demoStore = useDemoStore()

const nombreUsuario = ref('')
const password = ref('')
const mostrarPassword = ref(false)

const ETIQUETA_ROL: Record<string, string> = {
  'Jefe': 'Jefe',
  'Encargado Departamento': 'Encargado de Contabilidad',
  'Empleado': 'Empleado de Contabilidad'
}

// Demo: llena el formulario con la cuenta elegida; el usuario solo pulsa entrar.
function usarCuenta(cuenta: CuentaDemo) {
  nombreUsuario.value = cuenta.usuario
  password.value = cuenta.password
}

async function manejarSubmit() {
  const exito = await authStore.login({ nombreUsuario: nombreUsuario.value, password: password.value })
  if (exito) router.push('/')
}
</script>

<template>
  <div class="fondo">
    <ThemeToggle class="toggle-flotante" />

    <form class="card" @submit.prevent="manejarSubmit">
      <img src="/logo-128.png" alt="TaskFlow" class="logo" />

      <div class="campo">
        <label>Nombre de usuario</label>
        <input v-model="nombreUsuario" type="text" required autocomplete="username" placeholder="jperez" />
      </div>

      <div class="campo">
        <label>Contraseña</label>
        <div class="input-wrapper">
          <input
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
          <button type="button" class="toggle-password" @click="mostrarPassword = !mostrarPassword">
            <IconEyeOff v-if="mostrarPassword" :size="16" />
            <IconEye v-else :size="16" />
          </button>
        </div>
      </div>

      <p v-if="authStore.error" class="mensaje-error"><IconAlertCircle :size="15" />{{ authStore.error }}</p>

      <button type="submit" class="btn-submit" :disabled="authStore.cargando">
        <span v-if="authStore.cargando" class="spinner"></span>
        {{ authStore.cargando ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>

      <div v-if="demoStore.activo && demoStore.cuentas.length" class="cuentas-demo">
        <p class="cuentas-titulo">Cuentas de prueba</p>
        <div v-for="cuenta in demoStore.cuentas" :key="cuenta.usuario" class="cuenta">
          <span class="cuenta-datos">
            <span class="cuenta-rol">{{ ETIQUETA_ROL[cuenta.rol] ?? cuenta.rol }}</span>
            <span><code>{{ cuenta.usuario }}</code> · <code>{{ cuenta.password }}</code></span>
          </span>
          <button type="button" class="btn-cuenta" @click="usarCuenta(cuenta)">
            Entrar como {{ cuenta.usuario.split('.')[0] }}
          </button>
        </div>
      </div>

      <p class="footer">© 2026 TaskFlow · Sistema interno de gestión</p>
    </form>
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
  display: block;
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
}

.campo {
  text-align: left;
  margin-bottom: 1rem;
}

.campo label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  margin-bottom: 0.35rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.campo input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.input-wrapper input {
  padding-right: 2.3rem;
}

.campo input::placeholder {
  color: var(--color-text-faint);
}

.campo input:hover {
  border-color: var(--color-border-strong);
}

.campo input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.12s ease;
}

.toggle-password:hover {
  opacity: 1;
}

.mensaje-error {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.8rem;
  margin: 0.2rem 0 1rem;
  text-align: left;
}

.mensaje-error svg { flex-shrink: 0; }

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem;
  margin-top: 0.4rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  animation: girar 0.6s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.cuentas-demo {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  text-align: left;
}
.cuentas-titulo {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.cuenta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0;
}
.cuenta-datos {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.cuenta-datos code { font-size: 0.72rem; }
.cuenta-rol { font-size: 0.8rem; font-weight: 500; color: var(--color-text); }
.btn-cuenta {
  flex-shrink: 0;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm, 6px);
  background: var(--color-surface);
  color: var(--color-accent);
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-cuenta:hover { background: var(--color-accent-subtle); }

.footer {
  margin-top: 1.5rem;
  font-size: 0.72rem;
  color: var(--color-text-faint);
}
</style>