export interface Usuario {
    idUsuario: number;
    nombres: string | null;
    apellidos: string | null;
    correo: string | null;
    clave: string | null;
    reestablecer: boolean | null;
    activo: boolean | null;
    fechaRegistro: string | null;
  }
  