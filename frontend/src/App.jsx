import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// REEMPLAZA ESTA URL CON TU URL REAL DE RENDER TERMINADA EN /api
const API_URL = "https://inventario-backend-udw5.onrender.com/api";

export default function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Estado para el formulario (Creación / Edición)
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

  // Cargar datos iniciales al montar la aplicación
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (editandoId) {
        // Operación PUT (Actualizar)
        await axios.put(`${API_URL}/productos/${editandoId}/`, formData);
        mostrarMensaje("Producto actualizado exitosamente");
      } else {
        // Operación POST (Crear)
        await axios.post(`${API_URL}/productos/`, formData);
        mostrarMensaje("Producto registrado con éxito");
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al procesar la solicitud. Revisa los campos.", "error");
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

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    setCargando(true);
    try {
      // Operación DELETE
      await axios.delete(`${API_URL}/productos/${id}/`);
      mostrarMensaje("Producto eliminado correctamente");
      cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al intentar eliminar el registro", "error");
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      proveedor: ''
    });
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 2rem' }}>

        {/* Cabecera */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package color="#b91c1c" /> Sistema de Inventario Desacoplado
            </h1>
            <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Evaluación Sumativa TI3041 &bull; Backend Django en Render + Frontend React
            </p>
          </div>
          <button onClick={cargarDatos} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            <RefreshCw size={16} /> Recargar
          </button>
        </header>

        {/* Mensajes de Alerta */}
        {mensaje && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: mensaje.tipo === 'error' ? '#fef2f2' : '#f0fdf4', color: mensaje.tipo === 'error' ? '#991b1b' : '#166534', border: `1px solid ${mensaje.tipo === 'error' ? '#f87171' : '#86efac'}` }}>
            {mensaje.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

          {/* Formulario de Creación / Edición */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', marginTop: 0, color: '#0f172a' }}>
              {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Código SKU</label>
                <input required type="text" name="codigo" value={formData.codigo} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Nombre del Producto</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Precio Unitario ($)</label>
                <input required type="number" step="0.01" name="precio" value={formData.precio} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Stock Disponible</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Categoría</label>
                <select required name="categoria" value={formData.categoria} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  <option value="">Selecciona Categoría...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>Proveedor</label>
                <select required name="proveedor" value={formData.proveedor} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  <option value="">Selecciona Proveedor...</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={cargando} style={{ flex: 1, padding: '0.6rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editandoId ? 'Guardar Cambios' : 'Registrar'}
                </button>
                {editandoId && (
                  <button type="button" onClick={limpiarFormulario} style={{ padding: '0.6rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabla de Productos */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', marginTop: 0, color: '#0f172a' }}>Catálogo de Productos en Nube</h2>
            {cargando && <p style={{ color: '#64748b' }}>Cargando datos desde Render...</p>}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                    <th style={{ padding: '0.6rem' }}>SKU</th>
                    <th style={{ padding: '0.6rem' }}>Nombre</th>
                    <th style={{ padding: '0.6rem' }}>Categoría</th>
                    <th style={{ padding: '0.6rem' }}>Precio</th>
                    <th style={{ padding: '0.6rem' }}>Stock</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>{p.codigo}</td>
                      <td style={{ padding: '0.6rem' }}>{p.nombre}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{p.categoria_nombre}</td>
                      <td style={{ padding: '0.6rem' }}>${Number(p.precio).toLocaleString('es-CL')}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: p.stock > 10 ? '#dcfce7' : '#fee2e2', color: p.stock > 10 ? '#15803d' : '#b91c1c' }}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <button onClick={() => iniciarEdicion(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', marginRight: '0.5rem' }} title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => eliminarProducto(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && !cargando && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No hay productos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}