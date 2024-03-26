export class Pregunta {
  pregunta: string
  multimedia: string
  file: any
  opciones: {
    opcion: string,
    valor: number,
  }[]
  respuesta: string
}

