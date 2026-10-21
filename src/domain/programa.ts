import datos from '../content/programa.json';

export type Preliminar = 'postraciones' | 'vajrasattva' | 'mandala' | 'guruyoga';
export type PracticaYidam = 'yidam-exterior' | 'yidam-interior' | 'yidam-secreto';
export type Practica = Preliminar | 'chenresi' | PracticaYidam;
export type NumeroNivel = 1 | 2 | 3 | 4 | 5 | 6;
export type NumeroTrimestre = 1 | 2 | 3 | 4;
export type CompromisoId = 'minimo' | 'medio' | 'completo';
export type NombreDia = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

export interface DatosPractica {
  titulo: string;
  /** Para espacios chicos, como el encabezado del contador. */
  corto: string;
  unidad: string;
  mantra?: string;
}

export interface Compromiso {
  id: CompromisoId;
  titulo: string;
  descripcion: string;
  metaPreliminarTrimestre: number;
}

/** Nivel del programa, según "La progresión de las prácticas" del cuadernillo. */
export interface Nivel {
  numero: NumeroNivel;
  nombre: string;
  compromiso: string;
  /** Solo el nivel 1: la meta de preliminares depende del compromiso elegido. */
  usaCompromiso?: boolean;
  /** El nivel 6 ya concluyó los preliminares: no forman parte del compromiso. */
  sinPreliminares?: boolean;
  /** 0 = se registran sin meta ("continuar con los preliminares"). */
  metaPreliminarTrimestre: number | null;
  /** null = optativo en este nivel. */
  metaChenresiAnual: number | null;
  yidam?: { practica: PracticaYidam; meta: number };
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
  /** Textos literales del cuadernillo, para la pestaña Programa. */
  cuadernillo: {
    desarrolloSesion: { titulo: string; duracion: string; pasos: string[] };
    duranteElAnio: string;
  };
  niveles: Nivel[];
  compromisos: Compromiso[];
  practicas: Record<Practica, DatosPractica>;
  trimestres: Trimestre[];
  reflexionesPorDia: Record<NombreDia, string>;
  reflexiones: Record<string, Guia>;
  soportes: Record<string, Guia>;
}

export const programa = datos as Programa;

export const PRACTICAS: Practica[] = [
  'postraciones',
  'vajrasattva',
  'mandala',
  'guruyoga',
  'chenresi',
  'yidam-exterior',
  'yidam-interior',
  'yidam-secreto',
];

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
