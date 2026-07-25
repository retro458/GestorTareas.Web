
// Coinciden exactamente con los DTOs de C# para evitar sorpresas de tipos.
// Si cambias un DTO en el backend, actualiza aqui tambien.
 
export interface LoginRequest {
  email: string
  password: string
}
 
export interface LoginResponse {
  id: number
  nombre: string
  email: string
  rol: string
  departamentoId: number | null
}
 
export interface TareaResponse {
  id: number
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  asignadoA: number
  asignadoANombre: string
  fechaVencimiento: string | null // ISO string, se parsea con new Date() donde se necesite
  fechaCreacion: string
}
 
export interface CrearTareaRequest {
  titulo: string
  descripcion?: string
  asignadoA: number
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

// Roles como constantes, para no comparar strings "a mano" repetidamente
// en cada componente 
export const ROLES = {
  JEFE: 'Jefe',
  ENCARGADO: 'Encargado Departamento',
  EMPLEADO: 'Empleado'
} as const
 
export type Rol = typeof ROLES[keyof typeof ROLES]