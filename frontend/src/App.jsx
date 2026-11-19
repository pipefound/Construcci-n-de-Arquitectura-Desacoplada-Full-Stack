import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package, CheckCircle, AlertCircle, RefreshCw, Lock, LogIn, LogOut, ShieldCheck } from 'lucide-react';

// URL productiva de tu Web Service en Render
const API_URL = "https://inventario-backend-udw5.onrender.com/api";

export default function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Estados de Autenticación JWT (+10 pts)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [credenciales, setCredenciales] = useState({ username: 'admin', password: '' });

  // Estado del Formulario CRUD
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    proveedor: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resProd, resCat, resProv] = await Promise.all([
        axios.get(`${API_URL}/productos/`),
        axios.get(`${API_URL}/categorias/`),
        axios.get(`${API_URL}/proveedores/`)
      ]);
      setProductos(resProd.data);
      setCategorias(resCat.data);
      setProveedores(resProv.data);
    } catch (error) {
      mostrarMensaje("Error al conectar con la API en Render", "error");
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = "exito") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  // --- LÓGICA DE LOGIN JWT ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await axios.post(`${API_URL}/token/`, credenciales);
      const jwtToken = res.data.access;
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      setMostrarModalLogin(false);
      mostrarMensaje("¡Autenticación exitosa! Token JWT guardado.", "exito");
    } catch (error) {
      mostrarMensaje("Credenciales inválidas. Revisa usuario y contraseña.", "error");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setToken(null);
    localStorage.removeItem('token');
    mostrarMensaje("Sesión cerrada correctamente", "exito");
  };

  // Helper para enviar el Token JWT en las cabeceras HTTP
  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // --- OPERACIONES CRUD PROTEGIDAS CON JWT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMostrarModalLogin(true);
      mostrarMensaje("Debes iniciar sesión con JWT para registrar productos", "error");
      return;
    }

    setCargando(true);
    try {
      if (editandoId) {
        // PUT protegido con Bearer Token
        await axios.put(`${API_URL}/productos/${editandoId}/`, formData, getAuthHeaders());
        mostrarMensaje("Producto actualizado exitosamente");
      } else {
        // POST protegido con Bearer Token
        await axios.post(`${API_URL}/productos/`, formData, getAuthHeaders());
        mostrarMensaje("Producto registrado con éxito");
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        cerrarSesion();
        mostrarMensaje("Tu sesión expiró. Inicia sesión nuevamente.", "error");
      } else {
        mostrarMensaje("Error al procesar la solicitud en el servidor", "error");
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (!token) {
      setMostrarModalLogin(true);
      mostrarMensaje("Debes iniciar sesión con JWT para eliminar registros", "error");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    setCargando(true);
    try {
      // DELETE protegido con Bearer Token
      await axios.delete(`${API_URL}/productos/${id}/`, getAuthHeaders());
      mostrarMensaje("Producto eliminado correctamente");
      cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al intentar eliminar el registro", "error");
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (prod) => {
    setEditandoId(prod.id);
    setFormData({
      codigo: prod.codigo,
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      stock: prod.stock,
      categoria: prod.categoria,
      proveedor: prod.proveedor
    });
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormData({ codigo: '', nombre: '', descripcion: '', precio: '', stock: '', categoria: '', proveedor: '' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '1.5rem 2rem', fontFamily: 'system-ui, sans-serif' }}>

      {/* Barra Superior */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package color="#b91c1c" size={26} /> Sistema de Inventario Desacoplado
          </h1>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Evaluación Sumativa TI3041 &bull; Django REST en Render + React en Vercel
          </p>
        </div>

        {/* Zona de Estado JWT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534', background: '#dcfce7', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                <ShieldCheck size={16} /> JWT Activo (Admin)
              </span>
              <button onClick={cerrarSesion} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <LogOut size={15} /> Salir
              </button>
            </div>
          ) : (
            <button onClick={() => setMostrarModalLogin(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
              <LogIn size={16} /> Iniciar Sesión (JWT)
            </button>
          )}

          <button onClick={cargarDatos} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Alertas */}
      {mensaje && (
        <div style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: mensaje.tipo === 'error' ? '#fef2f2' : '#f0fdf4', color: mensaje.tipo === 'error' ? '#991b1b' : '#166534', border: `1px solid ${mensaje.tipo === 'error' ? '#f87171' : '#86efac'}` }}>
          {mensaje.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <strong>{mensaje.texto}</strong>
        </div>
      )}

      {/* Modal de Inicio de Sesión JWT */}
      {mostrarModalLogin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Lock size={20} color="#b91c1c" /> Autenticación JWT
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.2rem' }}>
              Ingresa para obtener tu Bearer Token y autorizar operaciones CRUD.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Usuario</label>
                <input required type="text" value={credenciales.username} onChange={(e) => setCredenciales({ ...credenciales, username: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Contraseña</label>
                <input required type="password" placeholder="admin123" value={credenciales.password} onChange={(e) => setCredenciales({ ...credenciales, password: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button type="submit" disabled={cargando} style={{ flex: 1, padding: '0.6rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {cargando ? 'Verificando...' : 'Obtener Token'}
                </button>
                <button type="button" onClick={() => setMostrarModalLogin(false)} style={{ padding: '0.6rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Principal con diseño amplio */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>

        {/* Formulario */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: '#0f172a' }}>
            {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Código SKU</label>
              <input required type="text" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Nombre del Producto</label>
              <input required type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Precio Unitario ($)</label>
              <input required type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Stock Disponible</label>
              <input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Categoría</label>
              <select required value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Selecciona Categoría...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>Proveedor</label>
              <select required value={formData.proveedor} onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Selecciona Proveedor...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={cargando} style={{ flex: 1, padding: '0.6rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editandoId ? 'Actualizar (JWT)' : 'Registrar (JWT)'}
              </button>
              {editandoId && (
                <button type="button" onClick={limpiarFormulario} style={{ padding: '0.6rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla Ancha */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: '#0f172a' }}>Catálogo de Productos en Nube (PostgreSQL)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem' }}>SKU</th>
                  <th style={{ padding: '0.75rem' }}>Nombre</th>
                  <th style={{ padding: '0.75rem' }}>Categoría</th>
                  <th style={{ padding: '0.75rem' }}>Precio</th>
                  <th style={{ padding: '0.75rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>{p.codigo}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{p.nombre}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{p.categoria_nombre}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>${Number(p.precio).toLocaleString('es-CL')}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: p.stock > 10 ? '#dcfce7' : '#fee2e2', color: p.stock > 10 ? '#15803d' : '#b91c1c' }}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button onClick={() => iniciarEdicion(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', marginRight: '0.6rem' }} title="Editar">
                        <Edit2 size={17} />
                      </button>
                      <button onClick={() => eliminarProducto(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Eliminar">
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}