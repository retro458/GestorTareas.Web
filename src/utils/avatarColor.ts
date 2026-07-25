const VARIANTES = 6

export function colorAvatar(nombre: string): string {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash << 5) - hash + nombre.charCodeAt(i)
    hash |= 0
  }
  const indice = (Math.abs(hash) % VARIANTES) + 1
  return `var(--avatar-color-${indice})`
}

export function inicial(nombre: string): string {
  return nombre.charAt(0).toUpperCase()
}
