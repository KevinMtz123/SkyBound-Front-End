import { Ave } from "./Ave";

export interface Familium {
  idFamilia: number;
  descripcion: string | null;
  activo: boolean | null;
  fechaRegistro: string | null;
  aves?: Ave[];
}
