<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import IconAlertCircle from '@/components/icons/IconAlertCircle.vue'

const router = useRouter()
</script>

<template>
  <div class="fondo">
    <ThemeToggle class="toggle-flotante" />

    <div class="card">
      <img src="/logo-128.png" alt="TaskFlow" class="logo" />

      <p class="mensaje-aviso"><IconAlertCircle :size="15" />Tu sesión expiró por inactividad.</p>

      <p class="descripcion">Por tu seguridad, cerramos la sesión automáticamente. Ingresa de nuevo para continuar.</p>

      <button type="button" class="btn-submit" @click="router.replace('/login')">
        Volver a iniciar sesión
      </button>

      <p class="footer">© 2026 TaskFlow · Sistema interno de gestión</p>
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
  display: block;
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
}

.mensaje-aviso {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: var(--color-warning);
  background: var(--color-warning-subtle);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: left;
}

.mensaje-aviso svg { flex-shrink: 0; }

.descripcion {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 1.5rem;
}

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.btn-submit:hover {
  background: var(--color-accent-hover);
}

.footer {
  margin-top: 1.5rem;
  font-size: 0.72rem;
  color: var(--color-text-faint);
}
</style>
