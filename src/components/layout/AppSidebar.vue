<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/types'
import IconLogo from '@/components/icons/IconLogo.vue'
import IconHome from '@/components/icons/IconHome.vue'
import IconBuilding from '@/components/icons/IconBuilding.vue'
import IconUserPlus from '@/components/icons/IconUserPlus.vue'
import IconPower from '@/components/icons/IconPower.vue'

const authStore = useAuthStore()

const emit = defineEmits<{
  crearDepartamento: []
  crearUsuario: []
  gestionarUsuarios: []
  gestionarDepartamentos: []
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="marca">
      <span class="marca-logo"><IconLogo :size="16" /></span>
      <span class="marca-nombre nav-texto">TaskFlow</span>
    </div>

    <nav class="nav">
      <span class="nav-seccion nav-texto">Espacio de trabajo</span>
      <RouterLink
        :to="authStore.esJefeOEncargado ? '/jefe' : '/empleado'"
        class="nav-item"
        active-class="nav-item-activo"
      >
        <span class="nav-icono"><IconHome :size="17" /></span>
        <span class="nav-texto">Panel</span>
      </RouterLink>

      <template v-if="authStore.esJefeOEncargado">
        <span class="nav-seccion nav-texto">Administración</span>
        <button
          v-if="authStore.usuario?.rol === ROLES.JEFE"
          type="button"
          class="nav-item nav-item-boton"
          @click="emit('crearDepartamento')"
        >
          <span class="nav-icono"><IconBuilding :size="17" /></span>
          <span class="nav-texto">Crear departamento</span>
        </button>
        <button type="button" class="nav-item nav-item-boton" @click="emit('crearUsuario')">
          <span class="nav-icono"><IconUserPlus :size="17" /></span>
          <span class="nav-texto">Crear usuario</span>
        </button>
        <button type="button" class="nav-item nav-item-boton" @click="emit('gestionarUsuarios')">
          <span class="nav-icono"><IconPower :size="17" /></span>
          <span class="nav-texto">Gestionar usuarios</span>
        </button>
        <button
          v-if="authStore.usuario?.rol === ROLES.JEFE"
          type="button"
          class="nav-item nav-item-boton"
          @click="emit('gestionarDepartamentos')"
        >
          <span class="nav-icono"><IconPower :size="17" /></span>
          <span class="nav-texto">Gestionar departamentos</span>
        </button>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 232px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  z-index: 20;
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem 1.25rem;
}

.marca-logo {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marca-nombre {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.nav-seccion {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-faint);
  padding: 0.9rem 0.5rem 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 500;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.nav-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-item-activo {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: 600;
}

.nav-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.1rem;
}

@media (max-width: 900px) {
  .sidebar {
    width: 60px;
    padding: 1rem 0.5rem;
  }
  .marca {
    justify-content: center;
    padding: 0.4rem 0 1.25rem;
  }
  .nav-texto {
    display: none;
  }
  .nav-item {
    justify-content: center;
  }
}
</style>
