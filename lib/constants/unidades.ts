export interface UnidadMedida {
  value: string;
  label: string;
}

export interface UnidadMedidaGrupo {
  categoria: string;
  unidades: UnidadMedida[];
}

export const UNIDADES_MEDIDA_AGRUPADAS: UnidadMedidaGrupo[] = [
  {
    categoria: 'Peso',
    unidades: [
      { value: 'kg', label: 'Kilogramo (kg)' },
      { value: 'ton', label: 'Tonelada (ton)' },
      { value: 'g', label: 'Gramo (g)' },
    ],
  },
  {
    categoria: 'Longitud',
    unidades: [
      { value: 'm', label: 'Metro (m)' },
      { value: 'cm', label: 'Centímetro (cm)' },
      { value: 'ml', label: 'Metro lineal (ml)' },
    ],
  },
  {
    categoria: 'Área',
    unidades: [
      { value: 'm2', label: 'Metro cuadrado (m²)' },
    ],
  },
  {
    categoria: 'Volumen',
    unidades: [
      { value: 'm3', label: 'Metro cúbico (m³)' },
      { value: 'l', label: 'Litro (l)' },
    ],
  },
  {
    categoria: 'Cantidad',
    unidades: [
      { value: 'pza', label: 'Pieza (pza)' },
      { value: 'caja', label: 'Caja' },
      { value: 'lote', label: 'Lote' },
      { value: 'millar', label: 'Millar' },
    ],
  },
  {
    categoria: 'Construcción',
    unidades: [
      { value: 'bulto', label: 'Bulto' },
      { value: 'costal', label: 'Costal' },
      { value: 'barra', label: 'Barra' },
      { value: 'rollo', label: 'Rollo' },
      { value: 'cubeta', label: 'Cubeta' },
    ],
  },
];

export const UNIDADES_MEDIDA: UnidadMedida[] = UNIDADES_MEDIDA_AGRUPADAS.flatMap(g => g.unidades);
