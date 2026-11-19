import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Package, LogIn, LogOut, ShieldCheck, RefreshCw,
  Edit2, Trash2, CheckCircle, AlertCircle, Lock,
  Eye, TrendingUp, Layers, Users, ChevronRight, X
} from 'lucide-react';

const API_URL = "https://inventario-backend-udw5.onrender.com/api";

/* ─── Estilos de glassmorphism reutilizables ─── */
const glass = {
  panel: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.9rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  btnPrimary: {
    padding: '0.65rem 1.4rem',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
    transition: 'transform 0.15s',
  },
  btnDanger: {
    padding: '0.65rem 1.4rem',
    background: 'linear-gradient(135deg, #dc2626, #9f1239)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  btnGhost: {
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem',
  }
};

/* ─── Fondo animado con orbes de luz ─── */
function AnimatedBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #020817 0%, #0f0a2e 50%, #020817 100%)' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', animation: 'pulse 10s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)' }} />
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>
    </div>
  );
}

/* ─── Componente: Card de Producto (vista previa en lobby) ─── */
function ProductCard({ producto, bloqueado }) {
  return (
    <div style={{ ...glass.card, padding: '1.2rem', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', cursor: bloqueado ? 'default' : 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      {bloqueado && (
        <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(2,8,23,0.6)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', zIndex: 2 }}>
          <Lock size={22} color="rgba(139,92,246,0.9)" />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Inicia sesión para ver detalles</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#7c3aed', background: 'rgba(124,58,237,0.15)', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(124,58,237,0.3)' }}>
          {producto.codigo}
        </span>
        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: producto.stock > 10 ? 'rgba(21,128,61,0.2)' : 'rgba(185,28,28,0.2)', color: producto.stock > 10 ? '#4ade80' : '#f87171', border: `1px solid ${producto.stock > 10 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
          {producto.stock} un.
        </span>
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.3rem', lineHeight: 1.3 }}>{producto.nombre}</h3>
      <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.8rem' }}>{producto.categoria_nombre}</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a78bfa' }}>${Number(producto.precio).toLocaleString('es-CL')}</p>
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function App() {
  const [vista, setVista] = useState('home'); // 'home' | 'dashboard'
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [credenciales, setCredenciales] = useState({ username: 'admin', password: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '', descripcion: '', precio: '', stock: '', categoria: '', proveedor: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [rP, rC, rPr] = await Promise.all([
        axios.get(`${API_URL}/productos/`),
        axios.get(`${API_URL}/categorias/`),
        axios.get(`${API_URL}/proveedores/`)
      ]);
      setProductos(rP.data);
      setCategorias(rC.data);
      setProveedores(rPr.data);
    } catch { mostrarMsg("Error al conectar con la API", "error"); }
    finally { setCargando(false); }
  };

  const mostrarMsg = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await axios.post(`${API_URL}/token/`, credenciales);
      const tk = res.data.access;
      setToken(tk);
      localStorage.setItem('token', tk);
      setMostrarLogin(false);
      setVista('dashboard');
      mostrarMsg("¡Autenticación JWT exitosa! Bienvenido al sistema.", "exito");
    } catch { mostrarMsg("Credenciales inválidas. Verifica usuario y contraseña.", "error"); }
    finally { setCargando(false); }
  };

  const cerrarSesion = () => {
    setToken(null);
    localStorage.removeItem('token');
    setVista('home');
    mostrarMsg("Sesión cerrada correctamente.", "exito");
  };

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setMostrarLogin(true); return; }
    setCargando(true);
    try {
      if (editandoId) {
        await axios.put(`${API_URL}/productos/${editandoId}/`, formData, authHeaders());
        mostrarMsg("Producto actualizado correctamente.");
      } else {
        await axios.post(`${API_URL}/productos/`, formData, authHeaders());
        mostrarMsg("Producto registrado con éxito.");
      }
      limpiarForm();
      cargarDatos();
    } catch (err) {
      if (err.response?.status === 401) { cerrarSesion(); mostrarMsg("Sesión expirada. Inicia sesión nuevamente.", "error"); }
      else mostrarMsg("Error al procesar la solicitud.", "error");
    } finally { setCargando(false); }
  };

  const eliminar = async (id) => {
    if (!token) { setMostrarLogin(true); return; }
    if (!window.confirm("¿Eliminar este producto?")) return;
    setCargando(true);
    try {
      await axios.delete(`${API_URL}/productos/${id}/`, authHeaders());
      mostrarMsg("Producto eliminado."); cargarDatos();
    } catch { mostrarMsg("Error al eliminar.", "error"); }
    finally { setCargando(false); }
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setFormData({ codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria: p.categoria, proveedor: p.proveedor });
  };

  const limpiarForm = () => {
    setEditandoId(null);
    setFormData({ codigo: '', nombre: '', descripcion: '', precio: '', stock: '', categoria: '', proveedor: '' });
  };

  const inputStyle = { ...glass.input };
  const labelStyle = { fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.3rem', display: 'block', letterSpacing: '0.05em' };

  return (
    <>
      <AnimatedBackground />

      {/* ── ALERTA FLOTANTE ── */}
      {mensaje && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, ...glass.card, padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: '380px', borderColor: mensaje.tipo === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)', animation: 'fadeUp 0.3s ease' }}>
          {mensaje.tipo === 'error' ? <AlertCircle size={18} color="#f87171" /> : <CheckCircle size={18} color="#4ade80" />}
          <span style={{ fontSize: '0.88rem', color: mensaje.tipo === 'error' ? '#fca5a5' : '#bbf7d0' }}>{mensaje.texto}</span>
        </div>
      )}

      {/* ── MODAL DE LOGIN ── */}
      {mostrarLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ ...glass.panel, padding: '2.5rem', width: '100%', maxWidth: '400px', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={20} color="#7c3aed" /> Autenticación JWT
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>Ingresa para obtener tu Bearer Token</p>
              </div>
              <button onClick={() => setMostrarLogin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>USUARIO</label>
                <input style={inputStyle} type="text" value={credenciales.username} onChange={e => setCredenciales({ ...credenciales, username: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>CONTRASEÑA</label>
                <input style={inputStyle} type="password" placeholder="admin123" value={credenciales.password} onChange={e => setCredenciales({ ...credenciales, password: e.target.value })} required />
              </div>
              <button type="submit" disabled={cargando} style={{ ...glass.btnPrimary, width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
                {cargando ? 'Verificando...' : '🔐 Obtener Bearer Token'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ VISTA: HOME / LOBBY ══════════════ */}
      {vista === 'home' && (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '2rem' }}>
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>
                <Package size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Inventario TI3041</h1>
                <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0 }}>INACAP · Felipe Álvarez</p>
              </div>
            </div>
            <button onClick={() => setMostrarLogin(true)} style={{ ...glass.btnPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogIn size={16} /> Iniciar Sesión (JWT)
            </button>
          </header>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '4rem', animation: 'fadeUp 0.6s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={14} color="#a78bfa" />
              <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: '600' }}>Sistema Desacoplado · Django REST + React + PostgreSQL</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2, marginBottom: '1rem' }}>
              Sistema de Gestión<br />de Inventario
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              Arquitectura Full Stack desacoplada. Backend en Render.com · Frontend en Vercel · Base de datos PostgreSQL en la nube.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              {[
                { icon: <Package size={20} color="#a78bfa" />, valor: productos.length, label: 'Productos' },
                { icon: <Layers size={20} color="#60a5fa" />, valor: categorias.length, label: 'Categorías' },
                { icon: <Users size={20} color="#34d399" />, valor: proveedores.length, label: 'Proveedores' },
                { icon: <TrendingUp size={20} color="#f472b6" />, valor: 'Live', label: 'Estado API' },
              ].map((s, i) => (
                <div key={i} style={{ ...glass.card, padding: '1.2rem 2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f1f5f9' }}>{s.valor}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setMostrarLogin(true)} style={{ ...glass.btnPrimary, fontSize: '1rem', padding: '0.9rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
              Acceder al Sistema <ChevronRight size={18} />
            </button>
          </div>

          {/* Preview de Productos */}
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} /> Vista previa del catálogo
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                🔒 Gestión disponible solo con sesión activa
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.2rem' }}>
              {productos.slice(0, 2).map(p => <ProductCard key={p.id} producto={p} bloqueado={false} />)}
              {productos.slice(2).map(p => <ProductCard key={p.id} producto={p} bloqueado={true} />)}
            </div>
            {productos.length === 0 && !cargando && (
              <p style={{ textAlign: 'center', color: '#475569', padding: '2rem' }}>Conectando con la API en Render...</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ VISTA: DASHBOARD ══════════════ */}
      {vista === 'dashboard' && (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '1.5rem 2rem' }}>

          {/* Header del Dashboard */}
          <header style={{ ...glass.panel, padding: '1rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#f1f5f9' }}>Dashboard de Inventario</h1>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Evaluación TI3041 · Django REST + React + PostgreSQL + Docker</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1px solid rgba(74,222,128,0.2)' }}>
                <ShieldCheck size={15} /> JWT Activo
              </span>
              <button onClick={() => setVista('home')} style={{ ...glass.btnGhost, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                <Eye size={14} /> Home
              </button>
              <button onClick={cargarDatos} style={{ ...glass.btnGhost, padding: '0.55rem' }}><RefreshCw size={15} /></button>
              <button onClick={cerrarSesion} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
                <LogOut size={14} /> Salir
              </button>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Formulario CRUD */}
            <div style={{ ...glass.panel, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: '1rem', fontWeight: '700', color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
                {editandoId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'CÓDIGO SKU', key: 'codigo', type: 'text' },
                  { label: 'NOMBRE DEL PRODUCTO', key: 'nombre', type: 'text' },
                  { label: 'PRECIO UNITARIO ($)', key: 'precio', type: 'number' },
                  { label: 'STOCK DISPONIBLE', key: 'stock', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input required type={f.type} step={f.key === 'precio' ? '0.01' : undefined} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>CATEGORÍA</label>
                  <select required value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} style={{ ...inputStyle }}>
                    <option value="">Selecciona...</option>
                    {categorias.map(c => <option key={c.id} value={c.id} style={{ background: '#1e293b' }}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>PROVEEDOR</label>
                  <select required value={formData.proveedor} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} style={{ ...inputStyle }}>
                    <option value="">Selecciona...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.nombre}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <button type="submit" disabled={cargando} style={{ ...glass.btnPrimary, flex: 1 }}>
                    {editandoId ? 'Actualizar (JWT)' : 'Registrar (JWT)'}
                  </button>
                  {editandoId && (
                    <button type="button" onClick={limpiarForm} style={{ ...glass.btnGhost }}><X size={16} /></button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabla de Productos */}
            <div style={{ ...glass.panel, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: '1rem', fontWeight: '700', color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#a78bfa" /> Catálogo en Nube · PostgreSQL en Render
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: '400', color: '#475569' }}>{productos.length} registros</span>
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['SKU', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '0.7rem 0.9rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '0.9rem', fontWeight: '700', color: '#7c3aed', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.codigo}</td>
                        <td style={{ padding: '0.9rem', color: '#e2e8f0', fontWeight: '500' }}>{p.nombre}</td>
                        <td style={{ padding: '0.9rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{p.categoria_nombre}</span>
                        </td>
                        <td style={{ padding: '0.9rem', fontWeight: '600', color: '#a78bfa' }}>${Number(p.precio).toLocaleString('es-CL')}</td>
                        <td style={{ padding: '0.9rem' }}>
                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: p.stock > 10 ? 'rgba(21,128,61,0.2)' : 'rgba(185,28,28,0.2)', color: p.stock > 10 ? '#4ade80' : '#f87171', border: `1px solid ${p.stock > 10 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
                            {p.stock} un.
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => iniciarEdicion(p)} style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#60a5fa' }} title="Editar">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => eliminar(p.id)} style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#f87171' }} title="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {productos.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                        {cargando ? 'Cargando desde Render...' : 'Sin productos registrados.'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}