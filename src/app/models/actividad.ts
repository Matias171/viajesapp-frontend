export class Actividad {
  id: number = 0;
  dia: string = '';        // formato YYYY-MM-DD
  hora?: string | null;    // formato HH:mm
  titulo: string = '';
  descripcion?: string | null;
  lugar?: string | null;
  lat?: number | null;
  lon?: number | null;
}