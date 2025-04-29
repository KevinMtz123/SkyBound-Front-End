import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ave } from "../../types/Ave";
import { CategoriaEstacional } from "../../types/CategoriaEstacional";
import { EstatusProteccion } from "../../types/EstatusProteccion";
import { Familium } from "../../types/Familium";
import { Habitat } from "../../types/Habitat";
import api from "../../services/api";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

const AvesIndex = () => {
  const [aves, setAves] = useState<Ave[]>([]);
  const [avesFiltradas, setAvesFiltradas] = useState<Ave[]>([]);

  const [filtroFamilias, setFiltroFamilias] = useState<number[]>([]);
  const [filtroCategorias, setFiltroCategorias] = useState<number[]>([]);
  const [filtroEstatus, setFiltroEstatus] = useState<number[]>([]);
  const [filtroHabitats, setFiltroHabitats] = useState<number[]>([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);

  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalAddShow, setModalAddShow] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [aveEditar, setAveEditar] = useState<Ave | null>(null);
  const [aveEliminar, setAveEliminar] = useState<Ave | null>(null);
  const [nuevaAve, setNuevaAve] = useState<Omit<Ave, "idAve" | "fechaRegistro" | "idCategoriaNavigation" | "idEstatusNavigation" | "idFamiliaNavigation" | "idHabitatNavigation">>({
    nombre: "",
    descripcion: "",
    idFamilia: null,
    idCategoria: null,
    idEstatus: null,
    idHabitat: null,
    alimentacion: "",
    funcionEcos: "",
    rutaImagen: "",
    nombreImagen: "",
    activa: true,
    listaRoja: false
  });
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [familias, setFamilias] = useState<Familium[]>([]);
  const [categorias, setCategorias] = useState<CategoriaEstacional[]>([]);
  const [estatus, setEstatus] = useState<EstatusProteccion[]>([]);
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      setUsuarioLogueado(true);
    }
    cargarDatos(); 
  }, [navigate]);
  
  const cargarDatos = async () => {
    try {
      const [avesRes, familiasRes, categoriasRes, estatusRes, habitatsRes] = await Promise.all([
        api.get<Ave[]>("/Aves"),
        api.get<Familium[]>("/Familiums"),
        api.get<CategoriaEstacional[]>("/CategoriaEstacionals"),
        api.get<EstatusProteccion[]>("/EstatusProteccions"),
        api.get<Habitat[]>("/Habitats"),
      ]);
      setAves(avesRes.data);
      setAvesFiltradas(avesRes.data);
      setFamilias(familiasRes.data);
      setCategorias(categoriasRes.data);
      setEstatus(estatusRes.data);
      setHabitats(habitatsRes.data);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditModal = (ave: Ave) => {
    setAveEditar(ave);
    setImagenPreview(ave.rutaImagen ? `https://localhost:7164/api/imagenes/${ave.nombreImagen}` : null);
    setImagenFile(null);  // 🔥 aquí limpiar
    setModalEditShow(true);
  };
  
  const handleOpenAddModal = () => {
    setNuevaAve({
      nombre: "",
      descripcion: "",
      idFamilia: null,
      idCategoria: null,
      idEstatus: null,
      idHabitat: null,
      alimentacion: "",
      funcionEcos: "",
      rutaImagen: "",
      nombreImagen: "",
      activa: true,
      listaRoja: false
    });
    setImagenPreview(null);
    setImagenFile(null);  // 🔥 aquí limpiar
    setModalAddShow(true);
  };
  
  const handleOpenDeleteModal = (ave: Ave) => {
    setAveEliminar(ave);
    setShowDeleteModal(true);
  };

  const handleDeleteAve = async () => {
    if (!aveEliminar) return;
    try {
      await api.delete(`/Aves/${aveEliminar.idAve}`);
      setShowDeleteModal(false);
      setAveEliminar(null);
      cargarDatos();
      setShowToast(true);
    } catch (error) {
      console.error("Error al eliminar ave", error);
    }
  };

  const handleAddAve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(nuevaAve).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }
      await api.post("/Aves", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setModalAddShow(false);
      cargarDatos();
      setShowToast(true);
    } catch (error) {
      console.error("Error al agregar ave", error);
    }
  };

  const handleUpdateAve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aveEditar) return;
    try {
      const formData = new FormData();
      
      formData.append("nombre", aveEditar.nombre ?? "");
      formData.append("descripcion", aveEditar.descripcion ?? "");
      formData.append("alimentacion", aveEditar.alimentacion ?? "");
      formData.append("funcionEcos", aveEditar.funcionEcos ?? "");
      
      if (aveEditar.idFamilia !== null && aveEditar.idFamilia !== undefined) {
        formData.append("idFamilia", aveEditar.idFamilia.toString());
      }
      if (aveEditar.idCategoria !== null && aveEditar.idCategoria !== undefined) {
        formData.append("idCategoria", aveEditar.idCategoria.toString());
      }
      if (aveEditar.idEstatus !== null && aveEditar.idEstatus !== undefined) {
        formData.append("idEstatus", aveEditar.idEstatus.toString());
      }
      if (aveEditar.idHabitat !== null && aveEditar.idHabitat !== undefined) {
        formData.append("idHabitat", aveEditar.idHabitat.toString());
      }
  
      formData.append("activa", aveEditar.activa ? "true" : "false");
      formData.append("listaRoja", aveEditar.listaRoja ? "true" : "false");
  
      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }
  
      await api.put(`/Aves/${aveEditar.idAve}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      setModalEditShow(false);
      cargarDatos();
      setShowToast(true);
    } catch (error) {
      console.error("Error al actualizar ave", error);
    }
  };
  

  // Manejar filtros
  const manejarFiltro = (id: number, filtroActual: number[], setFiltro: (val: number[]) => void) => {
    if (filtroActual.includes(id)) {
      setFiltro(filtroActual.filter(f => f !== id));
    } else {
      setFiltro([...filtroActual, id]);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let avesFiltradas = [...aves];

    if (filtroFamilias.length > 0) {
      avesFiltradas = avesFiltradas.filter(ave => filtroFamilias.includes(ave.idFamilia || 0));
    }
    if (filtroCategorias.length > 0) {
      avesFiltradas = avesFiltradas.filter(ave => filtroCategorias.includes(ave.idCategoria || 0));
    }
    if (filtroEstatus.length > 0) {
      avesFiltradas = avesFiltradas.filter(ave => filtroEstatus.includes(ave.idEstatus || 0));
    }
    if (filtroHabitats.length > 0) {
      avesFiltradas = avesFiltradas.filter(ave => filtroHabitats.includes(ave.idHabitat || 0));
    }

    setAvesFiltradas(avesFiltradas);
  }, [filtroFamilias, filtroCategorias, filtroEstatus, filtroHabitats, aves]);

  const limpiarFiltros = () => {
    setFiltroFamilias([]);
    setFiltroCategorias([]);
    setFiltroEstatus([]);
    setFiltroHabitats([]);
    setAvesFiltradas(aves);
  };

  return (
    <div className="container-fluid py-5">
      {/* Título */}
      <h2 className="mb-5 display-5 fw-semibold text-center">Galería de Aves 🦜</h2>
      
      {usuarioLogueado && (
  <div className="text-center mb-4">
    <Button variant="outline-primary" className="fw-bold" onClick={handleOpenAddModal}>
      + Agregar Ave
    </Button>
  </div>
)}

      {/* Contenedor principal que contiene filtros y galería */}
      <div className="row">
        {/* Columna de filtros */}
        <div className="col-12 col-md-3 mb-4">
          <div className="p-3 bg-light rounded-4 shadow-sm">
            <h5 className="fw-bold mb-3">Filtros</h5>

            {/* Familia */}
            <div className="mb-3">
              <h6 className="fw-semibold">Familia</h6>
              {familias.map(f => (
                <div key={f.idFamilia} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`familia-${f.idFamilia}`}
                    checked={filtroFamilias.includes(f.idFamilia)}
                    onChange={() => manejarFiltro(f.idFamilia, filtroFamilias, setFiltroFamilias)}
                  />
                  <label className="form-check-label" htmlFor={`familia-${f.idFamilia}`}>
                    {f.descripcion}
                  </label>
                </div>
              ))}
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <h6 className="fw-semibold">Categoría</h6>
              {categorias.map(c => (
                <div key={c.idCategoria} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`categoria-${c.idCategoria}`}
                    checked={filtroCategorias.includes(c.idCategoria)}
                    onChange={() => manejarFiltro(c.idCategoria, filtroCategorias, setFiltroCategorias)}
                  />
                  <label className="form-check-label" htmlFor={`categoria-${c.idCategoria}`}>
                    {c.descripcion}
                  </label>
                </div>
              ))}
            </div>

            {/* Estatus */}
            <div className="mb-3">
              <h6 className="fw-semibold">Estatus</h6>
              {estatus.map(e => (
                <div key={e.idEstatus} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`estatus-${e.idEstatus}`}
                    checked={filtroEstatus.includes(e.idEstatus)}
                    onChange={() => manejarFiltro(e.idEstatus, filtroEstatus, setFiltroEstatus)}
                  />
                  <label className="form-check-label" htmlFor={`estatus-${e.idEstatus}`}>
                    {e.descripcion}
                  </label>
                </div>
              ))}
            </div>

            {/* Hábitat */}
            <div className="mb-3">
              <h6 className="fw-semibold">Hábitat</h6>
              {habitats.map(h => (
                <div key={h.idHabitat} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`habitat-${h.idHabitat}`}
                    checked={filtroHabitats.includes(h.idHabitat)}
                    onChange={() => manejarFiltro(h.idHabitat, filtroHabitats, setFiltroHabitats)}
                  />
                  <label className="form-check-label" htmlFor={`habitat-${h.idHabitat}`}>
                    {h.descripcion}
                  </label>
                </div>
              ))}
            </div>

            <Button variant="outline-danger" className="mt-2 w-100" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Columna de la galería */}
        <div className="col-12 col-md-9">
          <div className="row g-4">
            {avesFiltradas.length === 0 ? (
              <div className="col-12">
                <p className="text-center text-muted">No se encontraron aves con esos filtros.</p>
              </div>
            ) : (
              avesFiltradas.map((ave) => (
                <div key={ave.idAve} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    {ave.nombreImagen ? (
                      <img src={`https://localhost:7164/api/imagenes/${ave.nombreImagen}`} alt={ave.nombre ?? "Imagen de ave"} className="card-img-top rounded-top-4" style={{ height: "220px", objectFit: "cover" }} />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center rounded-top-4" style={{ height: "220px" }}>
                        <span className="text-muted">Sin imagen</span>
                      </div>
                    )}
                    <div className="card-body">
                      <h5 className="card-title fw-bold">{ave.nombre}</h5>
                      <p className="card-text text-muted">{ave.descripcion?.substring(0, 50) ?? "Sin descripción"}...</p>
                    </div>
                    <div className="card-footer bg-white border-0 d-flex justify-content-around pb-4">
  {usuarioLogueado && (
    <>
      <Button variant="outline-success" size="sm" onClick={() => handleOpenEditModal(ave)}>✏️ Editar</Button>
      <Button variant="outline-danger" size="sm" onClick={() => handleOpenDeleteModal(ave)}>🗑️ Eliminar</Button>
    </>
  )}
  <Button variant="outline-info" size="sm" onClick={() => navigate(`/aves/${ave.idAve}`)}>
    👁️ Ver Detalles
  </Button>
</div>



                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Agregar y Editar */}
      <Modal show={modalEditShow || modalAddShow} onHide={() => { setModalEditShow(false); setModalAddShow(false); }} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalEditShow ? "Editar Ave" : "Agregar Nueva Ave"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <form onSubmit={modalEditShow ? handleUpdateAve : handleAddAve}>
              <Row>
                <Col md={4} className="text-center">
                  {imagenPreview ? (
                    <img src={imagenPreview} alt="Preview" className="img-fluid rounded mb-3" />
                  ) : (
                    <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: "300px" }}>
                      <span className="text-muted">Sin imagen</span>
                    </div>
                  )}
                  <input type="file" className="form-control" onChange={handleFileChange} />
                </Col>
                <Col md={4}>
                  {/* Campos Nombre, Descripción, Alimentación, Función Ecosistema */}
                  <input type="text" className="form-control mb-3" placeholder="Nombre" value={modalEditShow ? (aveEditar?.nombre || '') : (nuevaAve.nombre || '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, nombre: e.target.value }) : setNuevaAve({ ...nuevaAve, nombre: e.target.value })} required />
                  <textarea className="form-control mb-3" placeholder="Descripción" value={modalEditShow ? (aveEditar?.descripcion || '') : (nuevaAve.descripcion || '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, descripcion: e.target.value }) : setNuevaAve({ ...nuevaAve, descripcion: e.target.value })} rows={2} />
                  <textarea className="form-control mb-3" placeholder="Alimentación" value={modalEditShow ? (aveEditar?.alimentacion || '') : (nuevaAve.alimentacion || '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, alimentacion: e.target.value }) : setNuevaAve({ ...nuevaAve, alimentacion: e.target.value })} rows={2} />
                  <textarea className="form-control mb-3" placeholder="Función en Ecosistema" value={modalEditShow ? (aveEditar?.funcionEcos || '') : (nuevaAve.funcionEcos || '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, funcionEcos: e.target.value }) : setNuevaAve({ ...nuevaAve, funcionEcos: e.target.value })} rows={2} />
                </Col>
                <Col md={4}>
                  {/* Select Familia */}
                  <select className="form-select mb-3" value={modalEditShow ? (aveEditar?.idFamilia ?? '') : (nuevaAve.idFamilia ?? '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, idFamilia: Number(e.target.value) }) : setNuevaAve({ ...nuevaAve, idFamilia: Number(e.target.value) })}>
                    <option value="">Seleccionar Familia</option>
                    {familias.map(f => (<option key={f.idFamilia} value={f.idFamilia}>{f.descripcion}</option>))}
                  </select>
                  {/* Select Categoria */}
                  <select className="form-select mb-3" value={modalEditShow ? (aveEditar?.idCategoria ?? '') : (nuevaAve.idCategoria ?? '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, idCategoria: Number(e.target.value) }) : setNuevaAve({ ...nuevaAve, idCategoria: Number(e.target.value) })}>
                    <option value="">Seleccionar Categoría</option>
                    {categorias.map(c => (<option key={c.idCategoria} value={c.idCategoria}>{c.descripcion}</option>))}
                  </select>
                  {/* Select Estatus */}
                  <select className="form-select mb-3" value={modalEditShow ? (aveEditar?.idEstatus ?? '') : (nuevaAve.idEstatus ?? '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, idEstatus: Number(e.target.value) }) : setNuevaAve({ ...nuevaAve, idEstatus: Number(e.target.value) })}>
                    <option value="">Seleccionar Estatus</option>
                    {estatus.map(e => (<option key={e.idEstatus} value={e.idEstatus}>{e.descripcion}</option>))}
                  </select>
                  {/* Select Habitat */}
                  <select className="form-select mb-3" value={modalEditShow ? (aveEditar?.idHabitat ?? '') : (nuevaAve.idHabitat ?? '')} onChange={(e) => modalEditShow ? setAveEditar({ ...aveEditar!, idHabitat: Number(e.target.value) }) : setNuevaAve({ ...nuevaAve, idHabitat: Number(e.target.value) })}>
                    <option value="">Seleccionar Hábitat</option>
                    {habitats.map(h => (<option key={h.idHabitat} value={h.idHabitat}>{h.descripcion}</option>))}
                  </select>
                  <Button variant="success" type="submit" className="w-100">
                    {modalEditShow ? "Guardar Cambios" : "Guardar Nueva Ave"}
                  </Button>
                </Col>
              </Row>
            </form>
          </Container>
        </Modal.Body>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {aveEliminar && <p>¿Estás seguro de eliminar "{aveEliminar.nombre}"?</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteAve}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={2000} autohide>
          <Toast.Body className="text-white">✅ Operación exitosa</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AvesIndex;