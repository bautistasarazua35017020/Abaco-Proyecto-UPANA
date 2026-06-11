import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5005'
  : `http://${window.location.hostname}:5005`;

// ── Ábaco SVG ilustrativo (1 cuenta arriba, 4 abajo — estructura real) ───────
function AbacoSVG() {
  // Colores por varilla
  const colores = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#FF9FF3'];
  const varillas = [44, 76, 108, 140, 172];

  // Arriba: 1 sola cuenta por varilla. activa=true si está empujada hacia el divisor
  const arribaActiva = [true, false, true, false, true];

  // Abajo: 4 cuentas por varilla. cuántas están empujadas arriba (hacia divisor)
  const abajoActivas = [2, 1, 3, 4, 2];

  return (
    <svg viewBox="0 0 220 210" width="200" height="190" xmlns="http://www.w3.org/2000/svg">
      {/* Marco exterior */}
      <rect x="10" y="10" width="200" height="190" rx="16" ry="16"
        fill="#2d1b69" stroke="#a855f7" strokeWidth="3" />
      {/* Marco interior decorativo */}
      <rect x="18" y="18" width="184" height="174" rx="12" ry="12"
        fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />

      {/* Varillas */}
      {varillas.map((x, i) => (
        <line key={i} x1={x} y1="25" x2={x} y2="185"
          stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
      ))}

      {/* Línea divisora */}
      <rect x="18" y="100" width="184" height="5" rx="2" fill="rgba(255,255,255,0.18)" />

      {/* CUENTAS ARRIBA — 1 por varilla */}
      {varillas.map((cx, i) => {
        const activa = arribaActiva[i];
        // activa = pegada al divisor (cy=88), inactiva = pegada arriba (cy=40)
        const cy = activa ? 88 : 40;
        return (
          <g key={`arr-${i}`}>
            <ellipse cx={cx} cy={cy} rx="13" ry="11"
              fill={activa ? colores[i] : 'rgba(255,255,255,0.08)'}
              stroke={activa ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)'}
              strokeWidth="1.5" />
            {activa && (
              <ellipse cx={cx - 4} cy={cy - 4} rx="3.5" ry="2.5"
                fill="rgba(255,255,255,0.38)" />
            )}
          </g>
        );
      })}

      {/* CUENTAS ABAJO — 4 por varilla */}
      {varillas.map((cx, i) => {
        const activas = abajoActivas[i];
        return Array.from({ length: 4 }, (_, j) => {
          // j=0 es la más cercana al divisor
          // activas primeras j < activas están pegadas arriba (cerca del divisor)
          const estaActiva = j < activas;
          // posición: las activas van desde cy=116 hacia abajo de a 24px
          // las inactivas van desde cy=185-11 hacia arriba
          const cy = estaActiva
            ? 116 + j * 24
            : 174 - (3 - j) * 24;
          return (
            <g key={`abj-${i}-${j}`}>
              <ellipse cx={cx} cy={cy} rx="13" ry="11"
                fill={estaActiva ? colores[i] : 'rgba(255,255,255,0.08)'}
                stroke={estaActiva ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1.5" />
              {estaActiva && (
                <ellipse cx={cx - 4} cy={cy - 4} rx="3.5" ry="2.5"
                  fill="rgba(255,255,255,0.38)" />
              )}
            </g>
          );
        });
      })}

      {/* Tornillos decorativos en esquinas */}
      {[[20, 20], [200, 20], [20, 200], [200, 200]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="rgba(168,85,247,0.5)" />
      ))}
    </svg>
  );
}

export default function Login() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (nombre && apellido && pin) {
      try {
        const respuesta = await fetch(`${API_BASE_URL}/api/Usuarios/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, apellido, pinAcceso: pin }),
        });

        if (respuesta.ok) {
          const data = await respuesta.json();
          const usuarioValidado = { ...data, tieneMedalla: false };
          localStorage.setItem('usuarioMate', JSON.stringify(usuarioValidado));
          navigate('/menu');
        } else {
          const errorData = await respuesta.json();
          setError(errorData.mensaje || 'Credenciales incorrectas. Intenta de nuevo.');
        }
      } catch (err) {
        setError('Error de conexión. Verifica que el servidor esté encendido.');
      }
    }
    setCargando(false);
  };

  const inputStyle = (field) => ({
    padding: '14px 16px',
    borderRadius: 14,
    border: `2px solid ${focusField === field ? '#a855f7' : 'rgba(255,255,255,0.12)'}`,
    fontSize: 15,
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    outline: 'none',
    background: 'rgba(255,255,255,0.07)',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    boxShadow: focusField === field ? '0 0 0 4px rgba(168,85,247,0.15)' : 'none',
  });

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Blobs de fondo */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { color: '#a855f7', x: '5%',  y: '10%', size: 380 },
            { color: '#4C6EF5', x: '70%', y: '55%', size: 320 },
            { color: '#00C9A7', x: '55%', y: '5%',  size: 220 },
            { color: '#FF6B35', x: '15%', y: '65%', size: 180 },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', left: b.x, top: b.y,
              width: b.size, height: b.size, borderRadius: '50%',
              background: b.color, opacity: 0.12, filter: 'blur(75px)',
              animation: `blobFloat${i} ${4 + i}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        {/* Card principal */}
        <div style={{
          width: '100%', maxWidth: 860,
          display: 'grid', gridTemplateColumns: '1fr 1.3fr',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(30px)',
          borderRadius: 32, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative', zIndex: 10,
          animation: 'cardIn 0.6s cubic-bezier(.34,1.2,.64,1) both',
        }}>

          {/* ── IZQUIERDA: Visual ─────────────────────────────── */}
          <div style={{
            padding: '50px 30px',
            background: 'linear-gradient(160deg, rgba(168,85,247,0.28) 0%, rgba(76,110,245,0.18) 100%)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: 20,
          }}>

            {/* Ábaco SVG con glow */}
            <div style={{
              filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.5))',
              animation: 'floatAnim 3s ease-in-out infinite alternate',
            }}>
              <AbacoSVG />
            </div>

            <div>
              <h1 style={{
                color: 'white', fontSize: '2.4rem', fontWeight: 900,
                margin: '0 0 10px',
                textShadow: '0 2px 20px rgba(168,85,247,0.6)',
                letterSpacing: '-0.02em',
              }}>
                Ábaco
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
                fontWeight: 600, lineHeight: 1.6, margin: 0,
              }}>
                Despierta tu mente y aprende<br />
                el arte milenario del Soroban japonés.
              </p>
            </div>

            {/* Decoración de puntos */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {['#a855f7', '#4C6EF5', '#00C9A7'].map((c, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: c,
                  opacity: 0.8,
                  animation: `dotPulse ${1.2 + i * 0.3}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
          </div>

          {/* ── DERECHA: Formulario ───────────────────────────── */}
          <div style={{
            padding: '50px 44px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <h2 style={{
              color: 'white', fontSize: '2rem', fontWeight: 900,
              margin: '0 0 6px', letterSpacing: '-0.01em',
              animation: 'slideUp 0.5s ease 0.2s both',
            }}>
              ¡Bienvenido! 👋
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 15,
              margin: '0 0 28px', fontWeight: 600,
              animation: 'slideUp 0.5s ease 0.28s both',
            }}>
              Inicia sesión para continuar.
            </p>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5', padding: '12px 16px',
                borderRadius: 12, marginBottom: 18,
                fontSize: 14, fontWeight: 700, textAlign: 'center',
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nombre */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'slideUp 0.5s ease 0.35s both' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Tu Nombre
                </label>
                <input
                  type="text" value={nombre} placeholder="Ej. Mateo"
                  onChange={(e) => setNombre(e.target.value)}
                  onFocus={() => setFocusField('nombre')}
                  onBlur={() => setFocusField(null)}
                  style={inputStyle('nombre')} required
                />
              </div>

              {/* Apellido */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'slideUp 0.5s ease 0.42s both' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Tu Apellido
                </label>
                <input
                  type="text" value={apellido} placeholder="Ej. Pérez"
                  onChange={(e) => setApellido(e.target.value)}
                  onFocus={() => setFocusField('apellido')}
                  onBlur={() => setFocusField(null)}
                  style={inputStyle('apellido')} required
                />
              </div>

              {/* PIN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'slideUp 0.5s ease 0.49s both' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Tu PIN Secreto
                </label>
                <input
                  type="password" value={pin} placeholder="••••"
                  onChange={(e) => setPin(e.target.value)}
                  onFocus={() => setFocusField('pin')}
                  onBlur={() => setFocusField(null)}
                  style={inputStyle('pin')} required
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={cargando}
                style={{
                  marginTop: 8,
                  padding: '17px',
                  borderRadius: 16,
                  border: 'none',
                  background: cargando
                    ? 'rgba(168,85,247,0.4)'
                    : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 900,
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  boxShadow: cargando ? 'none' : '0 8px 28px rgba(168,85,247,0.45)',
                  transition: 'all 0.25s cubic-bezier(.34,1.2,.64,1)',
                  fontFamily: "'Nunito', 'Segoe UI', sans-serif",
                  letterSpacing: '0.01em',
                  animation: 'slideUp 0.5s ease 0.56s both',
                }}
                onMouseEnter={(e) => {
                  if (!cargando) {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 14px 35px rgba(168,85,247,0.55)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(168,85,247,0.45)';
                }}
              >
                {cargando ? '⏳ Verificando...' : '¡A Jugar! 🚀'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatAnim {
          from { transform: translateY(0px);   }
          to   { transform: translateY(-10px); }
        }
        @keyframes dotPulse {
          from { transform: scale(1);    opacity: 0.6; }
          to   { transform: scale(1.35); opacity: 1;   }
        }
        @keyframes blobFloat0 { from { transform: translate(0,0) scale(1); } to { transform: translate(14px,-14px) scale(1.04); } }
        @keyframes blobFloat1 { from { transform: translate(0,0) scale(1); } to { transform: translate(-10px,10px) scale(1.05); } }
        @keyframes blobFloat2 { from { transform: translate(0,0) scale(1); } to { transform: translate(8px,-10px) scale(1.03); } }
        @keyframes blobFloat3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-6px,8px)  scale(1.04); } }

        input::placeholder { color: rgba(255,255,255,0.28); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #302b63 inset !important;
          -webkit-text-fill-color: white !important;
        }

        @media (max-width: 700px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }

        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid #a855f7; outline-offset: 3px; }
      `}</style>
    </>
  );
}