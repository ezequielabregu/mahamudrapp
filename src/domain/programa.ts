import datos from '../content/programa.json';

export type Practica = 'postraciones' | 'vajrasattva' | 'mandala' | 'guruyoga' | 'chenresi';
export type Preliminar = Exclude<Practica, 'chenresi'>;
export type NumeroTrimestre = 1 | 2 | 3 | 4;
export type CompromisoId = 'minimo' | 'medio' | 'completo';
export type NombreDia = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

export interface SumaRapida {
  cantidad: number;
  etiqueta: string;
}

export interface DatosPractica {
  titulo: string;
  unidad: string;
  sumasRapidas: SumaRapida[];
  nota?: string;
}

export interface Compromiso {
  id: CompromisoId;
  titulo: string;
  descripcion: string;
  metaPreliminarTrimestre: number;
}

export interface Trimestre {
  numero: NumeroTrimestre;
  preliminar: Preliminar;
  soportes: Record<NombreDia, string>;
}

export interface Guia {
  titulo: string;
  nota?: string;
  pagina?: number;
}

export interface Programa {
  fechaInicioPorDefecto: string;
  mesesPorTrimestre: number;
  minutosMeditacionDiaria: number;
  metaChenresiAnual: number;
  compromisos: Compromiso[];
  practicas: Record<Practica, DatosPractica>;
  trimestres: Trimestre[];
  reflexionesPorDia: Record<NombreDia, string>;
  reflexiones: Record<string, Guia>;
  soportes: Record<string, Guia>;
}

export const programa = datos as Programa;

export const PRACTICAS: Practica[] = ['postraciones', 'vajrasattva', 'mandala', 'guruyoga', 'chenresi'];

export const NOMBRES_DIA: NombreDia[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

export function esPractica(valor: string | undefined): valor is Practica {
  return PRACTICAS.includes(valor as Practica);
}
