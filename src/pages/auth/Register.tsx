import { useEffect, useState } from "react";
import { Usuario } from "../../types/Usuario";
import api from "../../services/api";
import CryptoJS from "crypto-js";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useNavigate } from "react-router-dom";

const [usuarioLogueado, setUsuarioLogueado] = useState(false);
const UsuariosIndex = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalAddShow, setModalAddShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [usuarioEliminar, setUsuarioEliminar] = useState<Usuario | null>(null);

  const [nuevoUsuario, setNuevoUsuario] = useState<Omit<Usuario, "idUsuario" | "fechaRegistro" | "reestablecer">>({
    nombres: "",
    apellidos: "",
    correo: "",
    clave: "",
    activo: true,
  });

  const [nuevaClaveEditar, setNuevaClaveEditar] = useState("");
  const [mostrarClaveEditar, setMostrarClaveEditar] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    setUsuarioLogueado(false);
  } else {
    setUsuarioLogueado(true);
    cargarUsuarios(); 
  }
}, []);


  const cargarUsuarios = async () => {
    try {
      const res = await api.get<Usuario[]>("/Usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioEditar(usuario);
    setNuevaClaveEditar("");
    setModalEditShow(true);
  };

  const abrirModalAgregar = () => {
    setNuevoUsuario({
      nombres: "",
      apellidos: "",
      correo: "",
      clave: "",
      activo: true,
    });
    setModalAddShow(true);
  };

  const abrirModalEliminar = (usuario: Usuario) => {
    setUsuarioEliminar(usuario);
    setShowDeleteModal(true);
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditar) return;

    try {
      let usuarioActualizado = { ...usuarioEditar };

      if (nuevaClaveEditar.trim() !== "") {
        usuarioActualizado.clave = CryptoJS.SHA256(nuevaClaveEditar).toString();
      }

      await api.put(`/Usuarios/${usuarioEditar.idUsuario}`, usuarioActualizado);
      setModalEditShow(false);
      cargarUsuarios();
      setShowToast(true);
    } catch (error) {
      console.error("Error al actualizar usuario", error);
    }
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usuarioParaCrear = {
        ...nuevoUsuario,
        clave: CryptoJS.SHA256(nuevoUsuario.clave ?? "").toString(),
      };

      await api.post("/Usuarios", usuarioParaCrear);
      setModalAddShow(false);
      cargarUsuarios();
      setShowToast(true);
    } catch (error) {
      console.error("Error al agregar usuario", error);
    }
  };

  const handleEliminar = async () => {
    if (!usuarioEliminar) return;
    try {
      await api.delete(`/Usuarios/${usuarioEliminar.idUsuario}`);
      setShowDeleteModal(false);
      cargarUsuarios();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar usuario", error);
    }
  };
if (!usuarioLogueado) {
  return (
    <div className="container py-5 text-center">
      <h2 className="text-danger">Acceso denegado 🔒</h2>
      <p>Debes iniciar sesión para ver esta sección.</p>
    </div>
  );
}

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Usuarios Administrativos 🧑‍💼</h2>

      <div className="text-center mb-4">
        <Button variant="primary" onClick={abrirModalAgregar}>
          + Agregar Usuario
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Nombres</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario, index) => (
              <tr key={usuario.idUsuario}>
                <td>{index + 1}</td>
                <td>{usuario.nombres} {usuario.apellidos}</td>
                <td>{usuario.correo}</td>
                <td>
                  {usuario.activo ? (
                    <span className="badge bg-success">Activo</span>
                  ) : (
                    <span className="badge bg-danger">Inactivo</span>
                  )}
                </td>
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => abrirModalEditar(usuario)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => abrirModalEliminar(usuario)}
                  >
                    🗑️ Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar */}
      <Modal show={modalEditShow} onHide={() => setModalEditShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioEditar && (
            <Container>
              <form onSubmit={handleActualizar}>
                <Row>
                  <Col>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Nombres"
                      value={usuarioEditar.nombres ?? ""}
                      onChange={(e) => setUsuarioEditar({ ...usuarioEditar, nombres: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Apellidos"
                      value={usuarioEditar.apellidos ?? ""}
                      onChange={(e) => setUsuarioEditar({ ...usuarioEditar, apellidos: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      className="form-control mb-3"
                      placeholder="Correo"
                      value={usuarioEditar.correo ?? ""}
                      onChange={(e) => setUsuarioEditar({ ...usuarioEditar, correo: e.target.value })}
                      required
                    />

                    <div className="position-relative mb-3">
                      <input
                        type={mostrarClaveEditar ? "text" : "password"}
                        className="form-control"
                        placeholder="Nueva Contraseña (opcional)"
                        value={nuevaClaveEditar}
                        onChange={(e) => setNuevaClaveEditar(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        className="position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setMostrarClaveEditar(!mostrarClaveEditar)}
                      >
                        {mostrarClaveEditar ? "Ocultar" : "Mostrar"}
                      </Button>
                    </div>

                    <Button type="submit" variant="primary" className="w-100">
                      Guardar Cambios
                    </Button>
                  </Col>
                </Row>
              </form>
            </Container>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Agregar Usuario */}
      <Modal show={modalAddShow} onHide={() => setModalAddShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <form onSubmit={handleAgregar}>
              <Row>
                <Col>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Nombres"
                    value={nuevoUsuario.nombres ?? ""}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombres: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Apellidos"
                    value={nuevoUsuario.apellidos ?? ""}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellidos: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Correo"
                    value={nuevoUsuario.correo ?? ""}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Contraseña"
                    value={nuevoUsuario.clave ?? ""}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, clave: e.target.value })}
                    required
                  />
                  <Button type="submit" variant="success" className="w-100">
                    Crear Usuario
                  </Button>
                </Col>
              </Row>
            </form>
          </Container>
        </Modal.Body>
      </Modal>

      {/* Modal Eliminar Usuario */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioEliminar && (
            <p>¿Estás seguro de eliminar a <strong>{usuarioEliminar.nombres} {usuarioEliminar.apellidos}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast éxito */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">✅ Operación exitosa</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default UsuariosIndex;
