import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
 
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5005'
  : `http://${window.location.hostname}:5005`;
 
// ── Tutorial steps ─────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    target: 'perfil',
    title: '¡Hola! Este es tu perfil 👋',
    desc: 'Aquí ves tu nombre, grado y cuántos puntos llevas acumulados. ¡Mientras más practiques, más puntos ganas!',
    pos: 'right',
  },
  {
    target: 'btn-aprendizaje',
    title: '📖 Aprende a usar el ábaco',
    desc: 'Empieza aquí si eres nuevo o quieres repasar cómo funciona el Soroban paso a paso.',
    pos: 'left',
  },
  {
    target: 'btn-entrenador',
    title: '🧠 Entrenador Avanzado',
    desc: 'Practica con operaciones más difíciles. ¡Ideal para subir de nivel!',
    pos: 'left',
  },
  {
    target: 'btn-flash',
    title: '⚡ Ejercicios Flash',
    desc: 'Responde en segundos. Entrena tu velocidad mental con problemas rápidos.',
    pos: 'left',
  },
  {
    target: 'btn-dashboard',
    title: '🏆 Ver el tablero',
    desc: 'Mira quiénes son los mejores. ¿Podrás llegar al Top 3?',
    pos: 'left',
  },
];
 
// ── Avatar selector data ────────────────────────────────────────
const AVATARS = ['🦁', '🐼', '🦊', '🦋', '🐬', '🦄', '🐸', '🦖', '🌟', '🚀'];
 
export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
 
  // Tutorial state
  const [tutorialActivo, setTutorialActivo] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPos, setTutorialPos] = useState({ top: 0, left: 0 });
  const refs = {
    perfil: useRef(null),
    'btn-aprendizaje': useRef(null),
    'btn-entrenador': useRef(null),
    'btn-flash': useRef(null),
    'btn-dashboard': useRef(null),
  };
 
  // ── Onboarding check ───────────────────────────────────────────
  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioMate');
    if (usuarioString) {
      const datos = JSON.parse(usuarioString);
      setUsuario(datos);
      obtenerPuntosTotales(datos.usuarioId);
      const savedAvatar = localStorage.getItem(`avatar_${datos.usuarioId}`);
      if (savedAvatar) setAvatarIndex(parseInt(savedAvatar));
    } else {
      navigate('/');
    }
    setTimeout(() => setMounted(true), 50);
  }, [navigate]);
 
  useEffect(() => {
    if (usuario) {
      const visto = localStorage.getItem(`tutorial_visto_${usuario.usuarioId}`);
      if (!visto) {
        setTimeout(() => setTutorialActivo(true), 900);
      }
    }
  }, [usuario]);
 
  // Reposition tooltip on step change
  useEffect(() => {
    if (!tutorialActivo) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    const el = refs[step.target]?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 20;
    if (step.pos === 'right') {
      setTutorialPos({ top: rect.top + rect.height / 2, left: rect.right + gap });
    } else {
      setTutorialPos({ top: rect.top + rect.height / 2, left: rect.left - gap });
    }
  }, [tutorialStep, tutorialActivo]);
 
  const obtenerPuntosTotales = async (idParam) => {
    try {
      const idReal = idParam || undefined;
      if (!idReal) return;
      const resp = await fetch(`${API_BASE_URL}/api/Puntuaciones/usuario/${idReal}/total`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        setTotalPuntos(data.totalPuntos || 0);
      }
    } catch (err) {
      console.error('Error al obtener puntos:', err);
    }
  };
 
  const siguientePaso = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep((s) => s + 1);
    } else {
      cerrarTutorial();
    }
  };
 
  const cerrarTutorial = () => {
    setTutorialActivo(false);
    if (usuario) localStorage.setItem(`tutorial_visto_${usuario.usuarioId}`, '1');
  };
 
  const cambiarAvatar = () => {
    const next = (avatarIndex + 1) % AVATARS.length;
    setAvatarIndex(next);
    if (usuario) localStorage.setItem(`avatar_${usuario.usuarioId}`, String(next));
  };
 
  const cerrarSesion = () => {
    localStorage.removeItem('usuarioMate');
    navigate('/');
  };
 
  if (!usuario) return null;
 
  const currentStep = TUTORIAL_STEPS[tutorialStep];
  const highlightedTarget = tutorialActivo ? currentStep.target : null;
 
  // ── Button config ─────────────────────────────────────────────
  const botones = [
    {
      id: 'btn-aprendizaje',
      label: 'Aprender a usar las Cuentas',
      emoji: '📖',
      ruta: '/aprendizaje',
      color: '#FF6B35',
      shadow: 'rgba(255,107,53,0.35)',
      badge: 'Básico',
    },
    {
      id: 'btn-entrenador',
      label: 'Entrenador Soroban Avanzado',
      emoji: '🧠',
      ruta: '/entrenador',
      color: '#FFBE00',
      shadow: 'rgba(255,190,0,0.35)',
      badge: 'Avanzado',
    },
    {
      id: 'btn-flash',
      label: 'Ejercicios Flash',
      emoji: '⚡',
      ruta: '/ejercicios',
      color: '#00C9A7',
      shadow: 'rgba(0,201,167,0.35)',
      badge: '¡Rápido!',
    },
    {
      id: 'btn-dashboard',
      label: 'Ver Dashboard (Top 3)',
      emoji: '🏆',
      ruta: '/dashboard',
      color: '#4C6EF5',
      shadow: 'rgba(76,110,245,0.35)',
      badge: 'Ranking',
    },
  ];
 
  return (
    <>
      {/* ── Overlay tutorial ───────────────────────────────────── */}
      {tutorialActivo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,10,30,0.55)',
            backdropFilter: 'blur(3px)',
            transition: 'opacity 0.4s',
          }}
          onClick={cerrarTutorial}
        />
      )}
 
      {tutorialActivo && (
        <div
          style={{
            position: 'fixed',
            top: tutorialPos.top,
            left: currentStep.pos === 'left'
              ? tutorialPos.left - 300
              : tutorialPos.left,
            transform: 'translateY(-50%)',
            zIndex: 1100,
            width: 280,
            background: 'white',
            borderRadius: 20,
            padding: '20px 22px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            animation: 'tooltipIn 0.35s cubic-bezier(.34,1.56,.64,1) both',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow indicator */}
          <div style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            ...(currentStep.pos === 'right'
              ? { left: -10 }
              : { right: -10, rotate: '180deg' }),
            width: 0, height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: '12px solid white',
          }} />
 
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#a855f7', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Paso {tutorialStep + 1} de {TUTORIAL_STEPS.length}
          </p>
          <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 900, color: '#1e293b', lineHeight: 1.3 }}>
            {currentStep.title}
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
            {currentStep.desc}
          </p>
 
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === tutorialStep ? 18 : 8,
                height: 8, borderRadius: 999,
                background: i === tutorialStep ? '#a855f7' : '#e2e8f0',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
 
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={cerrarTutorial} style={{
              flex: 1, padding: '10px', borderRadius: 12, border: '2px solid #e2e8f0',
              background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}>
              Saltar
            </button>
            <button onClick={siguientePaso} style={{
              flex: 2, padding: '10px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
              color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(168,85,247,0.4)',
            }}>
              {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Siguiente →' : '¡Listo! 🎉'}
            </button>
          </div>
        </div>
      )}
 
      {/* ── Main container ─────────────────────────────────────── */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative', overflow: 'hidden',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}>
 
        {/* Floating background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { color: '#a855f7', x: '10%', y: '20%', size: 400 },
            { color: '#4C6EF5', x: '75%', y: '60%', size: 350 },
            { color: '#00C9A7', x: '60%', y: '10%', size: 250 },
            { color: '#FF6B35', x: '20%', y: '70%', size: 200 },
          ].map((b, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: b.x, top: b.y,
              width: b.size, height: b.size,
              borderRadius: '50%',
              background: b.color,
              opacity: 0.12,
              filter: 'blur(80px)',
              animation: `blobFloat ${4 + i}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
 
        {/* ── Card ──────────────────────────────────────────────── */}
        <div style={{
          width: '100%', maxWidth: 880,
          display: 'grid', gridTemplateColumns: '1fr 1.35fr',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(30px)',
          borderRadius: 32, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(.34,1.2,.64,1)',
          position: 'relative', zIndex: 10,
        }}>
 
          {/* ── LEFT: Profile ─────────────────────────────────── */}
          <div
            ref={refs['perfil']}
            style={{
              padding: '50px 30px',
              background: 'linear-gradient(160deg, rgba(168,85,247,0.25) 0%, rgba(76,110,245,0.15) 100%)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: 16, position: 'relative',
              outline: highlightedTarget === 'perfil' ? '2px solid #a855f7' : 'none',
              outlineOffset: 4, borderRadius: '0 0 0 32px',
              zIndex: highlightedTarget === 'perfil' ? 1050 : 'auto',
              background: highlightedTarget === 'perfil'
                ? 'linear-gradient(160deg, rgba(168,85,247,0.5) 0%, rgba(76,110,245,0.35) 100%)'
                : 'linear-gradient(160deg, rgba(168,85,247,0.25) 0%, rgba(76,110,245,0.15) 100%)',
              transition: 'background 0.4s',
            }}
          >
            {/* Avatar */}
            <button
              onClick={cambiarAvatar}
              title="Toca para cambiar avatar"
              style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.25)',
                fontSize: '3.6rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                animation: 'avatarBounce 0.6s cubic-bezier(.34,1.56,.64,1) 0.4s both',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
            >
              {AVATARS[avatarIndex]}
            </button>
            <p style={{ position: 'absolute', top: 155, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              toca para cambiar
            </p>
 
            {/* Name */}
            <div style={{ marginTop: 18 }}>
              <h1 style={{
                color: 'white', fontSize: '1.75rem', fontWeight: 900,
                margin: '0 0 8px',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.5s ease 0.5s both',
              }}>
                {usuario.nombre} {usuario.apellido}
              </h1>
 
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.9)',
                padding: '5px 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 700,
                animation: 'slideUp 0.5s ease 0.6s both',
              }}>
                {usuario.categoria} — Grado {usuario.grado}
              </div>
            </div>
 
            {/* Points */}
            <div style={{
              background: 'white',
              borderRadius: 20, padding: '14px 28px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              animation: 'slideUp 0.5s ease 0.7s both',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#a855f7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Puntos Totales
              </p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                🏆 {totalPuntos.toLocaleString()}
              </p>
            </div>
 
            {/* Tutorial restart */}
            <button onClick={() => { setTutorialStep(0); setTutorialActivo(true); }} style={{
              marginTop: 8, background: 'none', border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '6px 16px',
              fontSize: 12, cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              Ver tutorial
            </button>
          </div>
 
          {/* ── RIGHT: Buttons ─────────────────────────────────── */}
          <div style={{
            padding: '45px 40px',
            display: 'flex', flexDirection: 'column',
          }}>
            <h2 style={{
              color: 'white', fontSize: '1.6rem', fontWeight: 900,
              margin: '0 0 28px', letterSpacing: '-0.01em',
              animation: 'slideUp 0.5s ease 0.3s both',
            }}>
              ¿Qué haremos hoy? ✨
            </h2>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {botones.map((btn, i) => (
                <button
                  key={btn.id}
                  ref={refs[btn.id]}
                  onClick={() => navigate(btn.ruta)}
                  onMouseEnter={() => setHoveredBtn(btn.id)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    width: '100%', border: 'none', borderRadius: 20, padding: '0 24px',
                    height: 72, cursor: 'pointer',
                    background: hoveredBtn === btn.id
                      ? btn.color
                      : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.3s cubic-bezier(.34,1.2,.64,1)',
                    transform: hoveredBtn === btn.id
                      ? 'translateX(8px) scale(1.02)'
                      : highlightedTarget === btn.id
                        ? 'scale(1.04)'
                        : 'translateX(0) scale(1)',
                    boxShadow: hoveredBtn === btn.id
                      ? `0 12px 35px ${btn.shadow}`
                      : highlightedTarget === btn.id
                        ? `0 0 0 3px ${btn.color}, 0 12px 35px ${btn.shadow}`
                        : '0 2px 12px rgba(0,0,0,0.15)',
                    border: highlightedTarget === btn.id
                      ? `2px solid ${btn.color}`
                      : '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                    position: 'relative',
                    zIndex: highlightedTarget === btn.id ? 1050 : 'auto',
                    animation: `slideUp 0.5s ease ${0.4 + i * 0.08}s both`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Shine effect on hover */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 20,
                    background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
                    opacity: hoveredBtn === btn.id ? 1 : 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                  }} />
 
                  {/* Emoji */}
                  <span style={{
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1)',
                    transform: hoveredBtn === btn.id ? 'scale(1.25) rotate(-5deg)' : 'scale(1)',
                    flexShrink: 0,
                  }}>
                    {btn.emoji}
                  </span>
 
                  {/* Label */}
                  <span style={{
                    color: 'white', fontWeight: 800, fontSize: '1rem',
                    textAlign: 'left', lineHeight: 1.25, flex: 1,
                  }}>
                    {btn.label}
                  </span>
 
                  {/* Badge */}
                  <span style={{
                    background: hoveredBtn === btn.id ? 'rgba(255,255,255,0.25)' : `${btn.color}44`,
                    color: hoveredBtn === btn.id ? 'white' : btn.color,
                    padding: '3px 10px', borderRadius: 999,
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {btn.badge}
                  </span>
 
                  {/* Arrow */}
                  <span style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '1.1rem',
                    transform: hoveredBtn === btn.id ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.3s',
                    flexShrink: 0,
                  }}>→</span>
                </button>
              ))}
            </div>
 
            {/* Cerrar sesión */}
            <button
              onClick={cerrarSesion}
              style={{
                marginTop: 24, alignSelf: 'flex-end',
                background: 'none', border: 'none', padding: '8px 0',
                color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'color 0.2s',
                textDecoration: 'underline', textUnderlineOffset: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
 
      {/* ── Global styles & keyframes ─────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
 
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes avatarBounce {
          from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(-50%) scale(0.85); }
          to   { opacity: 1; transform: translateY(-50%) scale(1); }
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