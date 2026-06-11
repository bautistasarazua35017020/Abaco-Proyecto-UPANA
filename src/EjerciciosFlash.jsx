import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AbacoInteractivo from './AbacoInteractivo';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5005'
  : `http://${window.location.hostname}:5005`;

// ─── NIVELES ──────────────────────────────────────────────────────────────────
const CONFIG_NIVELES_MENOR = {
  1: { min:1,   max:9,   nombre:"Nivel 1: Unidades", digitos:1 },
  2: { min:10,  max:99,  nombre:"Nivel 2: Decenas",  digitos:2 },
  3: { min:100, max:999, nombre:"Nivel 3: Centenas", digitos:3 },
};
const CONFIG_NIVELES_MAYOR = {
  1: { min:1,      max:9,      nombre:"Nivel 1: Unidades",        digitos:1 },
  2: { min:10,     max:99,     nombre:"Nivel 2: Decenas",         digitos:2 },
  3: { min:100,    max:999,    nombre:"Nivel 3: Centenas",        digitos:3 },
  4: { min:1000,   max:9999,   nombre:"Nivel 4: Miles",           digitos:4 },
  5: { min:10000,  max:99999,  nombre:"Nivel 5: Decenas de Mil",  digitos:5 },
  6: { min:100000, max:999999, nombre:"Nivel 6: Centenas de Mil", digitos:6 },
};

const TECHO_MODO    = { lento:50, normal:100, rapido:125 };
const BONUS_RAPIDO  = 25; 
const BONUS_NORMAL  = 10; 

const hablarTexto = (texto) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); 
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-MX'; 
  utterance.rate = 0.9;     
  utterance.pitch = 1.1;    
  window.speechSynthesis.speak(utterance);
};

const decirNumero = (numero) => {
  let texto = numero.toString();
  if (numero > 0) texto = `más ${numero}`;
  if (numero < 0) texto = `menos ${Math.abs(numero)}`;
  hablarTexto(texto);
};

const generarPasosColumnas = (valorInicial, numeroMover) => {
  if (numeroMover === 0) return [{ colIndex: null, colNombre: 'Ninguna', texto: 'No muevas nada.', metaIntermedia: valorInicial }];
  const esSuma = numeroMover > 0;
  let numStr = Math.abs(numeroMover).toString();
  const pasos = [];
  const nombres = {12: 'Unidades', 11: 'Decenas', 10: 'Centenas', 9: 'Unidades de Mil', 8: 'Decenas de Mil', 7: 'Centenas de Mil'};

  let valorActualSimulado = valorInicial;

  for (let i = 0; i < numStr.length; i++) {
    const digitoMover = parseInt(numStr[i]);
    const colIndex = 13 - (numStr.length - i); 

    if (digitoMover > 0) {
       const valAgregado = digitoMover * Math.pow(10, 12 - colIndex);
       const operacion = esSuma ? valAgregado : -valAgregado;
       const dActual = Math.floor(valorActualSimulado / Math.pow(10, 12 - colIndex)) % 10;
       let texto = '';
       
       if (esSuma) {
         if (dActual + digitoMover >= 10) {
           const quitar = 10 - digitoMover;
           texto = `¡Amigo del 10! Quita ${quitar} en las ${nombres[colIndex]} y presta 10 a la columna izquierda.`;
         } else if ( (dActual % 5) + digitoMover >= 5 && dActual < 5) {
           const quitar = 5 - digitoMover;
           texto = `¡Amigo del 5! Baja la cuenta de 5 y quita ${quitar} abajo en las ${nombres[colIndex]}.`;
         } else {
           texto = `Suma ${digitoMover} directamente en las ${nombres[colIndex]}.`;
         }
       } else {
         if (dActual < digitoMover) {
           const agregar = 10 - digitoMover;
           texto = `¡Amigo del 10! Quita 10 de la izquierda y suma ${agregar} en las ${nombres[colIndex]}.`;
         } else if ( (dActual % 5) < digitoMover && dActual >= 5) {
           const agregar = 5 - digitoMover;
           texto = `¡Amigo del 5! Quita la cuenta de 5 (súbela) y sube ${agregar} abajo en las ${nombres[colIndex]}.`;
         } else {
           texto = `Resta ${digitoMover} directamente en las ${nombres[colIndex]}.`;
         }
       }
       valorActualSimulado += operacion;
       pasos.push({ colIndex, colNombre: nombres[colIndex], texto, metaIntermedia: valorActualSimulado });
    }
  }
  return pasos;
};

const AnimacionFichitas = ({ cantidad, visible }) => {
  if (!visible || cantidad <= 0) return null;
  const fiches = Array.from({ length: Math.min(cantidad, 10) }); 
  return (
    <>
      <style>{`
        @keyframes volarAlScoreFicha {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(calc(50vw - 80px), calc(-50vh + 40px)) scale(0.3); opacity: 0; }
        }
        .fichita-soroban { position: fixed; top: 50%; left: 50%; width: 25px; height: 25px; background: #fbbf24; border-radius: 50%; border: 2px solid #f59e0b; box-shadow: 0 0 10px rgba(251,191,36,0.8); pointer-events: none; z-index: 9999; }
      `}</style>
      {fiches.map((_, i) => (
        <div key={i} className="fichita-soroban" style={{ animation: `volarAlScoreFicha 0.8s ease-in ${i * 0.1}s forwards`, marginLeft: `${(Math.random() - 0.5) * 60}px`, marginTop: `${(Math.random() - 0.5) * 60}px` }} />
      ))}
    </>
  );
};

const obtenerCantidadNumeros = (ejercicio) => Math.max(5, 12 - Math.floor((ejercicio - 1) * 7 / 29));

const obtenerTiempoMs = (digitos, velocidad, esMenor) => {
  const tabla = {
    lento:  { menor: 4000, mayor: 3200 },
    normal: { menor: 2800, mayor: 2200 },
    rapido: { menor: 1800, mayor: 1300 },
  };
  const base = tabla[velocidad][esMenor ? 'menor' : 'mayor'];
  const extraDigito = esMenor ? 350 : 250;
  return Math.max(base + (digitos - 1) * extraDigito, 600);
};

const generarSecuenciaInteligente = (min, max, cantidad, ejercicio, tipo) => {
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const proporcion = Math.min(1, (ejercicio - 1) / 22);
  const maxEfectivo = Math.floor(min + (max - min) * (0.35 + proporcion * 0.65));

  if (tipo === 'resta') {
    const maxResta = Math.max(min, maxEfectivo);
    const restas = Array.from({ length: cantidad - 1 }, () => rand(min, maxResta));
    const totalRestas = restas.reduce((acc, n) => acc + n, 0);
    const total = rand(0, maxResta);
    const inicial = totalRestas + total;
    const variacion = Math.max(3, Math.floor(maxResta * 0.08) + 2);
    let opSet = new Set([total]);
    let tries = 0;
    while (opSet.size < 4 && tries < 400) {
      const dif = rand(1, variacion);
      const c = Math.random() > 0.5 ? total + dif : Math.max(0, total - dif);
      if (c !== total) opSet.add(c);
      tries++;
    }
    while (opSet.size < 4) opSet.add(total + opSet.size * (variacion + 2));
    return { secuenciaNumeros: [inicial, ...restas.map(n => -n)], opciones: Array.from(opSet).sort(() => Math.random() - 0.5), correcta: total };
  }

  const pResta = tipo === 'suma' ? 0 : ejercicio <= 5 ? 0.12 : ejercicio <= 15 ? 0.25 : ejercicio <= 25 ? 0.35 : 0.42;
  let secuencia = [];
  let acumulado = rand(Math.floor((min + maxEfectivo) / 3), Math.floor((min + maxEfectivo) * 0.6));
  secuencia.push(acumulado);

  for (let i = 1; i < cantidad; i++) {
    const num = rand(min, maxEfectivo);
    const intentaResta = Math.random() < pResta;
    if (intentaResta && (acumulado - num) >= min) {
      secuencia.push(-num);
      acumulado -= num;
    } else {
      secuencia.push(num);
      acumulado += num;
    }
  }

  const total = acumulado;
  const variacion = Math.max(3, Math.floor((maxEfectivo - min) * 0.06) + 2);
  let opSet = new Set([total]);
  let tries = 0;
  while (opSet.size < 4 && tries < 400) {
    const dif = rand(1, variacion);
    const c = Math.random() > 0.5 ? total + dif : Math.max(min, total - dif);
    if (c !== total && c >= 0) opSet.add(c);
    tries++;
  }
  while (opSet.size < 4) opSet.add(total + opSet.size * (variacion + 2));
  return { secuenciaNumeros: secuencia, opciones: Array.from(opSet).sort(() => Math.random() - 0.5), correcta: total };
};

const ConfetiCOD = ({ visible }) => {
  if (!visible) return null;
  const cols = ['#fbbf24','#10b981','#38bdf8','#a78bfa','#f472b6','#34d399','#60a5fa','#fb923c','#f87171'];
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:500, overflow:'hidden' }}>
      {Array.from({ length:80 }, (_,i) => (
        <div key={i} style={{
          position:'absolute', left:`${(i*1.27)%100}%`, top:'-20px',
          width: i%4===0?'10px':i%3===0?'14px':'8px',
          height: i%4===0?'10px':i%3===0?'6px':'18px',
          borderRadius: i%2===0?'50%':'2px',
          backgroundColor: cols[i%cols.length], opacity:0,
          animation:`confetiFall ${1.8+(i%10)*0.18}s ${(i%8)*0.07}s cubic-bezier(.25,.46,.45,.94) forwards`,
        }}/>
      ))}
    </div>
  );
};

const PuntajeFlotante = ({ desglose, visible }) => {
  const [fase, setFase] = useState(0);
  useEffect(() => {
    if (!visible || !desglose) { setFase(0); return; }
    setFase(0);
    const t1 = setTimeout(() => setFase(1), 80);
    const t2 = setTimeout(() => setFase(2), 600);
    const t3 = setTimeout(() => setFase(3), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible, desglose]);

  if (!visible || !desglose) return null;

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'flex-start', paddingLeft:60, pointerEvents:'none', zIndex:400 }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.14) 0%, transparent 65%)', animation:'flashBg 0.6s ease both' }}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:6, position:'relative' }}>
        {fase>=1 && (
          <div style={{ animation:'slideRight .35s cubic-bezier(.34,1.56,.64,1) both', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:4, height:34, background:'#38bdf8', borderRadius:2, boxShadow:'0 0 12px #38bdf8' }}/>
            <div style={{ textAlign:'left' }}>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>{desglose.labelVelocidad}</p>
              <p style={{ margin:0, fontSize:30, fontWeight:900, color:'#38bdf8', lineHeight:1, textShadow:'0 0 20px rgba(56,189,248,.6)' }}>+{desglose.base} pts</p>
            </div>
          </div>
        )}
        {fase>=2 && desglose.bonus>0 && (
          <div style={{ animation:'slideRight .35s cubic-bezier(.34,1.56,.64,1) both', display:'flex', alignItems:'center', gap:14, marginLeft:18 }}>
            <div style={{ width:3, height:26, background:'#fbbf24', borderRadius:2, boxShadow:'0 0 10px #fbbf24' }}/>
            <div style={{ textAlign:'left' }}>
              <p style={{ margin:0, fontSize:11, color:'#fbbf24', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>{desglose.razonBonus}</p>
              <p style={{ margin:0, fontSize:22, fontWeight:900, color:'#fbbf24', lineHeight:1, textShadow:'0 0 14px rgba(251,191,36,.6)' }}>+{desglose.bonus} pts</p>
            </div>
          </div>
        )}
        {fase>=3 && (
          <div style={{ animation:'popTotal .5s cubic-bezier(.34,1.56,.64,1) both', marginTop:6, display:'flex', alignItems:'center', gap:14, background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.35)', borderRadius:16, padding:'10px 20px 10px 12px' }}>
            <div style={{ width:5, height:42, background:'#10b981', borderRadius:2, boxShadow:'0 0 16px #10b981' }}/>
            <div style={{ textAlign:'left' }}>
              <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,.45)', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>Total agregado</p>
              <p style={{ margin:0, fontSize:38, fontWeight:900, color:'#10b981', lineHeight:1, textShadow:'0 0 28px rgba(16,185,129,.7)' }}>+{desglose.totalAgregado} pts</p>
            </div>
            <div style={{ fontSize:22, color:'#10b981', animation:'flechaFlash 0.6s ease infinite alternate', marginLeft:6 }}>→</div>
          </div>
        )}
      </div>
    </div>
  );
};

const BarraProgreso = ({ ejercicioActual }) => (
  <div style={{ width:'100%', marginBottom:14 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:4 }}>
      <span>Ejercicio {ejercicioActual} / 30</span>
      <span>{Math.round((ejercicioActual/30)*100)}%</span>
    </div>
    <div style={{ height:5, background:'rgba(255,255,255,.07)', borderRadius:999, overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:999, background:'linear-gradient(90deg,#3b82f6,#a855f7)', width:`${(ejercicioActual/30)*100}%`, transition:'width .5s ease', boxShadow:'0 0 8px rgba(168,85,247,.5)' }}/>
    </div>
  </div>
);

function TarjetaModo({ emoji, titulo, desc, badge, badgeStyle, bordeColor, bgColor, sombra, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{ padding:'28px 18px', borderRadius:22, cursor:'pointer', background:bgColor, border:`2px solid ${bordeColor}`, boxShadow: hover ? (sombra||'none') : 'none', transition:'all .3s cubic-bezier(.34,1.2,.64,1)', transform: hover ? 'translateY(-8px)' : 'translateY(0)', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <span style={{ fontSize:'3.2rem' }}>{emoji}</span>
      <h3 style={{ color:'white', fontSize:'1.4rem', fontWeight:900, margin:0 }}>{titulo}</h3>
      <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0, lineHeight:1.5 }}>{desc}</p>
      <span style={{ fontSize:11, padding:'5px 14px', borderRadius:999, fontWeight:800, ...badgeStyle }}>{badge}</span>
    </div>
  );
}

export default function EjerciciosFlash() {
  const navigate = useNavigate();
  const [usuario, setUsuario]                     = useState(null);
  const [esMenor, setEsMenor]                     = useState(false);
  const [configNiveles, setConfigNiveles]         = useState(CONFIG_NIVELES_MAYOR);
  const [maxNivel, setMaxNivel]                   = useState(6);
  const [progreso, setProgreso]                   = useState({ nivelActual:1, ejercicioActual:1 });
  const [progresoClasico, setProgresoClasico]     = useState({ nivelActual:1, ejercicioActual:1 });
  const [ejerciciosClasicoCompletados, setEjerciciosClasicoCompletados] = useState({});

  const [totalPuntosEnBase, setTotalPuntosEnBase] = useState(0);
  const [puntosHeader, setPuntosHeader]           = useState(0);
  const [puntosYaEnEjercicio, setPuntosYaEnEjercicio] = useState(0); 
  const [desglosePuntos, setDesglosePuntos]       = useState(null);
  const [mostrarAnimPuntos, setMostrarAnimPuntos] = useState(false);
  const [mostrarConfeti, setMostrarConfeti]       = useState(false);
  const [puntosGanadosEsteReto, setPuntosGanadosEsteReto] = useState(0);
  const [mensajeResultado, setMensajeResultado]   = useState('');
  const [esPuntosNuevos, setEsPuntosNuevos]       = useState(false);

  const [modoAsistido, setModoAsistido]           = useState(false);
  const [modoAudio, setModoAudio]                 = useState('voz'); 
  const [pasoAsistidoActual, setPasoAsistidoActual] = useState(0); 
  const [subPasosColumnas, setSubPasosColumnas]   = useState([]); 
  const [indiceSubPaso, setIndiceSubPaso]         = useState(0);  
  const [valorAbacoEnVivo, setValorAbacoEnVivo]   = useState(0);
  const [memoriaPuntosLocal, setMemoriaPuntosLocal] = useState({});

  const [estado, setEstado]                       = useState('seleccion-modo');
  const [modoJuego, setModoJuego]                 = useState('campana');
  const [nivelSeleccionado, setNivelSeleccionado] = useState(1);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(1);
  const [velocidad, setVelocidad]                 = useState('normal');
  const [clasicoOperacion, setClasicoOperacion]   = useState('suma');
  const [clasicoTiempo, setClasicoTiempo]         = useState(3);
  const [ejercicio, setEjercicio]                 = useState({ secuenciaNumeros:[], opciones:[], correcta:null });
  const [contador, setContador]                   = useState(3);
  const [indiceNumero, setIndiceNumero]           = useState(0);
  const [seleccion, setSeleccion]                 = useState(null);
  const [tiempoInicio, setTiempoInicio]           = useState(0);
  const [procesando, setProcesando]               = useState(false);

  const audioRef = useRef(null);

  // ── FUNCIÓN LIMPIA PARA CARGAR PUNTOS Y PROGRESO (SIN ESCÁNER) ──
 // ── FUNCIÓN CONECTADA AL NUEVO BACKEND ──
  useEffect(() => {
    const str = localStorage.getItem('usuarioMate');
    if (!str) { navigate('/'); return; }
    const datos = JSON.parse(str);
    setUsuario(datos);
    const menor = Boolean(datos?.categoria?.toLowerCase()?.includes('menor'));
    setEsMenor(menor);
    setConfigNiveles(menor ? CONFIG_NIVELES_MENOR : CONFIG_NIVELES_MAYOR);
    setMaxNivel(menor ? 3 : 6);
    
    const id = datos.usuarioId || datos.usuarioID || datos.id;
    
    // 1. Cargar puntos totales
    fetch(`${API_BASE_URL}/api/Puntuaciones/usuario/${id}/total`)
      .then(res => res.json())
      .then(data => {
         setTotalPuntosEnBase(data.totalPuntos || 0);
         setPuntosHeader(data.totalPuntos || 0);
      })
      .catch(err => console.error(err));

    // 2. NUEVO: Cargar progreso real desde la base de datos con RAYOS X
    fetch(`${API_BASE_URL}/api/Puntuaciones/usuario/${id}/progreso`)
      .then(res => {
         if (!res.ok) throw new Error("El servidor respondió con error: " + res.status);
         return res.json();
      })
      .then(data => {
         console.log("🔥 RESPUESTA DEL SERVIDOR (PROGRESO):", data);
         setProgreso(data);
         localStorage.setItem(`progresoFlash_${id}`, JSON.stringify(data));
      })
      .catch(err => {
         console.error("❌ ERROR AL CONECTAR CON EL SERVIDOR:", err);
         const pg = localStorage.getItem(`progresoFlash_${id}`);
         if (pg) setProgreso(JSON.parse(pg));
      });

    // (El progreso del modo clásico sigue siendo solo local)
    const pgClasico = localStorage.getItem(`progresoFlashClasico_${id}`);
    if (pgClasico) setProgresoClasico(JSON.parse(pgClasico));
    const completadosClasico = localStorage.getItem(`ejerciciosFlashClasico_${id}`);
    if (completadosClasico) setEjerciciosClasicoCompletados(JSON.parse(completadosClasico));

  }, [navigate]);

  const sonido = (freq, tipo, vol, dur) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new AC();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tipo; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch(e){}
  };

  const ejecutarAudio = (num) => {
    if (modoAudio === 'voz') {
        decirNumero(num);
    } else {
        sonido(1000, 'triangle', 0.4, 0.12);
    }
  };

  const irA = (pantalla) => {
    setEstado(pantalla);
    setProcesando(false);
    setSeleccion(null);
    setMostrarAnimPuntos(false);
    setMostrarConfeti(false);
    setDesglosePuntos(null);
  };

  const seleccionarEjercicio = async (num) => {
    setEjercicioSeleccionado(num);
    let yaGanados = 0;
    if (usuario) {
      const id = usuario.usuarioId || usuario.usuarioID || usuario.id;
      try {
         const res = await fetch(`${API_BASE_URL}/api/Puntuaciones/usuario/${id}/nivel/${nivelSeleccionado}/ejercicio/${num}`);
         if(res.ok) {
            const d = await res.json();
            yaGanados = d.puntosObtenidos || 0;
         }
      } catch(e) {}
      const deLaMemoria = memoriaPuntosLocal[`${nivelSeleccionado}-${num}`] || 0;
      yaGanados = Math.max(yaGanados, deLaMemoria); 
    }
    setPuntosYaEnEjercicio(yaGanados);
    irA('seleccion-velocidad');
  };

  const irASiguienteReto = async () => {
    const prox = ejercicioSeleccionado + 1;
    setEjercicioSeleccionado(prox);
    let yaGanados = 0;
    if (usuario) {
      const id = usuario.usuarioId || usuario.usuarioID || usuario.id;
      try {
         const res = await fetch(`${API_BASE_URL}/api/Puntuaciones/usuario/${id}/nivel/${nivelSeleccionado}/ejercicio/${prox}`);
         if(res.ok) {
            const d = await res.json();
            yaGanados = d.puntosObtenidos || 0;
         }
      } catch(e){}
      const deLaMemoria = memoriaPuntosLocal[`${nivelSeleccionado}-${prox}`] || 0;
      yaGanados = Math.max(yaGanados, deLaMemoria);
    }
    setPuntosYaEnEjercicio(yaGanados);
    irA('seleccion-velocidad');
  };

  const seleccionarEjercicioClasico = (num) => {
    setEjercicioSeleccionado(num);
    setPuntosYaEnEjercicio(0);
    irA('clasico-config');
  };

  const iniciarCampana = (vel) => {
    setVelocidad(vel);
    const cfg = configNiveles[nivelSeleccionado];
    const cantidad = obtenerCantidadNumeros(ejercicioSeleccionado);
    const gen = generarSecuenciaInteligente(cfg.min, cfg.max, cantidad, ejercicioSeleccionado, 'mixto');
    resetearJuego(gen);
  };

  const iniciarClasico = (asistido = false) => {
    const cfg = configNiveles[nivelSeleccionado];
    const cantidad = obtenerCantidadNumeros(ejercicioSeleccionado);
    const gen = generarSecuenciaInteligente(cfg.min, cfg.max, cantidad, ejercicioSeleccionado, clasicoOperacion);
    resetearJuego(gen);
    
    if (asistido) {
      setModoAsistido(true);
      setPasoAsistidoActual(0);
      setValorAbacoEnVivo(0);
      setEstado('modo-asistido');
    }
  };

  const resetearJuego = (gen) => {
    setEjercicio(gen);
    setEstado('cuenta-regresiva');
    setContador(3);
    setIndiceNumero(0);
    setSeleccion(null);
    setDesglosePuntos(null);
    setMostrarAnimPuntos(false);
    setMostrarConfeti(false);
    setMensajeResultado('');
    setPuntosGanadosEsteReto(0);
    setEsPuntosNuevos(false);
    setProcesando(false);
  };

  useEffect(() => {
    if (estado === 'modo-asistido' && ejercicio.secuenciaNumeros.length > 0) {
       const valActual = pasoAsistidoActual === 0 ? 0 : ejercicio.secuenciaNumeros.slice(0, pasoAsistidoActual).reduce((a,b)=>a+b, 0);
       const numMover = ejercicio.secuenciaNumeros[pasoAsistidoActual];
       
       setTimeout(() => ejecutarAudio(numMover), 300);

       const nuevosSubPasos = generarPasosColumnas(valActual, numMover);
       setSubPasosColumnas(nuevosSubPasos);
       setIndiceSubPaso(0);
    }
  }, [pasoAsistidoActual, estado, ejercicio, modoAudio]);

  useEffect(() => {
    if (estado !== 'modo-asistido' || subPasosColumnas.length === 0) return;
    
    const pasoActual = subPasosColumnas[indiceSubPaso];
    if (!pasoActual) return;

    if (valorAbacoEnVivo === pasoActual.metaIntermedia) {
       sonido(1200, 'sine', 0.1, 0.1); 
       if (indiceSubPaso < subPasosColumnas.length - 1) {
          setIndiceSubPaso(prev => prev + 1);
       } else {
          if (pasoAsistidoActual < ejercicio.secuenciaNumeros.length - 1) {
             setPasoAsistidoActual(prev => prev + 1);
          } else {
             setTimeout(() => {
               setEstado('resultado');
               evaluarRespuesta(valorAbacoEnVivo);
             }, 1000);
          }
       }
    }
  }, [valorAbacoEnVivo, subPasosColumnas, indiceSubPaso, estado]);

  useEffect(() => {
    if (estado !== 'cuenta-regresiva') return;
    if (contador > 0) {
      if (modoAudio === 'voz') {
         if (contador === 3) hablarTexto("Iniciamos en 3");
         else hablarTexto(contador.toString());
      } else {
         sonido(440, 'sine', 0.2, 0.1);
      }
      const t = setTimeout(()=>setContador(c=>c-1), 900);
      return ()=>clearTimeout(t);
    } else {
      if (modoAudio === 'pitido') sonido(880, 'sine', 0.4, 0.3);
      setEstado('mostrando');
    }
  }, [estado, contador, modoAudio]);

  useEffect(() => {
    if (estado!=='mostrando') return;
    
    if (indiceNumero < ejercicio.secuenciaNumeros.length) {
      const numActual = ejercicio.secuenciaNumeros[indiceNumero];
      ejecutarAudio(numActual); 

      let ms;
      if (modoJuego==='clasico') { ms = clasicoTiempo * 1000; } 
      else {
        const cfg = configNiveles[nivelSeleccionado];
        ms = obtenerTiempoMs(cfg?.digitos||1, velocidad, esMenor);
        ms -= Math.floor((ejercicioSeleccionado-1)*6);
        ms = Math.max(ms, 600);
      }
      const t = setTimeout(()=>setIndiceNumero(i=>i+1), ms);
      return ()=>clearTimeout(t);
    } else {
      setEstado('preguntando');
      setTiempoInicio(Date.now());
    }
  }, [estado, indiceNumero, ejercicio.secuenciaNumeros, modoJuego, clasicoTiempo, nivelSeleccionado, velocidad, ejercicioSeleccionado, esMenor, configNiveles, modoAudio]);

  const evaluarRespuesta = async (respuesta) => {
    if (procesando || seleccion!==null) return;
    setProcesando(true);
    setSeleccion(respuesta);
    const tiempoMs = Date.now() - tiempoInicio;
    const correcta = respuesta === ejercicio.correcta;

    if (correcta && modoJuego==='campana') {
      const techoModo = TECHO_MODO[velocidad];
      const diferenciaModo = Math.max(0, techoModo - puntosYaEnEjercicio);

      const umbralRapido = esMenor ? 5000 : 3000;
      const umbralNormal = esMenor ? 9000 : 6000;
      let bonusTiempo = 0, razonBonus = '🕐 Respuesta a tiempo';
      if (tiempoMs < umbralRapido)      { bonusTiempo=BONUS_RAPIDO; razonBonus='⚡ Respuesta ultrarrápida'; }
      else if (tiempoMs < umbralNormal) { bonusTiempo=BONUS_NORMAL; razonBonus='✅ Respuesta rápida'; }

      const totalAEnviar = diferenciaModo + bonusTiempo;
      const labelVelocidad = velocidad==='rapido'?'⚡ Modo Experto' :velocidad==='normal'?'🚶 Modo Promedio':'🐢 Modo Aprendiz';

      const dsg = {
        base:          diferenciaModo,
        bonus:         bonusTiempo,
        totalAgregado: totalAEnviar,
        razonBonus,
        labelVelocidad,
        techoModo,
        yaTeníamos:    puntosYaEnEjercicio,
      };
      setDesglosePuntos(dsg);

      if (totalAEnviar > 0) {
        setEsPuntosNuevos(true);
        setPuntosGanadosEsteReto(totalAEnviar);
        setMostrarConfeti(true);

        try {
          const id = usuario.usuarioId || usuario.usuarioID || usuario.id;
          await fetch(`${API_BASE_URL}/api/Puntuaciones/guardar`, {
            method:'POST', headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({
              usuarioId: id,
              nivelId: nivelSeleccionado,
              ejercicioNumero: ejercicioSeleccionado,
              puntosObtenidos: totalAEnviar,
              tiempoRespuestaSegundos: parseFloat((tiempoMs/1000).toFixed(2))
            })
          });
        } catch(e){ console.error(e); }

        animarHeader(totalAEnviar, totalPuntosEnBase);
        setTimeout(()=>setMostrarAnimPuntos(true), 250);
        setTimeout(()=>setMostrarAnimPuntos(false), 4000);

        const nuevoAcumuladoBase = puntosYaEnEjercicio + diferenciaModo;
        setPuntosYaEnEjercicio(nuevoAcumuladoBase);
        setMemoriaPuntosLocal(prev => ({ ...prev, [`${nivelSeleccionado}-${ejercicioSeleccionado}`]: nuevoAcumuladoBase }));
        setMensajeResultado('¡Puntos guardados!');
      } else {
        setEsPuntosNuevos(false);
        setMensajeResultado('Ya alcanzaste el máximo en este reto. ¡Fue un gran repaso!');
      }

      if (nivelSeleccionado===progreso.nivelActual && ejercicioSeleccionado===progreso.ejercicioActual) {
        let nE=progreso.ejercicioActual+1, nN=progreso.nivelActual;
        if (nE>30) {
          if (progreso.nivelActual<maxNivel){ nE=1; nN++; }
          else { nE=30; nN=maxNivel; }
        }
        const np={ nivelActual:nN, ejercicioActual:nE };
        setProgreso(np);
        const id = usuario.usuarioId||usuario.usuarioID||usuario.id;
        localStorage.setItem(`progresoFlash_${id}`, JSON.stringify(np));
      }
    } else if (correcta && modoJuego==='clasico') {
      setMensajeResultado('Práctica completada. Modo Clásico finalizado.');
      const id = usuario.usuarioId || usuario.usuarioID || usuario.id;
      const claveEjercicio = `${nivelSeleccionado}-${ejercicioSeleccionado}`;
      setEjerciciosClasicoCompletados(prev => {
        const np = { ...prev, [claveEjercicio]: true };
        localStorage.setItem(`ejerciciosFlashClasico_${id}`, JSON.stringify(np));
        return np;
      });
      if (nivelSeleccionado===progresoClasico.nivelActual && ejercicioSeleccionado===progresoClasico.ejercicioActual) {
        let nE = progresoClasico.ejercicioActual + 1;
        let nN = progresoClasico.nivelActual;
        if (nE > 30) {
          if (progresoClasico.nivelActual < maxNivel) { nE = 1; nN++; }
          else { nE = 30; nN = maxNivel; }
        }
        const np = { nivelActual:nN, ejercicioActual:nE };
        setProgresoClasico(np);
        localStorage.setItem(`progresoFlashClasico_${id}`, JSON.stringify(np));
      }
    }

    setTimeout(()=>{ setEstado('resultado'); setProcesando(false); }, 700);
  };

  const animarHeader = (ganados, base) => {
    const final = base + ganados;
    const inc   = Math.max(1, Math.ceil(ganados/30));
    let cur     = base;
    sonido(1200,'sine',.15,.1);
    const iv = setInterval(()=>{
      cur += inc;
      if (cur>=final){
        setPuntosHeader(final);
        setTotalPuntosEnBase(final);
        sonido(1600,'triangle',.2,.35);
        clearInterval(iv);
      } else {
        setPuntosHeader(cur);
      }
    }, 30);
  };

  if (!usuario) return null;
  const mostrarHeader = modoJuego==='campana' && estado!=='seleccion-modo';

  return (
    <div className="flash-page" style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29 0%,#1a1040 50%,#0f172a 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', padding:'20px', overflow:'hidden',
      fontFamily:"'Nunito','Segoe UI',sans-serif",
    }}>
      <ConfetiCOD visible={mostrarConfeti}/>
      <PuntajeFlotante desglose={desglosePuntos} visible={mostrarAnimPuntos}/>
      <AnimacionFichitas cantidad={puntosGanadosEsteReto} visible={mostrarAnimPuntos} />

      {mostrarHeader && (
        <div style={{ position:'fixed', top:14, right:20, zIndex:300, display:'flex', alignItems:'center', gap:10, padding:'10px 22px', borderRadius:30, background:'rgba(15,12,41,.92)', border:'1px solid rgba(255,255,255,.1)', boxShadow:'0 8px 24px rgba(0,0,0,.4)', backdropFilter:'blur(12px)' }}>
          <span style={{ fontSize:'1.3rem' }}>🏆</span>
          <span style={{ fontSize:'1.5rem', fontWeight:900, color:'#fbbf24', textShadow:'0 0 10px rgba(251,191,36,.4)', transition:'color .1s' }}>{puntosHeader.toLocaleString('en-US')}</span>
          {esPuntosNuevos && puntosGanadosEsteReto>0 && estado==='resultado' && (
            <span style={{ position:'absolute', bottom:'110%', right:20, fontSize:16, fontWeight:900, color:'#10b981', animation:'subirPuntos 1.5s ease 1.3s forwards', opacity:0, whiteSpace:'nowrap' }}>+{puntosGanadosEsteReto}</span>
          )}
        </div>
      )}

      <div className="flash-card" style={{
        background:'rgba(255,255,255,.04)', backdropFilter:'blur(20px)', borderRadius:28, border:'1px solid rgba(255,255,255,.1)',
        boxShadow:'0 24px 60px rgba(0,0,0,.5)', maxWidth:820, width:'100%', minHeight:520, display:'flex', flexDirection:'column',
        justifyContent:'center', alignItems:'center', padding:'40px 36px', position:'relative', textAlign:'center', marginTop:60, zIndex:10,
      }}>
        {estado!=='seleccion-modo' && estado!=='modo-asistido' && (
          <button onClick={()=>irA('seleccion-modo')} style={{ position:'absolute', top:16, right:20, background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem', color:'rgba(255,255,255,.3)', transition:'color .2s', lineHeight:1, fontFamily:'inherit' }}
            onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'} >✕</button>
        )}

        {/* ════ SELECCIÓN MODO ════ */}
        {estado==='seleccion-modo' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <h1 style={S.titulo}>Módulo Flash Anzan</h1>
            <p style={S.subtitulo}>¿Cómo deseas jugar hoy, {usuario.nombre}?</p>
            <div className="flash-mode-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:24 }}>
              <TarjetaModo emoji="⚙️" titulo="Modo Clásico" desc="Entrena libremente. Escoge operación y tiempo." badge="Sin puntos al ranking" badgeStyle={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.5)' }} bordeColor="rgba(255,255,255,.1)" bgColor="rgba(255,255,255,.06)" onClick={()=>{ setModoJuego('clasico'); irA('clasico-inicio'); }}/>
              <TarjetaModo emoji="🏆" titulo="Modo Campaña" desc="Supera retos progresivos. Acumula puntos en el ranking." badge="¡Acumula puntos reales!" badgeStyle={{ background:'#fbbf24', color:'#78350f' }} bordeColor="rgba(59,130,246,.4)" bgColor="rgba(29,78,216,.2)" sombra="0 10px 30px rgba(59,130,246,.2)" onClick={()=>{ setModoJuego('campana'); irA('campana-inicio'); }}/>
            </div>
            <button onClick={()=>navigate('/menu')} style={S.btnVolver2}>← Volver al Menú Principal</button>
          </div>
        )}

        {/* ════ CLÁSICO INICIO Y NIVELES ════ */}
        {estado==='clasico-inicio' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <button onClick={()=>irA('seleccion-modo')} style={S.volver}>Volver</button>
            <h1 style={S.titulo}>Modo Clasico</h1>
            <p style={S.subtitulo}>Practica sin puntos con niveles de {esMenor ? 'Primaria Menor' : 'Primaria Mayor'}.</p>
            <div className="flash-level-list" style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:520, margin:'0 auto' }}>
              {Object.entries(configNiveles).map(([nv,cfg])=>{
                const n=parseInt(nv);
                const completado = Array.from({length:30},(_,i)=>i+1).every(num => Boolean(ejerciciosClasicoCompletados[`${n}-${num}`]));
                return (
                  <button key={nv} onClick={()=>{ setNivelSeleccionado(n); irA('clasico-mapa'); }} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderRadius:18, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .25s cubic-bezier(.34,1.2,.64,1)', background:completado?'rgba(20,184,166,.15)':'rgba(255,255,255,.06)', border:completado?'2px solid rgba(20,184,166,.35)':'2px solid rgba(255,255,255,.12)' }} onMouseEnter={e=>{ e.currentTarget.style.transform='translateX(6px)'; }} onMouseLeave={e=>{ e.currentTarget.style.transform='translateX(0)'; }} >
                    <div>
                      <p style={{ margin:0, fontSize:'1.1rem', fontWeight:900, color:'white' }}>{cfg.nombre}</p>
                      <p style={{ margin:'2px 0 0', fontSize:12, color:'rgba(255,255,255,.45)', fontWeight:600 }}>{cfg.min.toLocaleString('en-US')} - {cfg.max.toLocaleString('en-US')} - {cfg.digitos} digito{cfg.digitos>1?'s':''}</p>
                    </div>
                    <span style={{ fontSize:'1.4rem', color:completado?'#14b8a6':'#fbbf24', fontWeight:900 }}>{completado?'Listo':'Practicar'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {estado==='clasico-mapa' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <button onClick={()=>irA('clasico-inicio')} style={S.volver}>Niveles</button>
            <h2 style={S.titulo}>{configNiveles[nivelSeleccionado]?.nombre}</h2>
            <p style={S.subtitulo}>Elige un reto. Aqui no se guardan puntos de ranking.</p>
            <BarraProgreso ejercicioActual={ nivelSeleccionado<progresoClasico.nivelActual?30 :nivelSeleccionado===progresoClasico.nivelActual?progresoClasico.ejercicioActual:1 }/>
            <div className="flash-exercise-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, maxWidth:560, margin:'0 auto' }}>
              {Array.from({length:30},(_,i)=>i+1).map(num=>{
                const completado = Boolean(ejerciciosClasicoCompletados[`${nivelSeleccionado}-${num}`]);
                return (
                  <button key={num} onClick={()=>seleccionarEjercicioClasico(num)} style={{ aspectRatio:'1', borderRadius:13, fontSize:'1.3rem', fontWeight:900, cursor:'pointer', border:completado?'2px solid rgba(20,184,166,.5)':'2px solid rgba(251,191,36,.45)', background:completado?'rgba(20,184,166,.22)':'rgba(251,191,36,.18)', color:completado?'#14b8a6':'#fbbf24', animation:'none', transition:'transform .15s', fontFamily:'inherit' }} onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.12)'; }} onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }} >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {estado==='clasico-config' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <button onClick={()=>irA('clasico-mapa')} style={S.volver}>Mapa</button>
            <h2 style={S.titulo}>Ejercicio #{ejercicioSeleccionado}</h2>
            <p style={S.subtitulo}>{obtenerCantidadNumeros(ejercicioSeleccionado)} numeros - {configNiveles[nivelSeleccionado]?.nombre}</p>
            <div style={S.bloque}>
              <h4 style={S.h4}>1. Operación</h4>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[['suma','➕ Suma'],['resta','➖ Resta'],['mixto','🔀 Mixto']].map(([v,l])=>(
                  <button key={v} onClick={()=>setClasicoOperacion(v)} style={{ ...S.btnOp, ...(clasicoOperacion===v?S.btnOpActiva:{}) }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={S.bloque}>
              <h4 style={S.h4}>2. Tiempo por número: <span style={{ color:'#38bdf8' }}>{clasicoTiempo}s</span></h4>
              <input type="range" min="1" max="10" step="1" value={clasicoTiempo} onChange={e=>setClasicoTiempo(+e.target.value)} style={{ width:'100%', accentColor:'#38bdf8', marginTop:8 }}/>
              <div style={{ display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.3)', fontSize:12, marginTop:4 }}>
                <span>Relámpago (1s)</span><span>Lento (10s)</span>
              </div>
            </div>
            
            <button onClick={() => iniciarClasico(false)} style={{ ...S.btnPrimario, width:'100%', fontSize:'1.1rem', padding:'18px', marginTop:16 }}>
              ¡Empezar Práctica! 🚀
            </button>

            {/* BOTÓN MODO ASISTIDO (ENTRENADOR) */}
            <div style={{ marginTop: 25, width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#10b981', fontWeight: 800 }}>¿Necesitas ayuda paso a paso?</p>
              <button onClick={() => iniciarClasico(true)} style={{ ...S.btnPrimario, background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', width: '100%', padding: '16px' }}>
                🧠 Entrenador Soroban (Ayuda Visual)
              </button>
            </div>
          </div>
        )}

        {/* ════ ENTRENADOR SOROBAN (VISTA CENTRADA CON SCROLL DENTRO DEL CONTENEDOR) ════ */}
        {estado==='modo-asistido' && (
          <div style={{ width:'100%', height:'100%', display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', overflow: 'hidden' }}>
            
            {/* Header: Botón Atrás + Título + Toggle Audio */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button onClick={()=>irA('clasico-config')} style={{...S.volver, position:'relative', top:0, left:0, margin:0}}>← Salir</button>
              <h2 style={{...S.titulo, margin: 0, fontSize: '1.6rem'}}>Entrenador Soroban</h2>
              <button onClick={() => setModoAudio(prev => prev === 'voz' ? 'pitido' : 'voz')} style={{...S.btnSecundario, padding: '8px 15px', fontSize: '0.9rem', width: '100px'}}>
                {modoAudio === 'voz' ? '🗣️ Voz' : '🔔 Pitido'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '15px', overflow: 'hidden', alignItems: 'center' }}>
              
              {/* SECUENCIA DE NÚMEROS (BARRA HORIZONTAL) */}
              <div className="ocultar-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                {ejercicio.secuenciaNumeros.map((num, idx) => {
                  const yaPaso = idx < pasoAsistidoActual;
                  const esActual = idx === pasoAsistidoActual;
                  return (
                    <div key={idx} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 15px', borderRadius: '12px', minWidth: '70px',
                      background: yaPaso ? 'rgba(16, 185, 129, 0.2)' : esActual ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      border: esActual ? '2px solid #38bdf8' : yaPaso ? '2px solid #10b981' : '2px dashed rgba(255,255,255,0.1)',
                      opacity: idx > pasoAsistidoActual ? 0.4 : 1, transition: 'all 0.3s'
                    }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '900', color: num > 0 ? (yaPaso ? '#10b981' : '#38bdf8') : '#ef4444' }}>
                        {num > 0 ? `+${num.toLocaleString('en-US')}` : num.toLocaleString('en-US')}
                      </span>
                      <span style={{ fontSize: '0.9rem', marginTop: '2px' }}>{yaPaso ? '✅' : esActual ? '⏳' : '🔒'}</span>
                    </div>
                  );
                })}
              </div>

              {/* VALOR ACTUAL Y ÁBACO (EL MÁS GRANDE POSIBLE) */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '10px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#38bdf8', color: '#0f172a', padding: '5px 20px', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '900', boxShadow: '0 0 15px rgba(56,189,248,0.5)', zIndex: 10 }}>
                  {valorAbacoEnVivo.toLocaleString('en-US')}
                </div>
                
                <div style={{ transform: 'scale(0.85)', transformOrigin: 'center', marginTop: '30px' }}>
                  <AbacoInteractivo 
                    key={`abaco-entrenador-${ejercicioSeleccionado}`} 
                    onValueChange={(val) => setValorAbacoEnVivo(val)} 
                    columnasActivas={[12, 11, 10, 9, 8, 7]} 
                    valorObjetivo={subPasosColumnas[indiceSubPaso]?.metaIntermedia}
                    columnaResaltada={subPasosColumnas[indiceSubPaso]?.colIndex}
                  />
                </div>
              </div>

              {/* CAJA DE INSTRUCCIONES ABAJO */}
              <div className="ocultar-scroll" style={{ width: '100%', maxWidth: '800px', background: 'rgba(251, 191, 36, 0.1)', border: '2px solid #fbbf24', padding: '15px', borderRadius: '15px', textAlign: 'left', overflowY: 'auto', maxHeight: '150px' }}>
                <h4 style={{ color: '#fbbf24', margin: '0 0 10px 0', fontSize: '1.1rem' }}>💡 Instrucciones Paso a Paso:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subPasosColumnas.map((paso, i) => {
                     const isCurrent = i === indiceSubPaso;
                     const isPast = i < indiceSubPaso;
                     return (
                        <p key={i} style={{ 
                          margin: 0, color: 'white', fontSize: '1.1rem', lineHeight: '1.4', 
                          opacity: isPast ? 0.4 : (isCurrent ? 1 : 0.4), 
                          fontWeight: isCurrent ? 'bold' : 'normal' 
                        }}>
                          <strong style={{ color: isCurrent ? '#38bdf8' : '#94a3b8' }}>{paso.colNombre}:</strong> {paso.texto}
                          {isCurrent && ' 👈'}
                          {isPast && ' ✅'}
                        </p>
                     )
                  })}
                  {subPasosColumnas.length === 0 && <p style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>¡Completado! Pasando al siguiente...</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ CAMPAÑA: NIVELES Y MAPA ════ */}
        {estado==='campana-inicio' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <button onClick={()=>irA('seleccion-modo')} style={S.volver}>← Modos</button>
            <h1 style={S.titulo}>Modo Campaña</h1>
            <p style={S.subtitulo}>Selecciona tu nivel de entrenamiento</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:480, margin:'0 auto' }}>
              {Object.entries(configNiveles).map(([nv,cfg])=>{
                const n=parseInt(nv);
                const bloqueado  = n>progreso.nivelActual;
                const completado = n<progreso.nivelActual;
                return (
                  <button key={nv} disabled={bloqueado} onClick={()=>{ setNivelSeleccionado(n); irA('mapa-ejercicios'); }} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderRadius:18, cursor:bloqueado?'not-allowed':'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .25s cubic-bezier(.34,1.2,.64,1)', background:bloqueado?'rgba(255,255,255,.03)' :completado?'rgba(16,185,129,.15)':'rgba(59,130,246,.2)', border:bloqueado?'2px dashed rgba(255,255,255,.08)' :completado?'2px solid rgba(16,185,129,.35)':'2px solid rgba(59,130,246,.4)' }} onMouseEnter={e=>{ if(!bloqueado) e.currentTarget.style.transform='translateX(6px)'; }} onMouseLeave={e=>{ e.currentTarget.style.transform='translateX(0)'; }} >
                    <div>
                      <p style={{ margin:0, fontSize:'1.1rem', fontWeight:900, color:bloqueado?'rgba(255,255,255,.2)':'white' }}>{cfg.nombre}</p>
                      <p style={{ margin:'2px 0 0', fontSize:12, color:bloqueado?'rgba(255,255,255,.15)':'rgba(255,255,255,.45)', fontWeight:600 }}>{cfg.min.toLocaleString('en-US')} – {cfg.max.toLocaleString('en-US')}</p>
                    </div>
                    <span style={{ fontSize:'1.6rem' }}>{bloqueado?'🔒':completado?'✅':'⭐'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {estado==='mapa-ejercicios' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <button onClick={()=>irA('campana-inicio')} style={S.volver}>← Niveles</button>
            <h2 style={S.titulo}>{configNiveles[nivelSeleccionado]?.nombre}</h2>
            <BarraProgreso ejercicioActual={ nivelSeleccionado<progreso.nivelActual?30 :nivelSeleccionado===progreso.nivelActual?progreso.ejercicioActual:1 }/>
            <div className="flash-exercise-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, maxWidth:560, margin:'0 auto' }}>
              {Array.from({length:30},(_,i)=>i+1).map(num=>{
                const bloqueado  = nivelSeleccionado===progreso.nivelActual && num>progreso.ejercicioActual;
                const completado = nivelSeleccionado<progreso.nivelActual || (nivelSeleccionado===progreso.nivelActual && num<progreso.ejercicioActual);
                const esActual   = !bloqueado && !completado;
                return (
                  <button key={num} disabled={bloqueado} onClick={()=>seleccionarEjercicio(num)} style={{ aspectRatio:'1', borderRadius:13, fontSize:bloqueado?'1rem':'1.3rem', fontWeight:900, cursor:bloqueado?'not-allowed':'pointer', border:esActual?'2px solid rgba(245,158,11,.5)':'1px solid rgba(255,255,255,.06)', background:bloqueado?'rgba(255,255,255,.03)' :completado?'rgba(16,185,129,.2)':'rgba(245,158,11,.2)', color:bloqueado?'rgba(255,255,255,.15)' :completado?'#10b981':'#f59e0b', animation:esActual?'brillar 2s infinite':'none', transition:'transform .15s', fontFamily:'inherit' }} onMouseEnter={e=>{ if(!bloqueado) e.currentTarget.style.transform='scale(1.12)'; }} onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }} >
                    {bloqueado?'🔒':num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ SELECCIÓN VELOCIDAD (SOLO CAMPAÑA) ════ */}
        {estado==='seleccion-velocidad' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button onClick={()=>irA('mapa-ejercicios')} style={{...S.volver, position: 'static'}}>← Mapa</button>
                <button onClick={() => setModoAudio(prev => prev === 'voz' ? 'pitido' : 'voz')} style={{...S.btnSecundario, padding: '8px 15px', fontSize: '0.9rem', width: '100px'}}>
                    {modoAudio === 'voz' ? '🗣️ Voz' : '🔔 Pitido'}
                </button>
            </div>
            
            <h2 style={S.titulo}>Ejercicio #{ejercicioSeleccionado}</h2>
            <p style={S.subtitulo}>{obtenerCantidadNumeros(ejercicioSeleccionado)} números · {configNiveles[nivelSeleccionado]?.nombre}</p>

            <div style={{ ...S.bloque, marginBottom:20 }}>
              <p style={{ margin:'0 0 10px', fontSize:12, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>Puntos en este reto</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                {[ { vel:'lento', emoji:'🐢', label:'Aprendiz', pts:50, color:'#14b8a6' }, { vel:'normal', emoji:'🚶', label:'Promedio', pts:100, color:'#3b82f6' }, { vel:'rapido', emoji:'⚡', label:'Experto', pts:125, color:'#8b5cf6' }, ].map(({vel,emoji,label,pts,color})=>{
                  const yaAlcanzado = puntosYaEnEjercicio >= pts;
                  const diferencia  = Math.max(0, pts - puntosYaEnEjercicio);
                  return (
                    <div key={vel} style={{ background:`${color}14`, border:`1px solid ${color}44`, borderRadius:12, padding:'8px 16px', flex:1, minWidth:100, opacity: yaAlcanzado ? 0.45 : 1 }}>
                      <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:700 }}>{emoji} {label}</p>
                      <p style={{ margin:'2px 0 0', fontSize:18, fontWeight:900, color: yaAlcanzado ? '#64748b' : color }}>{yaAlcanzado ? '✅ Máx.' : `+${diferencia}`}</p>
                      <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,.3)' }}>Techo: {pts} pts</p>
                    </div>
                  );
                })}
                <div style={{ background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.25)', borderRadius:12, padding:'8px 16px', width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'#fbbf24', fontWeight:700 }}>⚡ Bonus respuesta rápida</span>
                  <span style={{ fontSize:16, fontWeight:900, color:'#fbbf24' }}>+25 pts</span>
                </div>
              </div>
              {puntosYaEnEjercicio>0 && (
                <p style={{ margin:'10px 0 0', fontSize:11, color:'rgba(255,255,255,.35)', fontWeight:600 }}>Ya tienes <span style={{ color:'#fbbf24', fontWeight:800 }}>{puntosYaEnEjercicio} pts</span> en este reto — solo se agrega la diferencia.</p>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, maxWidth:480, margin:'0 auto' }}>
              {[ { v:'lento', emoji:'🐢', label:'Aprendiz', color:'#14b8a6', pts:'50 pts', sub:'Más tiempo' }, { v:'normal', emoji:'🚶', label:'Promedio', color:'#3b82f6', pts:'100 pts', sub:'Tiempo estándar' }, { v:'rapido', emoji:'⚡', label:'Experto', color:'#8b5cf6', pts:'125 pts', sub:'Menos tiempo' }, ].map(({v,emoji,label,color,pts,sub})=>(
                <button key={v} onClick={()=>iniciarCampana(v)} style={{ padding:'22px 10px', borderRadius:20, border:`2px solid ${color}44`, background:`${color}14`, cursor:'pointer', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all .25s cubic-bezier(.34,1.2,.64,1)' }} onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.background=`${color}28`; e.currentTarget.style.boxShadow=`0 12px 28px ${color}28`; }} onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background=`${color}14`; e.currentTarget.style.boxShadow='none'; }} >
                  <span style={{ fontSize:'2.2rem' }}>{emoji}</span>
                  <span style={{ color:'white', fontWeight:900, fontSize:'1rem' }}>{label}</span>
                  <span style={{ color, fontWeight:800, fontSize:13 }}>{pts}</span>
                  <span style={{ color:'rgba(255,255,255,.35)', fontSize:11 }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════ CUENTA REGRESIVA Y MOSTRANDO NÚMEROS ════ */}
        {estado==='cuenta-regresiva' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
            <p style={{ fontSize:'1.4rem', color:'rgba(255,255,255,.45)', fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', margin:0 }}>Ojos a la pantalla</p>
            <div style={{ fontSize:'9rem', fontWeight:900, color:'#38bdf8', lineHeight:1, textShadow:'0 0 40px rgba(56,189,248,.7)', animation:'latido .9s ease infinite alternate' }}>{contador}</div>
          </div>
        )}

        {estado==='mostrando' && indiceNumero < ejercicio.secuenciaNumeros.length && (
          <div style={{ height:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', maxWidth:320 }}>
              {ejercicio.secuenciaNumeros.map((_,i)=>(
                <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:i<indiceNumero?'#10b981':i===indiceNumero?'#38bdf8':'rgba(255,255,255,.12)', transition:'background .2s', boxShadow:i===indiceNumero?'0 0 8px #38bdf8':'none' }}/>
              ))}
            </div>
            <div key={indiceNumero} style={{ fontSize:ejercicio.secuenciaNumeros[indiceNumero]>=100000?'4rem' :ejercicio.secuenciaNumeros[indiceNumero]>=10000?'5rem' :ejercicio.secuenciaNumeros[indiceNumero]>=1000?'6rem':'8rem', fontWeight:900, lineHeight:1, color:ejercicio.secuenciaNumeros[indiceNumero]<0?'#ef4444':'#f8fafc', textShadow:ejercicio.secuenciaNumeros[indiceNumero]<0 ?'0 0 30px rgba(239,68,68,.4)':'0 0 30px rgba(248,250,252,.15)', animation:'zoomIn .22s cubic-bezier(.34,1.56,.64,1)' }}>
              {ejercicio.secuenciaNumeros[indiceNumero]>0 ?`+${ejercicio.secuenciaNumeros[indiceNumero].toLocaleString('en-US')}` :ejercicio.secuenciaNumeros[indiceNumero].toLocaleString('en-US')}
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.25)', fontWeight:600, margin:0 }}>{indiceNumero+1} / {ejercicio.secuenciaNumeros.length}</p>
          </div>
        )}

        {/* ════ PREGUNTANDO ════ */}
        {estado==='preguntando' && (
          <div style={{ width:'100%', animation:'aparecer .3s ease both' }}>
            <h2 style={{ ...S.titulo, marginBottom:24 }}>¿Cuál es el resultado?</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, maxWidth:460, margin:'0 auto' }}>
              {ejercicio.opciones.map((op,i)=>(
                <button key={i} onClick={()=>evaluarRespuesta(op)} disabled={seleccion!==null} style={{ padding:'22px 14px', borderRadius:20, fontFamily:'inherit', border:seleccion===op?'3px solid rgba(255,255,255,.3)':'2px solid rgba(255,255,255,.1)', background:seleccion===op?'rgba(255,255,255,.12)':'rgba(255,255,255,.05)', color:'white', fontSize:'2rem', fontWeight:900, cursor:seleccion!==null?'not-allowed':'pointer', opacity:seleccion!==null&&op!==seleccion?0.35:1, transition:'all .18s' }} onMouseEnter={e=>{ if(seleccion===null){ e.currentTarget.style.borderColor='#38bdf8'; e.currentTarget.style.background='rgba(56,189,248,.1)'; e.currentTarget.style.transform='scale(1.04)'; }}} onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,.1)'; e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.transform='scale(1)'; }} >
                  {op.toLocaleString('en-US')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════ RESULTADO ════ */}
        {estado==='resultado' && (
          <div style={{ width:'100%', animation:'aparecer .4s ease both' }}>
            <div style={{ fontSize:'4rem', marginBottom:8, animation:'popPuntos .5s cubic-bezier(.34,1.56,.64,1) both' }}>
              {seleccion===ejercicio.correcta?'🎉':'❌'}
            </div>
            <h2 style={{ fontSize:'2rem', fontWeight:900, margin:'0 0 16px', color:seleccion===ejercicio.correcta?'#10b981':'#ef4444' }}>
              {seleccion===ejercicio.correcta?'¡Excelente trabajo!':'Casi lo logras 💪'}
            </h2>

            {seleccion===ejercicio.correcta && modoJuego==='campana' && desglosePuntos && (
              <div style={{ background:esPuntosNuevos?'rgba(16,185,129,.07)':'rgba(255,255,255,.03)', border:esPuntosNuevos?'1px solid rgba(16,185,129,.2)':'1px solid rgba(255,255,255,.07)', borderRadius:18, padding:'16px 24px', marginBottom:14 }}>
                {esPuntosNuevos ? (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,.5)', fontWeight:700 }}>{desglosePuntos.labelVelocidad}</span>
                      <span style={{ fontSize:20, fontWeight:900, color:'#38bdf8' }}>+{desglosePuntos.base}</span>
                    </div>
                    {desglosePuntos.bonus>0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                        <span style={{ fontSize:13, color:'#fbbf24', fontWeight:700 }}>{desglosePuntos.razonBonus}</span>
                        <span style={{ fontSize:20, fontWeight:900, color:'#fbbf24' }}>+{desglosePuntos.bonus}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, position:'relative' }}>
                      <div>
                        <span style={{ fontSize:13, color:'rgba(255,255,255,.45)', fontWeight:700 }}>Puntos agregados</span>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.25)', marginTop:2 }}>→ suben al contador 🏆</div>
                      </div>
                      <div style={{ position:'relative' }}>
                        <span style={{ fontSize:30, fontWeight:900, color:'#10b981', textShadow:'0 0 18px rgba(16,185,129,.6)', animation:'popPuntos .5s cubic-bezier(.34,1.56,.64,1) both' }}>+{desglosePuntos.totalAgregado}</span>
                        <span style={{ position:'absolute', top:0, right:0, fontSize:14, fontWeight:900, color:'#10b981', animation:'volarAlHeader 1.4s ease .4s forwards', opacity:0, whiteSpace:'nowrap' }}>+{desglosePuntos.totalAgregado} ↑</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ margin:0, color:'#94a3b8', fontWeight:700, fontSize:14 }}>{mensajeResultado}</p>
                )}
              </div>
            )}

            {seleccion!==ejercicio.correcta && (
              <div style={{ background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.18)', borderRadius:16, padding:'14px 24px', marginBottom:14 }}>
                <p style={{ color:'rgba(255,255,255,.4)', fontWeight:700, margin:'0 0 4px', fontSize:13 }}>La respuesta correcta era:</p>
                <span style={{ fontSize:'2.8rem', fontWeight:900, color:'white' }}>{ejercicio.correcta?.toLocaleString('en-US')}</span>
              </div>
            )}

            <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
              {modoJuego==='campana'?(
                <>
                  <button onClick={()=>irA('mapa-ejercicios')} style={S.btnSecundario}>← Volver al Mapa</button>
                  {seleccion===ejercicio.correcta && ejercicioSeleccionado<30?(
                    <button onClick={irASiguienteReto} style={S.btnPrimario}>Siguiente Reto →</button>
                  ):(
                    <button onClick={()=>irA('seleccion-velocidad')} style={S.btnPrimario}>🔁 Reintentar</button>
                  )}
                </>
              ):(
                <>
                  <button onClick={()=>irA('clasico-mapa')} style={S.btnSecundario}>Volver al Mapa</button>
                  <button onClick={()=>irA('clasico-config')} style={S.btnSecundario}>Ajustar</button>
                  {seleccion===ejercicio.correcta && ejercicioSeleccionado<30 ? (
                    <button onClick={()=>{ setEjercicioSeleccionado(e=>e+1); irA('clasico-config'); }} style={S.btnPrimario}>Siguiente Reto</button>
                  ) : (
                    <button onClick={()=>iniciarClasico(false)} style={S.btnPrimario}>Practicar de Nuevo</button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes aparecer    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight  { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes zoomIn      { from{transform:scale(.35);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes popPuntos   { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        @keyframes popTotal    { 0%{transform:scale(.7);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes latido      { from{transform:scale(1)} to{transform:scale(1.1)} }
        @keyframes brillar     { 0%,100%{box-shadow:0 0 8px rgba(245,158,11,.35)} 50%{box-shadow:0 0 24px rgba(245,158,11,.75)} }
        @keyframes flashBg     { 0%{opacity:0} 20%{opacity:1} 100%{opacity:0} }
        @keyframes confetiFall { 0%{transform:translateY(0) rotate(0) scale(1);opacity:1} 100%{transform:translateY(110vh) rotate(540deg) scale(.5);opacity:0} }
        @keyframes flechaFlash { from{opacity:.5;transform:translateX(0)} to{opacity:1;transform:translateX(4px)} }
        @keyframes subirPuntos { 0%{opacity:0;transform:translateY(0)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-60px)} }
        @keyframes volarAlHeader{ 0%{opacity:0;transform:translate(0,0) scale(1)} 20%{opacity:1} 100%{opacity:0;transform:translate(200px,-200px) scale(.4)} }
        * { box-sizing:border-box; }
        .flash-card { overflow-y:auto; max-height:calc(100vh - 96px); }
        .flash-card button { min-height:44px; }
        .flash-exercise-grid button { min-width:0; }
        
        .ocultar-scroll::-webkit-scrollbar { height: 6px; }
        .ocultar-scroll::-webkit-scrollbar-track { background: transparent; }
        .ocultar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .ocultar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }

        @media(max-width:900px){
          .flash-page{padding:14px!important; overflow:auto!important; align-items:stretch!important}
          .flash-card{ max-width:100%!important; min-height:calc(100vh - 28px)!important; max-height:none!important; margin-top:0!important; padding:58px 22px 28px!important; border-radius:22px!important; }
          .flash-mode-grid{grid-template-columns:1fr!important}
          .flash-level-list{max-width:100%!important}
          .flash-exercise-grid{grid-template-columns:repeat(5,1fr)!important; gap:8px!important}
        }
        @media(max-width:600px){
          .flash-page{padding:0!important}
          .flash-card{ min-height:100vh!important; border-radius:0!important; border:none!important; padding:58px 16px 24px!important; }
          div[style*="repeat(3,1fr)"]{grid-template-columns:1fr!important}
          div[style*="1fr 1fr"]{grid-template-columns:1fr!important}
          div[style*="repeat(6,1fr)"]{grid-template-columns:repeat(5,1fr)!important}
          .flash-exercise-grid{grid-template-columns:repeat(5,1fr)!important}
          h1[style], h2[style]{font-size:1.55rem!important}
        }
        @media(max-width:380px){
          .flash-exercise-grid{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>
    </div>
  );
}

const S = {
  titulo:       { fontSize:'2.1rem', color:'white', fontWeight:900, margin:'0 0 8px', letterSpacing:'-.01em' },
  subtitulo:    { color:'rgba(255,255,255,.42)', fontSize:15, fontWeight:600, margin:'0 0 22px' },
  volver:       { background:'none', border:'none', color:'#38bdf8', fontSize:14, fontWeight:700, cursor:'pointer', position:'absolute', top:20, left:20, fontFamily:'inherit' },
  bloque:       { background:'rgba(255,255,255,.04)', padding:18, borderRadius:16, marginBottom:14, textAlign:'left', border:'1px solid rgba(255,255,255,.07)' },
  h4:           { color:'white', fontSize:'.95rem', margin:'0 0 12px', fontWeight:700 },
  btnOp:        { flex:1, padding:'10px 8px', background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.55)', border:'2px solid rgba(255,255,255,.08)', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit', transition:'all .18s', minWidth:80 },
  btnOpActiva:  { background:'rgba(59,130,246,.28)', borderColor:'#3b82f6', color:'white' },
  btnPrimario:  { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'white', padding:'14px 28px', borderRadius:16, border:'none', fontSize:'1rem', fontWeight:800, cursor:'pointer', boxShadow:'0 8px 20px rgba(59,130,246,.3)', fontFamily:'inherit', transition:'all .2s' },
  btnSecundario:{ background:'rgba(255,255,255,.07)', color:'white', padding:'14px 28px', borderRadius:16, border:'1px solid rgba(255,255,255,.1)', fontSize:'1rem', fontWeight:800, cursor:'pointer', fontFamily:'inherit', transition:'all .2s' },
  btnVolver2:   { background:'none', border:'2px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.45)', padding:'10px 26px', borderRadius:14, cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit', transition:'all .2s' },
};