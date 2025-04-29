import { Ave } from "./Ave";

export interface CategoriaEstacional {
  idCategoria: number;
  descripcion: string | null;
  activo: boolean | null;
  fechaRegistro: string | null;
  aves?: Ave[];
}
