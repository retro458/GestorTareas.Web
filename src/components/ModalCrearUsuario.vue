<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
  email: '',
  password: '',
  nombreRol: ROLES.EMPLEADO,
  departamento: ''
})

const guardando = ref(false)
const error = ref<string | null>(null)
const exito = ref(false)

const nombreDepartamentoPropio = computed(() =>
  departamentos.value.find(d => d.id === authStore.usuario?.departamentoId)?.nombre ?? ''
)

watch(nombreDepartamentoPropio, (nombre) => {
  if (!esJefe.value && nombre) {
    form.value.departamento = nombre
  }
}, { immediate: true })

async function guardar() {
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
        <label>Correo electrónico</label>
        <input v-model="form.email" type="email" required placeholder="maria.torres@empresa.com" />
      </div>

      <div class="campo">
        <label>Contraseña temporal</label>
        <input v-model="form.password" type="password" required minlength="6" placeholder="••••••••" />
      </div>

      <div class="fila">
        <div class="campo">
          <label>Rol</label>
          <select v-model="form.nombreRol">
            <option v-for="rol in ROLES_DISPONIBLES" :key="rol" :value="rol">{{ rol }}</option>
          </select>
        </div>

        <div class="campo" v-if="esJefe">
          <label>Departamento</label>
          <select v-model="form.departamento" required>
            <option value="" disabled>Selecciona un departamento</option>
            <option v-for="depto in departamentos" :key="depto.id" :value="depto.nombre">{{ depto.nombre }}</option>
          </select>
        </div>

        <div class="campo" v-else>
          <label>Departamento</label>
          <div class="valor-fijo">{{ nombreDepartamentoPropio || 'Cargando...' }}</div>
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

.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

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
