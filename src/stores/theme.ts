import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Tema = 'light' | 'dark'
const CLAVE_STORAGE = 'tema'

function temaDelSistema(): Tema {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const tema = ref<Tema>('light')

  function aplicar(nuevoTema: Tema) {
    tema.value = nuevoTema
    document.documentElement.setAttribute('data-theme', nuevoTema)
    localStorage.setItem(CLAVE_STORAGE, nuevoTema)
  }

  function inicializar() {
    const guardado = localStorage.getItem(CLAVE_STORAGE) as Tema | null
    aplicar(guardado ?? temaDelSistema())
  }

  function alternar() {
    aplicar(tema.value === 'dark' ? 'light' : 'dark')
  }

  return { tema, inicializar, alternar }
})
