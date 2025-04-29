import api from "./api";
import { Usuario } from "../types/Usuario";

export const registrarUsuario = async (usuario: Usuario) => {
  const response = await api.post<Usuario>("/Usuarios", usuario);
  return response.data;
};
