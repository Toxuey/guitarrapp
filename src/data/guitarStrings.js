// Definición de las 6 cuerdas de la guitarra en afinación estándar (Standard Tuning E-A-D-G-B-E)
export const GUITAR_STRINGS = [
  {
    id: 'string-6',
    number: 6,
    note: 'E',
    solfege: 'Mi',
    fullName: 'Mi grave (Low E)',
    octave: 2,
    noteKey: 'E2',
    frequency: 82.41,
    gauge: '0.046"',
    type: 'wound', // entorchada
    thicknessPx: 5.5,
    color: '#d4af37', // Bronce / Nickel dorado
    description: 'La cuerda más gruesa y con el sonido más grave. Proporciona la base rítmica y los bajos.',
    mnemonicEn: 'Eddie (E)',
    mnemonicEs: 'En (Mi)'
  },
  {
    id: 'string-5',
    number: 5,
    note: 'A',
    solfege: 'La',
    fullName: 'La (A)',
    octave: 2,
    noteKey: 'A2',
    frequency: 110.00,
    gauge: '0.036"',
    type: 'wound',
    thicknessPx: 4.5,
    color: '#c5a059',
    description: 'Segunda cuerda más gruesa. Fundamental para acordes abiertos como La menor y Do mayor.',
    mnemonicEn: 'Ate (A)',
    mnemonicEs: 'Aquel (La)'
  },
  {
    id: 'string-4',
    number: 4,
    note: 'D',
    solfege: 'Re',
    fullName: 'Re (D)',
    octave: 3,
    noteKey: 'D3',
    frequency: 146.83,
    gauge: '0.026"',
    type: 'wound',
    thicknessPx: 3.6,
    color: '#bfa068',
    description: 'Tercera cuerda de bajo. Es la cuerda de partida para el acorde de Re.',
    mnemonicEn: 'Dynamite (D)',
    mnemonicEs: 'Día (Re)'
  },
  {
    id: 'string-3',
    number: 3,
    note: 'G',
    solfege: 'Sol',
    fullName: 'Sol (G)',
    octave: 3,
    noteKey: 'G3',
    frequency: 196.00,
    gauge: '0.017"',
    type: 'plain', // lisa de acero
    thicknessPx: 2.7,
    color: '#e2e8f0', // Acero plateado
    description: 'Primera cuerda aguda sin entorchar. Produce un tono brillante y resonante.',
    mnemonicEn: 'Good (G)',
    mnemonicEs: 'Gris (Sol)'
  },
  {
    id: 'string-2',
    number: 2,
    note: 'B',
    solfege: 'Si',
    fullName: 'Si (B)',
    octave: 3,
    noteKey: 'B3',
    frequency: 246.94,
    gauge: '0.013"',
    type: 'plain',
    thicknessPx: 2.0,
    color: '#f1f5f9',
    description: 'Segunda cuerda más fina. Muy usada en solos melódicos y acordes abiertos.',
    mnemonicEn: 'Bye (B)',
    mnemonicEs: 'Brilló (Si)'
  },
  {
    id: 'string-1',
    number: 1,
    note: 'E',
    solfege: 'Mi',
    fullName: 'Mi agudo (High E)',
    octave: 4,
    noteKey: 'E4',
    frequency: 329.63,
    gauge: '0.010"',
    type: 'plain',
    thicknessPx: 1.4,
    color: '#ffffff',
    description: 'La cuerda más fina y aguda. Brilla en la cima de los acordes y punteos rápidos.',
    mnemonicEn: 'Eddie (E)',
    mnemonicEs: 'El Sol (Mi)'
  }
];

export const MNEMONICS = {
  standard: {
    direction: 'De 6ª a 1ª (Grave a Agudo)',
    english: {
      phrase: 'Eddie Ate Dynamite, Good Bye Eddie',
      words: ['Eddie (E)', 'Ate (A)', 'Dynamite (D)', 'Good (G)', 'Bye (B)', 'Eddie (E)']
    },
    spanish: {
      phrase: 'En Aquel Día Gris Brilló El Sol',
      words: ['En (E)', 'Aquel (A)', 'Día (D)', 'Gris (G)', 'Brilló (B)', 'El Sol (E)']
    }
  },
  reverse: {
    direction: 'De 1ª a 6ª (Agudo a Grave)',
    english: {
      phrase: 'Every Boy Gets Dessert At Easter',
      words: ['Every (E)', 'Boy (B)', 'Gets (G)', 'Dessert (D)', 'At (A)', 'Easter (E)']
    },
    spanish: {
      phrase: 'El Barco Grande De Aquel Emigrante',
      words: ['El (E)', 'Barco (B)', 'Grande (G)', 'De (D)', 'Aquel (A)', 'Emigrante (E)']
    }
  }
};
