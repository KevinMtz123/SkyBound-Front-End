import { Ave } from "./Ave";

export interface Habitat {
  idHabitat: number;
  descripcion: string | null;
  activo: boolean | null;
  fechaRegistro: string | null;
  aves?: Ave[];
}
