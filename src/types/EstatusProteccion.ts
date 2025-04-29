import { Ave } from "./Ave";

export interface EstatusProteccion {
  idEstatus: number;
  descripcion: string | null;
  activo: boolean | null;
  fechaRegistro: string | null;
  aves?: Ave[];
}
