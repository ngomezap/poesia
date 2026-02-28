export type PoemType = "poem" | "quote"

export type Poem = {
  type: PoemType
  title?: string
  lines: string[]
}

export const poems: Poem[] = [
  {
    type: 'quote',
    lines: [
      '"La única carrera que me interesa',
      'es la de tus medias"'
    ]
  },
  {
    type: 'poem',
    title: 'Ruido de taza',
    lines: [
      'La manana cabe en una taza pequena,',
      'humea lento sobre la mesa,',
      'y en el borde del silencio',
      'se despierta mi nombre.'
    ]
  },
  {
    type: 'poem',
    title: 'Ventana de febrero',
    lines: [
      'La luz entra en puntillas,',
      'como quien no quiere romper nada.',
      'Todo parece quieto,',
      'menos el pulso de las cortinas.'
    ]
  },
  {
    type: 'poem',
    title: 'Papel doblado',
    lines: [
      'Guardo palabras en el bolsillo,',
      'por si el dia se vuelve invierno.',
      'Cuando cae la tarde,',
      'las desdoblo y vuelve el fuego.'
    ]
  }
]
