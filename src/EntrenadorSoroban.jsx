import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AbacoInteractivo from './AbacoInteractivo';

// ─── CONFIGURACIÓN DE NIVELES BASE ───────────────────────────────────────────
const NIVELES_BASE = [
  {
    id: 1,
    label: 'Nivel 1',
    emoji: '🌱',
    descripcion: 'Números del 1 al 9 · Solo unidades',
    columnas: ['u'],
    maxNum: 9,
    operaciones: ['suma'],
    colorClass: 'nivel-verde',
  },
  {
    id: 2,
    label: 'Nivel 2',
    emoji: '🌿',
    descripcion: 'Números hasta 99 · Unidades y decenas',
    columnas: ['d', 'u'],
    maxNum: 99,
    operaciones: ['suma', 'resta'],
    colorClass: 'nivel-celeste',
  },
  {
    id: 3,
    label: 'Nivel 3',
    emoji: '🌳',
    descripcion: 'Números hasta 999 · Centenas incluidas',
    columnas: ['c', 'd', 'u'],
    maxNum: 999,
    operaciones: ['suma', 'resta', 'mixto'],
    colorClass: 'nivel-teal',
  },
  {
    id: 4,
    label: 'Nivel 4',
    emoji: '⭐',
    descripcion: 'Hasta 9,999 · Unidades de mil',
    columnas: ['um', 'c', 'd', 'u'],
    maxNum: 9999,
    operaciones: ['suma', 'resta', 'mixto'],
    colorClass: 'nivel-azul',
  },
  {
    id: 5,
    label: 'Nivel 5',
    emoji: '🚀',
    descripcion: 'Hasta 99,999 · Decenas de mil',
    columnas: ['dm', 'um', 'c', 'd', 'u'],
    maxNum: 99999,
    operaciones: ['suma', 'resta', 'mixto'],
    colorClass: 'nivel-morado',
  },
  {
    id: 6,
    label: 'Nivel 6',
    emoji: '👑',
    descripcion: 'Hasta 999,999 · Maestro del Soroban',
    columnas: ['cm', 'dm', 'um', 'c', 'd', 'u'],
    maxNum: 999999,
    operaciones: ['suma', 'resta', 'mixto'],
    colorClass: 'nivel-dorado',
  },
];

const MAPA_COLUMNAS = { cm: 7, dm: 8, um: 9, c: 10, d: 11, u: 12 };

// ─── GENERADOR DE PASOS (UNIDADES -> DECENAS -> CENTENAS) ────────────────────
const generarPasosColumnas = (valorInicial, numeroMover, esSuma = true, esPrimerNumero = false) => {
  if (numeroMover === 0) return [];
  let numStr = Math.abs(numeroMover).toString();
  const pasos = [];
  const nombres = {12: 'Unidades', 11: 'Decenas', 10: 'Centenas', 9: 'Unidades de Mil', 8: 'Decenas de Mil', 7: 'Centenas de Mil'};

  let valorActualSimulado = valorInicial;
  let offset = 0;

  // Bucle de Derecha a Izquierda (Ej: Unidades, luego Decenas...)
  for (let i = numStr.length - 1; i >= 0; i--) {
    const digitoMover = parseInt(numStr[i]);
    const colIndex = 12 - offset; 
    offset++;

    if (digitoMover > 0) {
       const valAgregado = digitoMover * Math.pow(10, 12 - colIndex);
       const operacion = esSuma ? valAgregado : -valAgregado;
       const dActual = Math.floor(valorActualSimulado / Math.pow(10, 12 - colIndex)) % 10;
       let texto = '';
       
       if (esPrimerNumero) {
           texto = `Sube ${digitoMover} en las ${nombres[colIndex]}.`;
       } else {
           if (esSuma) {
             if (dActual + digitoMover >= 10) {
               texto = `¡Amigo del 10! Quita ${10 - digitoMover} en las ${nombres[colIndex]} y suma 1 a la izquierda.`;
             } else if ( (dActual % 5) + digitoMover >= 5 && dActual < 5) {
               texto = `¡Amigo del 5! Baja la cuenta de 5 y quita ${5 - digitoMover} abajo en las ${nombres[colIndex]}.`;
             } else {
               texto = `Suma ${digitoMover} directamente en las ${nombres[colIndex]}.`;
             }
           } else {
             if (dActual < digitoMover) {
               texto = `¡Amigo del 10! Quita 10 de la izquierda y suma ${10 - digitoMover} en las ${nombres[colIndex]}.`;
             } else if ( (dActual % 5) < digitoMover && dActual >= 5) {
               texto = `¡Amigo del 5! Quita la cuenta de 5 (súbela) y sube ${5 - digitoMover} abajo en las ${nombres[colIndex]}.`;
             } else {
               texto = `Resta ${digitoMover} directamente en las ${nombres[colIndex]}.`;
             }
           }
       }

       valorActualSimulado += operacion;
       pasos.push({ colIndex, colNombre: nombres[colIndex], texto, metaIntermedia: valorActualSimulado });
    }
  }
  return pasos;
};

// ─── GENERADOR DE EJERCICIOS CORREGIDO ───────────────────────────────────────
function generarEjercicio(nivel, racha, modoElegido) {
  const maxDigitos = Math.min(Math.floor(racha / 3) + 1, nivel.maxNum.toString().length);
  const maxVal = Math.min(Math.pow(10, maxDigitos) - 1, nivel.maxNum);
  
  // Garantizar que la operación respete el modo seleccionado
  let op = modoElegido;
  if (modoElegido === 'mixto') {
    op = Math.random() > 0.5 ? 'suma' : 'resta';
  }

  let n1, n2, res;
  if (op === 'suma') {
    n1 = Math.floor(Math.random() * (maxVal - 1)) + 1;
    n2 = Math.floor(Math.random() * (maxVal - n1)) + 1;
    res = n1 + n2;
  } else {
    n1 = Math.floor(Math.random() * maxVal) + 5;
    if (n1 > nivel.maxNum) n1 = nivel.maxNum;
    n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
    res = n1 - n2;
    if (res < 0) { n2 = 1; res = n1 - 1; }
  }

  return { n1, n2, op: op === 'suma' ? '+' : '-', res };
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function EntrenadorSoroban() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [esMenor, setEsMenor] = useState(false);
  
  const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
  const [fase, setFase] = useState('seleccion_nivel'); 
  const [modo, setModo] = useState(null);
  const [racha, setRacha] = useState(0);
  const [rachaRecord, setRachaRecord] = useState(0);
  
  const [ejercicio, setEjercicio] = useState(null);
  const [valorAbaco, setValorAbaco] = useState(0);
  
  // Nuevos estados para el desglose paso a paso
  const [pasos, setPasos] = useState([]);
  const [pasoActualIndex, setPasoActualIndex] = useState(0);

  const [mostrarOrientacion, setMostrarOrientacion] = useState(false);

  // 1. Detección de Usuario y Categoría
  useEffect(() => {
    const str = localStorage.getItem('usuarioMate');
    if (str) {
      const parsed = JSON.parse(str);
      setUsuario(parsed);
      setEsMenor(parsed.categoria?.toLowerCase().includes('menor'));
    }
  }, []);

  // 2. Detección de Orientación
  useEffect(() => {
    const checkOrientacion = () => {
      const esMobile = window.innerWidth < 900;
      const esPortrait = window.innerHeight > window.innerWidth;
      setMostrarOrientacion(esMobile && esPortrait);
    };
    checkOrientacion();
    window.addEventListener('resize', checkOrientacion);
    window.addEventListener('orientationchange', checkOrientacion);
    return () => {
      window.removeEventListener('resize', checkOrientacion);
      window.removeEventListener('orientationchange', checkOrientacion);
    };
  }, []);

  // 3. Motor de Validación Paso a Paso
  useEffect(() => {
    if (fase !== 'entrenando' || pasos.length === 0) return;
    
    const pasoActual = pasos[pasoActualIndex];
    if (!pasoActual) return; 

    // Si el estudiante formó el número exacto del paso actual:
    if (valorAbaco === pasoActual.metaIntermedia) {
       if (pasoActualIndex < pasos.length - 1) {
          setPasoActualIndex(prev => prev + 1); // Avanza al siguiente paso (ej. Decenas)
       } else {
          // Completó todo el ejercicio
          const nuevaRacha = racha + 1;
          setRacha(nuevaRacha);
          setRachaRecord(prev => Math.max(prev, nuevaRacha));
          setPasoActualIndex(pasos.length); // Marca como finalizado
       }
    }
  }, [valorAbaco, pasos, pasoActualIndex, fase, racha]);

  const iniciarEjercicio = useCallback((modoElegido, rachaActual, nivelActual) => {
    const ej = generarEjercicio(nivelActual, rachaActual, modoElegido);
    setEjercicio(ej);
    
    // Generamos los pasos: Primero coloca N1 (Unidades -> Decenas), luego N2 (Unidades -> Decenas)
    const pasosN1 = generarPasosColumnas(0, ej.n1, true, true);
    const pasosN2 = generarPasosColumnas(ej.n1, ej.n2, ej.op === '+', false);
    
    setPasos([...pasosN1, ...pasosN2]);
    setPasoActualIndex(0);
    setModo(modoElegido);
    setValorAbaco(0); // Reinicio de control visual
  }, []);

  const seleccionarNivel = (nivel, grupoNombre) => {
    setNivelSeleccionado({ ...nivel, grupo: grupoNombre });
    setFase('seleccion_modo');
    setRacha(0);
  };

  const iniciarModo = (tipoModo) => {
    setFase('entrenando');
    setRacha(0);
    iniciarEjercicio(tipoModo, 0, nivelSeleccionado);
  };

  const siguienteEjercicio = () => {
    iniciarEjercicio(modo, racha, nivelSeleccionado);
  };

  const columnasActivasNumeros = nivelSeleccionado ? nivelSeleccionado.columnas.map(c => MAPA_COLUMNAS[c]) : [];

  if (mostrarOrientacion) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0b2e2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'rotar 2s ease-in-out infinite' }}>📱</div>
        <h2 style={{ color: '#5eead4', fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'Georgia, serif' }}>¡Voltea tu teléfono!</h2>
        <p style={{ color: '#a7f3d0', fontSize: '1rem', maxWidth: '280px', lineHeight: 1.6 }}>Para una mejor experiencia con el ábaco, usa el modo horizontal.</p>
        <style>{`@keyframes rotar { 0%,100%{transform:rotate(0deg)}50%{transform:rotate(90deg)} }`}</style>
      </div>
    );
  }

  // Filtrar los niveles basados en la categoría del usuario
  const nivelesMostrar = esMenor ? NIVELES_BASE.slice(0, 3) : NIVELES_BASE;

  return (
    <div className="trainer-root">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="trainer-header">
        <button className="btn-nav" onClick={() => {
            if (fase === 'entrenando') { setFase('seleccion_modo'); }
            else if (fase === 'seleccion_modo') { setFase('seleccion_nivel'); }
            else { navigate('/menu'); } 
          }}>
          {fase === 'seleccion_nivel' ? '← Menú Principal' : '← Volver'}
        </button>
        <div className="header-center">
          <span className="header-logo">🧮</span>
          <span className="header-title">Entrenador Soroban</span>
          {nivelSeleccionado && (
            <span className="header-nivel-badge">
              {nivelSeleccionado.emoji} {nivelSeleccionado.grupo}: {nivelSeleccionado.label}
            </span>
          )}
        </div>
        {fase === 'entrenando' && (
          <div className="header-stats">
            <span className="stat-pill racha">🔥 {racha}</span>
            <span className="stat-pill record">🏆 {rachaRecord}</span>
          </div>
        )}
      </header>

      {/* ══ SELECCIÓN DE NIVEL ══════════════════════════════════════════════ */}
      {fase === 'seleccion_nivel' && (
        <div className="screen screen-niveles fade-in">
          <div className="profe-intro">
            <div className="profe-avatar">🧮</div>
            <div className="profe-bubble">
              <strong>¡Hola! Soy el Profe Cálculo.</strong><br />
              Aquí tienes los niveles de tu categoría. ¡Elige uno para entrenar!
            </div>
          </div>
          
          <div className="contenedor-agrupacion-grados">
            <div className="grupo-grados">
              <h3 className="titulo-grupo">{esMenor ? "🌱 Primaria Menor (1° a 3°)" : "🚀 Primaria Mayor (4° a 6°)"}</h3>
              <div className="grid-niveles">
                {nivelesMostrar.map(nv => (
                  <button key={`nivel-${nv.id}`} className={`tarjeta-nivel ${nv.colorClass}`} onClick={() => seleccionarNivel(nv, esMenor ? 'Primaria Menor' : 'Primaria Mayor')}>
                    <span className="nv-emoji">{nv.emoji}</span>
                    <span className="nv-label">{nv.label}</span>
                    <span className="nv-desc">{nv.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SELECCIÓN DE MODALIDAD ══════════════════════════════════════════ */}
      {fase === 'seleccion_modo' && nivelSeleccionado && (
        <div className="screen screen-modo fade-in">
          <div className="profe-intro">
            <div className="profe-avatar">🧮</div>
            <div className="profe-bubble">
              Perfecto para <strong>{nivelSeleccionado.grupo}, {nivelSeleccionado.label}</strong>. ¿Qué quieres practicar hoy?
              Trabajaremos con números hasta <strong>{nivelSeleccionado.maxNum.toLocaleString('en-US')}</strong>.
            </div>
          </div>
          <div className="grid-modos">
            {nivelSeleccionado.operaciones.map(op => {
              const info = {
                suma:  { emoji: '➕', titulo: 'Sumas',        desc: 'Practica sumar paso a paso con el ábaco.' },
                resta: { emoji: '➖', titulo: 'Restas',       desc: 'Domina las restas y los amigos del 10.' },
                mixto: { emoji: '🔀', titulo: 'Reto Mixto',  desc: 'Sumas y restas al azar. ¡El desafío total!' },
              }[op];
              return (
                <button key={op} className={`tarjeta-modo modo-${op}`} onClick={() => iniciarModo(op)}>
                  <span className="modo-emoji">{info.emoji}</span>
                  <span className="modo-titulo">{info.titulo}</span>
                  <span className="modo-desc">{info.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ENTRENAMIENTO (ÁBACO IZQUIERDA, INSTRUCCIONES DERECHA) ═════════ */}
      {fase === 'entrenando' && ejercicio && (
        <div className="screen-entrenando fade-in" style={{ display: 'flex', flexDirection: 'row', gap: '20px', height: '100%', padding: '20px', overflow: 'hidden' }}>

          {/* PANEL IZQUIERDO: Ábaco y Valor */}
          <div className="panel-izquierdo" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '20px', justifyContent: 'center', position: 'relative' }}>
            
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#38bdf8', color: '#0f172a', padding: '8px 25px', borderRadius: '30px', fontSize: '2rem', fontWeight: '900', boxShadow: '0 0 15px rgba(56,189,248,0.4)', zIndex: 10 }}>
               {valorAbaco.toLocaleString('en-US')}
            </div>

            <div className="abaco-wrapper" style={{ transform: 'scale(0.85)', transformOrigin: 'center', marginTop: '30px' }}>
              <AbacoInteractivo 
                key={`abaco-${ejercicio.n1}-${racha}`}
                onValueChange={setValorAbaco} 
                columnasActivas={columnasActivasNumeros}
                valorObjetivo={pasos[pasoActualIndex]?.metaIntermedia}
                columnaResaltada={pasos[pasoActualIndex]?.colIndex}
              />
            </div>
          </div>

          {/* PANEL DERECHO: Instrucciones y Operación */}
          <div className="panel-derecho" style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
            
            {/* Pantalla operación visual */}
            <div className="pantalla-operacion">
              <div className="op-numeros">
                <span className="op-n1">{ejercicio.n1.toLocaleString('en-US')}</span>
                <span className="op-signo">{ejercicio.op}</span>
                <span className="op-n2">{ejercicio.n2.toLocaleString('en-US')}</span>
                <span className="op-igual">=</span>
                <span className="op-res">{pasoActualIndex >= pasos.length ? ejercicio.res.toLocaleString('en-US') : '?'}</span>
              </div>
            </div>

            {/* Asistente (Scrollable) */}
            <div className="asistente-card" style={{ flex: 1, overflowY: 'auto', background: 'rgba(251, 191, 36, 0.1)', border: '2px solid #fbbf24', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '2.5rem' }}>🧮</div>
                  <h3 style={{ color: '#fbbf24', margin: 0, fontSize: '1.4rem' }}>Pasos a seguir:</h3>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
                  {pasos.map((paso, i) => {
                     const isCurrent = i === pasoActualIndex;
                     const isPast = i < pasoActualIndex;
                     
                     if (!isCurrent && !isPast) return null; // Solo mostramos los pasos hechos y el actual

                     return (
                        <div key={i} style={{ 
                          padding: '12px', borderRadius: '10px', transition: 'all 0.3s',
                          background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                          borderLeft: isCurrent ? '4px solid #38bdf8' : '4px solid transparent',
                          opacity: isPast ? 0.5 : 1
                        }}>
                           <strong style={{ color: isCurrent ? '#38bdf8' : '#94a3b8', fontSize: '1.1rem', display: 'block', marginBottom: '5px' }}>
                             {paso.colNombre} {isPast && '✅'}
                           </strong>
                           <span style={{ color: 'white', fontSize: '1.2rem', lineHeight: '1.4' }}>
                             {paso.texto} {isCurrent && ' 👈'}
                           </span>
                        </div>
                     )
                  })}

                  {/* Mensaje de victoria */}
                  {pasoActualIndex >= pasos.length && (
                    <div style={{ textAlign: 'center', marginTop: 'auto', padding: '20px' }}>
                       <p style={{ fontSize: '1.8rem', margin: '0 0 15px', color: '#34d399', fontWeight: 'bold' }}>¡Excelente! 🎉</p>
                       <button className="btn-siguiente" onClick={siguienteEjercicio} style={{ fontSize: '1.2rem', padding: '12px 25px', width: '100%' }}>
                         Siguiente Reto →
                       </button>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      )}

      {/* ══ ESTILOS ════════════════════════════════════════════════════════════ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .trainer-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0b2e2e 0%, #0f3d35 40%, #0a2a35 100%);
          color: #e0faf4;
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .fade-in { animation: fadeSlide 0.4s ease-out both; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .trainer-header {
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(94,234,212,0.2);
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }
        .btn-nav {
          background: transparent;
          border: 1px solid rgba(94,234,212,0.4);
          color: #5eead4;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.2s;
          white-space: nowrap;
          min-width: 80px;
        }
        .btn-nav:hover { background: rgba(94,234,212,0.1); }
        .header-center {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .header-logo { font-size: 1.5rem; }
        .header-title { font-size: 1.1rem; font-weight: 700; color: #a7f3d0; letter-spacing: 0.5px; }
        .header-nivel-badge {
          background: rgba(94,234,212,0.15);
          border: 1px solid rgba(94,234,212,0.3);
          color: #5eead4;
          padding: 0.2rem 0.7rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .header-stats { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .stat-pill { padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
        .stat-pill.racha { background: rgba(251,146,60,0.2); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
        .stat-pill.record { background: rgba(250,204,21,0.15); color: #fbbf24; border: 1px solid rgba(250,204,21,0.3); }

        /* ── Screens ── */
        .screen {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          overflow-y: auto;
        }

        /* ── Profe intro ── */
        .profe-intro {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          max-width: 640px;
          width: 100%;
        }
        .profe-avatar {
          font-size: 2.5rem;
          background: rgba(94,234,212,0.1);
          border: 2px solid rgba(94,234,212,0.3);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .profe-bubble {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(94,234,212,0.2);
          border-radius: 0 16px 16px 16px;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          line-height: 1.6;
          color: #ccfbf1;
        }

        /* ── Agrupación de Niveles ── */
        .contenedor-agrupacion-grados {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          width: 100%;
          max-width: 900px;
          margin-top: 10px;
        }
        .grupo-grados {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .titulo-grupo {
          color: #5eead4;
          font-size: 1.2rem;
          margin-bottom: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ── Grid Niveles ── */
        .grid-niveles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          width: 100%;
        }
        .tarjeta-nivel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 1.5rem 1rem;
          border-radius: 16px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.25s;
          text-align: center;
          background: rgba(255,255,255,0.05);
        }
        .tarjeta-nivel:hover { transform: translateY(-4px); }
        .nv-emoji { font-size: 2.2rem; }
        .nv-label { font-size: 1rem; font-weight: 700; color: #e0faf4; }
        .nv-desc  { font-size: 0.78rem; color: #a7f3d0; line-height: 1.4; }

        .nivel-verde  { border-color: #34d399; background: rgba(52,211,153,0.08); }
        .nivel-verde:hover  { background: rgba(52,211,153,0.18); box-shadow: 0 8px 24px rgba(52,211,153,0.2); }
        .nivel-celeste{ border-color: #38bdf8; background: rgba(56,189,248,0.08); }
        .nivel-celeste:hover{ background: rgba(56,189,248,0.18); box-shadow: 0 8px 24px rgba(56,189,248,0.2); }
        .nivel-teal   { border-color: #2dd4bf; background: rgba(45,212,191,0.08); }
        .nivel-teal:hover   { background: rgba(45,212,191,0.18); box-shadow: 0 8px 24px rgba(45,212,191,0.2); }
        .nivel-azul   { border-color: #818cf8; background: rgba(129,140,248,0.08); }
        .nivel-azul:hover   { background: rgba(129,140,248,0.18); box-shadow: 0 8px 24px rgba(129,140,248,0.2); }
        .nivel-morado { border-color: #a78bfa; background: rgba(167,139,250,0.08); }
        .nivel-morado:hover { background: rgba(167,139,250,0.18); box-shadow: 0 8px 24px rgba(167,139,250,0.2); }
        .nivel-dorado { border-color: #fbbf24; background: rgba(251,191,36,0.08); }
        .nivel-dorado:hover { background: rgba(251,191,36,0.18); box-shadow: 0 8px 24px rgba(251,191,36,0.25); }

        /* ── Grid Modos ── */
        .screen-modo { justify-content: center; }
        .grid-modos {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 700px;
        }
        .tarjeta-modo {
          flex: 1;
          min-width: 160px;
          max-width: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.75rem 1.25rem;
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.25s;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.05);
        }
        .tarjeta-modo:hover { transform: translateY(-6px); }
        .modo-emoji  { font-size: 2.5rem; }
        .modo-titulo { font-size: 1.05rem; font-weight: 700; color: #e0faf4; }
        .modo-desc   { font-size: 0.8rem; color: #a7f3d0; text-align: center; line-height: 1.4; }
        .modo-suma  { border-color: #34d399; }
        .modo-suma:hover  { background: rgba(52,211,153,0.15); box-shadow: 0 8px 28px rgba(52,211,153,0.2); }
        .modo-resta { border-color: #f87171; }
        .modo-resta:hover { background: rgba(248,113,113,0.15); box-shadow: 0 8px 28px rgba(248,113,113,0.2); }
        .modo-mixto { border-color: #a78bfa; }
        .modo-mixto:hover { background: rgba(167,139,250,0.15); box-shadow: 0 8px 28px rgba(167,139,250,0.2); }

        /* ── Pantalla Entrenamiento ── */
        .pantalla-operacion {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(94,234,212,0.2);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          text-align: center;
        }
        .op-numeros {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .op-n1, .op-n2 { font-size: 2.8rem; font-weight: 800; color: #f0fdf4; }
        .op-signo       { font-size: 2.4rem; font-weight: 700; color: #5eead4; }
        .op-igual       { font-size: 2.4rem; font-weight: 700; color: #94a3b8; }
        .op-res         { font-size: 2.8rem; font-weight: 800; color: #fbbf24; }

        .btn-siguiente {
          background: linear-gradient(135deg, #059669, #0d9488);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 14px rgba(5,150,105,0.4);
        }
        .btn-siguiente:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(5,150,105,0.5); }

        /* Ocultar barra de scroll interna en el panel de ayuda */
        .asistente-card::-webkit-scrollbar { width: 6px; }
        .asistente-card::-webkit-scrollbar-track { background: transparent; }
        .asistente-card::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.3); border-radius: 10px; }

        /* Responsive */
        @media (max-width: 900px) {
          .screen-entrenando { flex-direction: column !important; overflow-y: auto !important; }
          .panel-izquierdo, .panel-derecho { flex: none !important; width: 100% !important; }
          .abaco-wrapper { transform: scale(0.65) !important; margin-top: 10px !important; height: 250px; }
        }
      `}</style>
    </div>
  );
}