import { ref } from 'vue'

// ============================================================
// Deteccion de nueva version desplegada
// ============================================================
// El hosting sirve index.html sin Cache-Control (solo Last-Modified), asi que
// Chrome lo guarda por heuristica y puede seguir cargando el bundle anterior
// despues de un deploy; ademas una ventana de la PWA abierta desde antes del
// deploy nunca vuelve a pedir index.html por si sola. Para no depender de eso
// comparamos el script de entrada con el que tiene hoy el servidor y, si
// cambio, avisamos al usuario para que recargue.

const INTERVALO_MS = 5 * 60 * 1000
const MIN_ENTRE_CHEQUEOS_MS = 60 * 1000
const PATRON_ENTRADA = /\/assets\/index-[^"']+\.js/

const hayNuevaVersion = ref(false)
let iniciado = false
let ultimoChequeo = 0

function entradaActual() {
  return document
    .querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]')
    ?.getAttribute('src') ?? null
}

async function verificar() {
  if (hayNuevaVersion.value) return
  const ahora = Date.now()
  if (ahora - ultimoChequeo < MIN_ENTRE_CHEQUEOS_MS) return
  ultimoChequeo = ahora

  const actual = entradaActual()
  if (!actual) return
  try {
    // cache: 'reload' va a la red y ademas refresca la copia de index.html en
    // la cache HTTP, asi la siguiente apertura de la app ya arranca actualizada.
    const respuesta = await fetch('/', { cache: 'reload' })
    if (!respuesta.ok) return
    const remota = (await respuesta.text()).match(PATRON_ENTRADA)?.[0]
    if (remota && remota !== actual) hayNuevaVersion.value = true
  } catch {
    // sin red o servidor caido: se reintenta en el siguiente chequeo
  }
}

export function useNuevaVersion() {
  // En dev Vite no genera /assets/index-*.js, no hay nada que comparar.
  if (!iniciado && import.meta.env.PROD) {
    iniciado = true

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') verificar()
    })
    window.addEventListener('focus', verificar)
    setInterval(verificar, INTERVALO_MS)

    // Si tras un deploy falla la carga de un chunk lazy (ruta o modal) de la
    // version vieja, recargamos una vez en lugar de dejar la pantalla rota.
    window.addEventListener('vite:preloadError', (evento) => {
      const clave = 'recarga-por-chunk'
      try {
        const ultima = Number(sessionStorage.getItem(clave) ?? 0)
        if (Date.now() - ultima < 10_000) return // evita bucles de recarga
        sessionStorage.setItem(clave, String(Date.now()))
      } catch {
        return
      }
      evento.preventDefault()
      window.location.reload()
    })

    verificar()
  }

  function actualizar() {
    window.location.reload()
  }

  function descartar() {
    hayNuevaVersion.value = false
    // se vuelve a avisar en el siguiente chequeo si sigue desactualizada
    ultimoChequeo = Date.now()
  }

  return { hayNuevaVersion, actualizar, descartar }
}
