
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
  diaAtraso: number | null // ojo: el backend lo manda singular ("diaAtraso"), no "diasAtraso"
}

export interface EditarTareaRequest {
  titulo?: string
  descripcion?: string
  prioridadId?: number
  fechaVencimiento?: string
}

export interface HistorialTareaResponse {
  id: number
  accion: string
  usuarioNombre: string
  fecha: string
}

export interface ComentarioResponse {
  id: number
  tareaId: number
  contenido: string
  usuarioId: number
  usuarioNombre: string
  fechaCreacion: string
  fechaEdicion: string | null
}

export interface CrearComentarioRequest {
  contenido: string
}

export interface EditarComentarioRequest {
  contenido: string
}

export interface ComentarioEliminadoEvento {
  comentarioId: number
  tareaId: number
}

// Evento generico emitido por useTareasHub para los 3 eventos de SignalR de
// comentarios (NuevoComentario, ComentarioEditado, ComentarioEliminado). Se
// reenvia tal cual a ModalDetalleTarea, que filtra por tareaId.
export type EventoComentario =
  | { tipo: 'nuevo'; payload: ComentarioResponse }
  | { tipo: 'editado'; payload: ComentarioResponse }
  | { tipo: 'eliminado'; payload: ComentarioEliminadoEvento }

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

export interface AutoasignarTareaRequest {
  titulo: string
  descripcion?: string
  departamentoId: number
  prioridadId: number
  fechaVencimiento?: string
}
 
export interface TareasPorUsuarioResponse {
  usuarioId: number
  usuarioNombre: string
  asignadas: TareaResponse[]
  creadas: TareaResponse[]
}

export interface ConteoPorEstado {
  estado: string
  cantidad: number
}

export interface ReporteDepartamento {
  departamentoId: number
  departamentoNombre: string
  total: number
  desglosePorEstado: ConteoPorEstado[]
  tareas: TareaResponse[]
}

export type FiltroReporte = 'activas' | 'completadas' | 'todas'

export interface NotificacionResponse {
  id: number
  tareaId: number
  mensaje: string
  leida: boolean
  fechaCreacion: string
}

export interface DepartamentoResumen {
  id: number
  nombre: string
}

export interface EmpleadoResponse {
  id: number
  nombre: string
  nombreUsuario: string
  nombreRol: string
  departamentos: DepartamentoResumen[]
}

export interface EditarUsuarioRequest {
  nombreUsuario: string
  departamentosIds: number[]
}

export interface RestablecerPasswordRequest {
  nuevaPassword: string
}

export interface EstadoResponse {
  id: number
  nombre: string
}

export interface DepartamentoResponse {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean // ojo: GET /departamento/obtener no lo llena (siempre false); usar /departamento/inactivos para el estado real
}

export interface CrearDepartamentoRequest {
  nombre: string
  descripcion?: string
}

export interface EditarDepartamentoRequest {
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