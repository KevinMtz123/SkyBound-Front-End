import { CategoriaEstacional } from "./CategoriaEstacional";
import { EstatusProteccion } from "./EstatusProteccion";
import { Familium } from "./Familium";
import { Habitat } from "./Habitat";

export interface Ave {
  idAve: number;
  nombre: string | null;
  descripcion: string | null;
  idFamilia: number | null;
  idCategoria: number | null;
  idEstatus: number | null;
  idHabitat: number | null;
  alimentacion: string | null;
  funcionEcos: string | null;
  activa: boolean | null;
  listaRoja: boolean | null;
  fechaRegistro: string | null;
  idCategoriaNavigation?: CategoriaEstacional | null;
  idEstatusNavigation?: EstatusProteccion | null;
  idFamiliaNavigation?: Familium | null;
  idHabitatNavigation?: Habitat | null;
}
