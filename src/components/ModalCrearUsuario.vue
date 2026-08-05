<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useDepartamentos } from '@/composables/useDepartamentos'
import { ROLES } from '@/types'
import type { CrearUsuarioRequest } from '@/types'
import IconX from '@/components/icons/IconX.vue'

const emit = defineEmits<{
  cerrar: []
  creado: []
}>()

const authStore = useAuthStore()
const { departamentos, cargarDepartamentos } = useDepartamentos()

const esJefe = computed(() => authStore.usuario?.rol === ROLES.JEFE)

// Un Jefe ya existe (creado por el seed) y el backend rechaza registrar un
// segundo, asi que no tiene sentido ofrecerlo como opcion en el formulario.
const ROLES_DISPONIBLES = [ROLES.EMPLEADO, ROLES.ENCARGADO]

const form = ref<CrearUsuarioRequest>({
  nombre: '',
  nombreUsuario: '',
  password: '',
  nombreRol: ROLES.EMPLEADO,
  departamentosIds: []
})

const guardando = ref(false)
const error = ref<string | null>(null)
const exito = ref(false)

// Un Jefe puede marcar cualquier departamento; un Encargado solo los suyos.
const departamentosDisponibles = computed(() => {
  if (esJefe.value) return departamentos.value
  const propios = authStore.usuario?.departamentosIds ?? []
  return departamentos.value.filter(d => propios.includes(d.id))
})

function alternarDepartamento(id: number, marcado: boolean) {
  if (marcado) {
    if (!form.value.departamentosIds.includes(id)) form.value.departamentosIds.push(id)
  } else {
    form.value.departamentosIds = form.value.departamentosIds.filter(d => d !== id)
  }
}

async function guardar() {
  if (form.value.departamentosIds.length === 0) {
    error.value = 'Selecciona al menos un departamento.'
    return
  }
  guardando.value = true
  error.value = null
  try {
    await api.post('/usuario/register', form.value)
    exito.value = true
    emit('creado')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo crear el usuario.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarDepartamentos)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <form class="modal" @submit.prevent="guardar">
      <div class="modal-header">
        <div>
          <h2>Crear usuario</h2>
          <p class="subtitulo">Registra un nuevo miembro del equipo</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="campo">
        <label>Nombre completo</label>
        <input v-model="form.nombre" required placeholder="Ej. María Torres" />
      </div>

      <div class="campo">
        <label>Nombre de usuario</label>
        <input v-model="form.nombreUsuario" required placeholder="Ej. maria.torres" />
      </div>

      <div class="campo">
        <label>Contraseña temporal</label>
        <input v-model="form.password" type="password" required minlength="6" placeholder="••••••••" />
      </div>

      <div class="campo">
        <label>Rol</label>
        <select v-model="form.nombreRol">
          <option v-for="rol in ROLES_DISPONIBLES" :key="rol" :value="rol">{{ rol }}</option>
        </select>
      </div>

      <div class="campo">
        <label>Departamentos</label>
        <div class="lista-checkboxes">
          <label v-for="depto in departamentosDisponibles" :key="depto.id" class="checkbox-item">
            <input
              type="checkbox"
              :value="depto.id"
              :checked="form.departamentosIds.includes(depto.id)"
              @change="alternarDepartamento(depto.id, ($event.target as HTMLInputElement).checked)"
            />
            {{ depto.nombre }}
          </label>
          <p v-if="departamentosDisponibles.length === 0" class="valor-fijo">No hay departamentos disponibles.</p>
        </div>
      </div>

      <p v-if="error" class="mensaje-error">{{ error }}</p>
      <p v-if="exito" class="mensaje-exito">Usuario creado correctamente.</p>

      <div class="acciones">
        <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" class="btn-primario" :disabled="guardando">
          {{ guardando ? 'Creando...' : 'Crear usuario' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.1rem;
}

h2 { margin: 0; font-size: 1.1rem; color: var(--color-text); }
.subtitulo { margin: 0.2rem 0 0; font-size: 0.82rem; color: var(--color-text-muted); }

.btn-cerrar {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.3rem;
}
.btn-cerrar:hover { color: var(--color-text); }

.campo { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem; }
.campo label {
  font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; color: var(--color-text-muted);
}
.campo input, .campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
}
.campo input:focus, .campo select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.valor-fijo {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.lista-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 160px;
  overflow-y: auto;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.86rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  color: var(--color-text);
  cursor: pointer;
}

.checkbox-item input[type='checkbox'] {
  width: auto;
  accent-color: var(--color-accent);
}

.mensaje-error {
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.8rem;
  margin: 0 0 1rem;
}

.mensaje-exito {
  color: var(--color-success);
  background: var(--color-success-subtle);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
  font-size: 0.8rem;
  margin: 0 0 1rem;
}

.acciones { display: flex; gap: 0.6rem; justify-content: flex-end; }

.btn-primario, .btn-secundario {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color 0.12s ease;
}

.btn-primario {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}
.btn-primario:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-primario:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secundario {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.btn-secundario:hover { background: var(--color-surface-hover); }
</style>
