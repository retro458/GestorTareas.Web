<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useDepartamentos } from '@/composables/useDepartamentos'
import { ROLES } from '@/types'
import type { EditarUsuarioRequest, EmpleadoResponse, RestablecerPasswordRequest } from '@/types'
import IconX from '@/components/icons/IconX.vue'

const props = defineProps<{
  usuario: EmpleadoResponse
}>()

const emit = defineEmits<{
  cerrar: []
  editado: []
}>()

const authStore = useAuthStore()
const { departamentos, cargarDepartamentos } = useDepartamentos()

const esJefe = computed(() => authStore.usuario?.rol === ROLES.JEFE)

const form = ref<EditarUsuarioRequest>({
  nombreUsuario: props.usuario.nombreUsuario,
  departamentosIds: props.usuario.departamentos.map(d => d.id)
})

const guardando = ref(false)
const error = ref<string | null>(null)

// Igual que en ModalCrearUsuario: un Jefe puede marcar cualquier departamento; un Encargado solo los suyos.
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
    await api.put(`/usuario/${props.usuario.id}/editar`, form.value)
    emit('editado')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'No se pudo editar el usuario.'
  } finally {
    guardando.value = false
  }
}

// Es una ruta separada del backend (PATCH .../restablecer-password, no parte de
// EditarUsuarioDto), asi que tiene su propio estado y no toca el form principal.
const mostrarRestablecerPassword = ref(false)
const restablecerForm = ref<RestablecerPasswordRequest>({ nuevaPassword: '' })
const restableciendo = ref(false)
const errorPassword = ref<string | null>(null)
const exitoPassword = ref(false)

async function restablecerPassword() {
  restableciendo.value = true
  errorPassword.value = null
  exitoPassword.value = false
  try {
    await api.patch(`/usuario/${props.usuario.id}/restablecer-password`, restablecerForm.value)
    exitoPassword.value = true
    restablecerForm.value.nuevaPassword = ''
  } catch (err: any) {
    errorPassword.value = err.response?.data?.error ?? 'No se pudo restablecer la contraseña.'
  } finally {
    restableciendo.value = false
  }
}

onMounted(cargarDepartamentos)
</script>

<template>
  <div class="overlay" @click.self="emit('cerrar')">
    <form class="modal" @submit.prevent="guardar">
      <div class="modal-header">
        <div>
          <h2>Editar usuario</h2>
          <p class="subtitulo">{{ usuario.nombre }}</p>
        </div>
        <button type="button" class="btn-cerrar" @click="emit('cerrar')"><IconX :size="15" /></button>
      </div>

      <div class="campo">
        <label>Nombre de usuario</label>
        <input v-model="form.nombreUsuario" required placeholder="Ej. maria.torres" />
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

      <div class="acciones">
        <button type="button" class="btn-secundario" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" class="btn-primario" :disabled="guardando">
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>

      <div class="separador"></div>

      <button type="button" class="btn-enlace-password" @click="mostrarRestablecerPassword = !mostrarRestablecerPassword">
        {{ mostrarRestablecerPassword ? 'Cancelar restablecer contraseña' : 'Restablecer contraseña' }}
      </button>

      <div v-if="mostrarRestablecerPassword" class="campo campo-password">
        <label>Nueva contraseña</label>
        <div class="fila-password">
          <input
            v-model="restablecerForm.nuevaPassword"
            type="password"
            minlength="6"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="btn-secundario"
            :disabled="restableciendo || restablecerForm.nuevaPassword.length < 6"
            @click="restablecerPassword"
          >
            {{ restableciendo ? 'Restableciendo...' : 'Restablecer' }}
          </button>
        </div>
        <p v-if="errorPassword" class="mensaje-error">{{ errorPassword }}</p>
        <p v-if="exitoPassword" class="mensaje-exito">Contraseña restablecida correctamente.</p>
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
.campo input {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
}
.campo input:focus {
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
  margin: 0.75rem 0 0;
}

.acciones { display: flex; gap: 0.6rem; justify-content: flex-end; }

.separador { height: 1px; background: var(--color-border); margin: 1.25rem 0; }

.btn-enlace-password {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted);
  font-family: inherit;
}
.btn-enlace-password:hover { color: var(--color-accent); text-decoration: underline; }

.campo-password { margin-top: 0.9rem; }
.fila-password { display: flex; gap: 0.6rem; align-items: center; }
.fila-password input { flex: 1; }

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
