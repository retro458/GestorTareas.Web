import { ref, onUnmounted } from 'vue'
import * as signalR from '@microsoft/signalr'

export interface NotificacionEvento {
  id: number
  tareaId: number
  mensaje: string
  leida: boolean
  fechaCreacion: string
}

export function useTareasHub(onTareaActualizada?: () => void) {
  const notificaciones = ref<NotificacionEvento[]>([])
  const conectado = ref(false)

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_HUB_URL, { withCredentials: true })
    .withAutomaticReconnect()
    .build()

  connection.on('NuevaNotificacion', (noti: NotificacionEvento) => {
    notificaciones.value.unshift(noti) // la mas nueva primero
  })

  connection.on('TareaActualizada', () => {
    // No necesitamos el payload aqui: simplemente le avisamos al componente
    // que recargue su lista de tareas via la funcion que le pasaron.
    onTareaActualizada?.()
  })

  connection.onreconnected(() => { conectado.value = true })
  connection.onclose(() => { conectado.value = false })

  connection.start()
    .then(() => { conectado.value = true })
    .catch((err) => console.error('Error al conectar con el Hub:', err))

  onUnmounted(() => {
    connection.stop()
  })

  function quitarNotificacion(id: number) {
    notificaciones.value = notificaciones.value.filter(n => n.id !== id)
  }

  return { notificaciones, conectado, quitarNotificacion }
}