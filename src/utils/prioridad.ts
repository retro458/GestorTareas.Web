// El backend identifica la prioridad por id (1=Baja, 2=Media, 3=Alta) al crear/editar,
// pero TareaResponse solo trae el nombre. Este mapeo evita repetirlo en cada formulario.
export const PRIORIDAD_IDS: Record<string, number> = {
  Baja: 1,
  Media: 2,
  Alta: 3
}
