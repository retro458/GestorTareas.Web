
// Coinciden exactamente con los DTOs de C# para evitar sorpresas de tipos.
// Si cambias un DTO en el backend, actualiza aqui tambien.
 
export interface LoginRequest {
  nombreUsuario: string
  password: string
}

export interface LoginResponse {
  id: number
  nombre: string
  email: string
  rol: string
  departamentosIds: number[]
}

export interface TareaResponse {
  id: number
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  asignadoA: number
  departamentoId: number | null
  asignadoANombre: string
  fechaVencimiento: string | null // ISO string, se parsea con new Date() donde se necesite
  fechaCreacion: string
}

export interface CrearTareaRequest {
  titulo: string
  descripcion?: string
  asignadoA: number
  departamentoId: number
  prioridadId: number
  fechaVencimiento?: string
}
 
export interface ActualizarEstadoRequest {
  estadoId: number
}
 
export interface ReasignarTareaRequest {
  nuevoAsignadoA: number
}
 
export interface NotificacionResponse {
  id: number
  tareaId: number
  mensaje: string
  leida: boolean
  fechaCreacion: string
}

export interface EmpleadoResponse {
  id: number
  nombre: string
  nombreRol: string
}

export interface EstadoResponse {
  id: number
  nombre: string
}

export interface DepartamentoResponse {
  id: number
  nombre: string
  descripcion: string | null
  estado: string | null
}

export interface CrearDepartamentoRequest {
  nombre: string
  descripcion?: string
}

export interface CrearUsuarioRequest {
  nombre: string
  nombreUsuario: string
  password: string
  nombreRol: string
  departamentosIds: number[]
}

// Roles como constantes, para no comparar strings "a mano" repetidamente
// en cada componente 
export const ROLES = {
  JEFE: 'Jefe',
  ENCARGADO: 'Encargado Departamento',
  EMPLEADO: 'Empleado'
} as const
 
export type Rol = typeof ROLES[keyof typeof ROLES]