import { useState, useCallback } from 'react';
import AbacoInteractivo from './AbacoInteractivo';
import { useNavigate } from 'react-router-dom';

// ─── Ícono ábaco SVG ─────────────────────────────────────────────────────────
const AbacoIcon = () => (
  <svg viewBox="0 0 100 100" width="56" height="56" xmlns="http://www.w3.org/2000/svg"
    style={{ borderRadius:14, boxShadow:'0 6px 20px rgba(168,85,247,.4)', flexShrink:0 }}>
    <rect width="100" height="100" rx="14" fill="#2d1b69"/>
    <rect x="8" y="8" width="84" height="84" rx="10" fill="none" stroke="rgba(168,85,247,.4)" strokeWidth="1.5"/>
    {[20,36,52,68,84].map((x,i)=>(
      <line key={i} x1={x} y1="12" x2={x} y2="88"
        stroke="rgba(255,255,255,.2)" strokeWidth="2.5" strokeLinecap="round"/>
    ))}
    <rect x="8" y="44" width="84" height="4" rx="2" fill="rgba(255,255,255,.2)"/>
    {[
      {cx:20,cy:36,fill:'#ef4444'},{cx:36,cy:36,fill:'#f97316'},
      {cx:52,cy:36,fill:'#fbbf24'},{cx:68,cy:36,fill:'#22c55e'},{cx:84,cy:36,fill:'#3b82f6'},
    ].map((p,i)=>(
      <g key={i}>
        <ellipse cx={p.cx} cy={p.cy} rx="7" ry="5.5" fill={p.fill}/>
        <ellipse cx={p.cx-2} cy={p.cy-1.5} rx="2" ry="1.5" fill="rgba(255,255,255,.3)"/>
      </g>
    ))}
    {[
      {cx:20,cy:56,fill:'#ef4444'},{cx:20,cy:68,fill:'#ef4444'},
      {cx:36,cy:56,fill:'#f97316'},{cx:36,cy:68,fill:'#f97316'},
      {cx:52,cy:56,fill:'#fbbf24'},{cx:68,cy:68,fill:'#22c55e'},
      {cx:84,cy:56,fill:'#3b82f6'},{cx:84,cy:68,fill:'#3b82f6'},
    ].map((p,i)=>(
      <g key={i}>
        <ellipse cx={p.cx} cy={p.cy} rx="7" ry="5.5" fill={p.fill}/>
        <ellipse cx={p.cx-2} cy={p.cy-1.5} rx="2" ry="1.5" fill="rgba(255,255,255,.3)"/>
      </g>
    ))}
  </svg>
);

// ─── LECCIONES ────────────────────────────────────────────────────────────────
const LECCIONES = [
  // ── MÓDULO 1: Introducción ───────────────────────────────────────────────
  {
    id:1, modulo:'Introducción', tipo:'info',
    titulo:'¿Qué es el Soroban?',
    icono:'🧮',
    color:'#a855f7',
    puntos:[
      { emoji:'🏯', texto:'El Soroban es el ábaco japonés, usado por más de 400 años para hacer cálculos increíblemente rápidos.' },
      { emoji:'🧠', texto:'Al moverlo, entrenas tu memoria visual y conectas tus dedos con tu cerebro para calcular sin papel.' },
      { emoji:'⚡', texto:'Los campeones mundiales resuelven sumas de 15 números en menos de 2 segundos. ¡Tú también puedes!' },
    ],
    columnasActivas:[12],
  },
  {
    id:2, modulo:'Introducción', tipo:'info',
    titulo:'Partes del Ábaco',
    icono:'🔍',
    color:'#a855f7',
    puntos:[
      { emoji:'📏', texto:'La barra horizontal en el CENTRO se llama "La Tierra". Es la línea más importante de todo el ábaco.' },
      { emoji:'⬆️', texto:'ZONA SUPERIOR: Hay 1 cuenta por varilla. ¡Esa cuenta solitaria vale 5!' },
      { emoji:'⬇️', texto:'ZONA INFERIOR: Hay 4 cuentas por varilla. Cada una vale 1.' },
      { emoji:'✅', texto:'REGLA DE ORO: Una cuenta SOLO tiene valor cuando está TOCANDO "La Tierra". Si está lejos, no cuenta.' },
    ],
    columnasActivas:[12],
  },
  {
    id:3, modulo:'Introducción', tipo:'info',
    titulo:'La Técnica de los Dedos',
    icono:'👆',
    color:'#a855f7',
    puntos:[
      { emoji:'👍', texto:'EL PULGAR: Solo empuja cuentas de abajo hacia ARRIBA (hacia La Tierra). Es "el levantador".' },
      { emoji:'👇', texto:'EL ÍNDICE: Jala cuentas de abajo hacia ABAJO, y también maneja la cuenta de arriba (el 5).' },
      { emoji:'🚫', texto:'NUNCA uses otros dedos. La velocidad viene de usar siempre los mismos dedos en los mismos movimientos.' },
      { emoji:'🎯', texto:'Practica despacio al inicio. La velocidad llegará sola cuando tus dedos memoricen los movimientos.' },
    ],
    columnasActivas:[12],
  },

  // ── MÓDULO 2: Unidades ───────────────────────────────────────────────────
  {
    id:4, modulo:'Unidades (1-9)', tipo:'info',
    titulo:'La Columna de Unidades',
    icono:'1️⃣',
    color:'#3b82f6',
    puntos:[
      { emoji:'📍', texto:'La columna de la DERECHA se llama "U" (Unidades). Aquí formarás los números del 1 al 9.' },
      { emoji:'⬇️', texto:'Las 4 cuentas de abajo valen 1, 2, 3 y 4 (una por una que vayas subiendo).' },
      { emoji:'🔵', texto:'La cuenta de arriba vale 5. Bájala y obtienes el 5 instantáneamente.' },
      { emoji:'💡', texto:'Para hacer el 7: baja el 5 (cuenta de arriba) + sube 2 cuentas de abajo. ¡5+2=7!' },
    ],
    columnasActivas:[12],
  },
  {
    id:5, modulo:'Unidades (1-9)', tipo:'libre',
    titulo:'Explora Libremente',
    icono:'🎮',
    color:'#3b82f6',
    instrucciones:'Toca las cuentas en la columna encendida y observa cómo cambia el número en el marcador. Intenta formar el 1, el 5 y el 9.',
    columnasActivas:[12],
  },
  {
    id:6, modulo:'Unidades (1-9)', tipo:'interactivo',
    titulo:'Reto: Forma el 5',
    icono:'🎯',
    color:'#10b981',
    instrucciones:'Baja la cuenta superior (la que está sola arriba). Esa cuenta vale exactamente 5. ¡Un solo movimiento!',
    objetivo:5,
    columnasActivas:[12],
  },
  {
    id:7, modulo:'Unidades (1-9)', tipo:'interactivo',
    titulo:'Reto: Forma el 3',
    icono:'🎯',
    color:'#10b981',
    instrucciones:'Sube 3 cuentas desde abajo usando el pulgar. Recuerda: cada cuenta de abajo vale 1.',
    objetivo:3,
    columnasActivas:[12],
  },
  {
    id:8, modulo:'Unidades (1-9)', tipo:'interactivo',
    titulo:'Reto: Forma el 7',
    icono:'🏆',
    color:'#fbbf24',
    instrucciones:'Usa la PINZA: baja el 5 con el índice Y sube 2 cuentas con el pulgar al mismo tiempo. ¡5+2=7!',
    objetivo:7,
    columnasActivas:[12],
  },
  {
    id:9, modulo:'Unidades (1-9)', tipo:'interactivo',
    titulo:'Reto Final: Forma el 9',
    icono:'🏆',
    color:'#fbbf24',
    instrucciones:'El número más grande de la columna. Baja el 5 + sube 4 cuentas de abajo. Debes mover 5 cuentas en total.',
    objetivo:9,
    columnasActivas:[12],
  },

  // ── MÓDULO 3: Decenas ────────────────────────────────────────────────────
  {
    id:10, modulo:'Decenas (10-99)', tipo:'info',
    titulo:'Salto a las Decenas',
    icono:'🔟',
    color:'#f97316',
    puntos:[
      { emoji:'➡️', texto:'Ahora activamos la columna "D" (Decenas), justo a la izquierda de Unidades.' },
      { emoji:'💰', texto:'En Decenas todo vale por diez: las cuentas de abajo valen 10, 20, 30, 40 y la de arriba vale 50.' },
      { emoji:'🧩', texto:'Para leer el ábaco, sumas ambas columnas. D vale algo y U vale algo. El total es tu número.' },
      { emoji:'📖', texto:'Ejemplo: Si en D tienes 30 y en U tienes 6, el ábaco muestra el número 36.' },
    ],
    columnasActivas:[11,12],
  },
  {
    id:11, modulo:'Decenas (10-99)', tipo:'libre',
    titulo:'Explora con Dos Columnas',
    icono:'🎮',
    color:'#f97316',
    instrucciones:'Mueve cuentas en la columna D y en la columna U. Observa cómo el marcador combina ambos valores. Intenta formar el número 35.',
    columnasActivas:[11,12],
  },
  {
    id:12, modulo:'Decenas (10-99)', tipo:'interactivo',
    titulo:'Reto: Forma el 52',
    icono:'🎯',
    color:'#10b981',
    instrucciones:'En la columna D: baja la cuenta del 50. En la columna U: sube 2 cuentas. ¡50 + 2 = 52!',
    objetivo:52,
    columnasActivas:[11,12],
  },
  {
    id:13, modulo:'Decenas (10-99)', tipo:'interactivo',
    titulo:'Reto: Forma el 78',
    icono:'🏆',
    color:'#fbbf24',
    instrucciones:'Piensa: 78 = 70 + 8. En D forma el 70 (50+20). En U forma el 8 (5+3). ¡Tú puedes!',
    objetivo:78,
    columnasActivas:[11,12],
  },

  // ── MÓDULO 4: Centenas ───────────────────────────────────────────────────
  {
    id:14, modulo:'Centenas (100-999)', tipo:'info',
    titulo:'Las Centenas',
    icono:'💯',
    color:'#ec4899',
    puntos:[
      { emoji:'🗼', texto:'Activamos la columna "C" (Centenas). Se lee igual que antes, pero todo vale por cien.' },
      { emoji:'💎', texto:'Las cuentas de abajo de la columna C valen: 100, 200, 300 y 400.' },
      { emoji:'⭐', texto:'La cuenta de arriba de la columna C vale: 500.' },
      { emoji:'🔢', texto:'Ejemplo de 3 columnas: C=300, D=40, U=7 → el ábaco muestra 347.' },
    ],
    columnasActivas:[10,11,12],
  },
  {
    id:15, modulo:'Centenas (100-999)', tipo:'libre',
    titulo:'Tres Columnas Activas',
    icono:'🎮',
    color:'#ec4899',
    instrucciones:'Ya tienes C, D y U activas. Prueba formar el 500 bajando la cuenta de arriba en la columna C. Luego intenta el 365.',
    columnasActivas:[10,11,12],
  },
  {
    id:16, modulo:'Centenas (100-999)', tipo:'interactivo',
    titulo:'Reto: Forma el 245',
    icono:'🎯',
    color:'#10b981',
    instrucciones:'245 = 200 + 40 + 5. Forma el 200 en C, el 40 en D y el 5 en U. ¡Tres columnas a la vez!',
    objetivo:245,
    columnasActivas:[10,11,12],
  },

  // ── MÓDULO 5: Miles y más ────────────────────────────────────────────────
  {
    id:17, modulo:'Miles y más', tipo:'info',
    titulo:'Unidades de Millar',
    icono:'🏦',
    color:'#14b8a6',
    puntos:[
      { emoji:'💸', texto:'La columna "UM" (Unidades de Millar) está a la izquierda de Centenas.' },
      { emoji:'🔢', texto:'Las cuentas de abajo valen: 1,000 — 2,000 — 3,000 — 4,000.' },
      { emoji:'💰', texto:'La cuenta de arriba vale: 5,000.' },
      { emoji:'🧮', texto:'Ahora puedes representar números hasta el 9,999 con 4 columnas activas.' },
    ],
    columnasActivas:[9,10,11,12],
  },
  {
    id:18, modulo:'Miles y más', tipo:'info',
    titulo:'Decenas de Millar',
    icono:'🌟',
    color:'#14b8a6',
    puntos:[
      { emoji:'🚀', texto:'La columna "DM" (Decenas de Millar) multiplica todo por 10,000.' },
      { emoji:'💎', texto:'Las cuentas de abajo valen: 10,000 — 20,000 — 30,000 — 40,000.' },
      { emoji:'👑', texto:'La cuenta de arriba vale la impresionante cantidad de 50,000.' },
      { emoji:'📊', texto:'Con 5 columnas ya puedes representar hasta el 99,999.' },
    ],
    columnasActivas:[8,9,10,11,12],
  },
  {
    id:19, modulo:'Miles y más', tipo:'info',
    titulo:'Centenas de Millar',
    icono:'🌈',
    color:'#14b8a6',
    puntos:[
      { emoji:'🏔️', texto:'La última columna "CM" (Centenas de Millar). ¡Números gigantescos!' },
      { emoji:'💸', texto:'Las cuentas de abajo valen: 100,000 — 200,000 — 300,000 — 400,000.' },
      { emoji:'🌠', texto:'La cuenta de arriba vale: 500,000.' },
      { emoji:'🎓', texto:'Con las 6 columnas activas puedes representar hasta 999,999. ¡Eso es casi un millón!' },
    ],
    columnasActivas:[7,8,9,10,11,12],
  },
  {
    id:20, modulo:'Miles y más', tipo:'libre',
    titulo:'¡Maestro del Soroban!',
    icono:'🎓',
    color:'#fbbf24',
    instrucciones:'¡Todas las columnas están activas! Explora libremente. Intenta construir el número 123,456 o tu número favorito. Observa cómo el marcador lo lee automáticamente.',
    columnasActivas:[7,8,9,10,11,12],
  },
];

// Agrupar lecciones por módulo para la barra de progreso
const MODULOS = [...new Set(LECCIONES.map(l=>l.modulo))];

// ─── BARRA DE PROGRESO SUPERIOR ───────────────────────────────────────────────
const BarraProgreso = ({ leccionActual }) => {
  const total = LECCIONES.length;
  const pct = Math.round(((leccionActual+1)/total)*100);
  return (
    <div style={{ width:'100%', marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:5, fontWeight:700 }}>
        <span>Paso {leccionActual+1} de {total}</span>
        <span>{pct}% completado</span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,.07)', borderRadius:999, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:999, transition:'width .5s ease',
          background:'linear-gradient(90deg,#a855f7,#3b82f6)',
          width:`${pct}%`,
          boxShadow:'0 0 10px rgba(168,85,247,.5)',
        }}/>
      </div>
      {/* Módulos como hitos */}
      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
        {MODULOS.map((mod,i) => {
          const leccionesMod = LECCIONES.filter(l=>l.modulo===mod);
          const primeraIdx   = LECCIONES.findIndex(l=>l.modulo===mod);
          const completado   = leccionActual >= primeraIdx + leccionesMod.length;
          const activo       = leccionActual >= primeraIdx && leccionActual < primeraIdx + leccionesMod.length;
          return (
            <div key={mod} style={{
              fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:999,
              background: completado ? 'rgba(16,185,129,.2)'
                : activo ? 'rgba(168,85,247,.25)' : 'rgba(255,255,255,.05)',
              color: completado ? '#10b981' : activo ? '#c084fc' : 'rgba(255,255,255,.25)',
              border: activo ? '1px solid rgba(168,85,247,.4)' : '1px solid transparent',
              transition:'all .3s',
            }}>
              {completado ? '✓ ' : activo ? '▶ ' : ''}{mod}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── BADGE DE TIPO ────────────────────────────────────────────────────────────
const BadgeTipo = ({ tipo }) => {
  const cfg = {
    info:         { label:'Explicación', color:'#a855f7', bg:'rgba(168,85,247,.15)' },
    interactivo:  { label:'Reto interactivo', color:'#10b981', bg:'rgba(16,185,129,.15)' },
    libre:        { label:'Práctica libre', color:'#3b82f6', bg:'rgba(59,130,246,.15)' },
  }[tipo] || {};
  return (
    <span style={{ fontSize:11, fontWeight:800, padding:'3px 12px', borderRadius:999, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.color}44`, letterSpacing:'.04em', textTransform:'uppercase' }}>
      {cfg.label}
    </span>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ModuloAprendizaje() {
  const [leccionActual, setLeccionActual] = useState(0);
  const [completado, setCompletado]       = useState(false);
  const [valorEnAbaco, setValorEnAbaco]   = useState(0);
  const [animEntrada, setAnimEntrada]     = useState(true);
  const navigate = useNavigate();

  const leccion = LECCIONES[leccionActual];

  const manejarCambioValor = useCallback((valor) => {
    setValorEnAbaco(valor);
    if (leccion.tipo === 'interactivo' && valor === leccion.objetivo) {
      setCompletado(true);
    } else {
      setCompletado(false);
    }
  }, [leccion]);

  const siguienteLeccion = () => {
    setAnimEntrada(false);
    setTimeout(() => {
      if (leccionActual < LECCIONES.length - 1) {
        setLeccionActual(prev => prev + 1);
        setCompletado(false);
        setValorEnAbaco(0);
        setAnimEntrada(true);
      } else {
        const usuario = JSON.parse(localStorage.getItem('usuarioMate') || '{}');
        usuario.tieneMedalla = true;
        localStorage.setItem('usuarioMate', JSON.stringify(usuario));
        navigate('/menu');
      }
    }, 200);
  };

  const anteriorLeccion = () => {
    if (leccionActual > 0) {
      setAnimEntrada(false);
      setTimeout(() => {
        setLeccionActual(prev => prev - 1);
        setCompletado(false);
        setValorEnAbaco(0);
        setAnimEntrada(true);
      }, 200);
    }
  };

  const esUltima = leccionActual === LECCIONES.length - 1;

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0f0c29 0%,#1a1245 50%,#0f172a 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'16px', position:'relative', overflow:'hidden',
      fontFamily:"'Nunito','Segoe UI',sans-serif",
    }}>

      {/* Blobs */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[{ c:'#a855f7',x:'8%',y:'15%',s:380 },{ c:'#3b82f6',x:'78%',y:'55%',s:320 },{ c:leccion.color||'#10b981',x:'50%',y:'5%',s:200 }].map((b,i)=>(
          <div key={i} style={{ position:'absolute', left:b.x, top:b.y, width:b.s, height:b.s, borderRadius:'50%', background:b.c, opacity:.1, filter:'blur(70px)', animation:`blobFloat ${5+i}s ease-in-out infinite alternate` }}/>
        ))}
      </div>

      {/* Contenedor principal */}
      <div style={{
        display:'flex', flexDirection:'row', gap:0,
        background:'rgba(15,23,42,.85)', backdropFilter:'blur(24px)',
        borderRadius:28, border:'1px solid rgba(255,255,255,.08)',
        boxShadow:'0 32px 80px rgba(0,0,0,.6)',
        maxWidth:1400, width:'100%', minHeight:680,
        position:'relative', zIndex:10, overflow:'hidden',
      }}>

        {/* ── COLUMNA IZQUIERDA: Texto ── */}
        <div style={{
          flex:'0 0 38%', padding:'36px 40px',
          background:'rgba(10,15,30,.5)',
          borderRight:'1px solid rgba(255,255,255,.06)',
          display:'flex', flexDirection:'column',
        }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <AbacoIcon/>
              <div>
                <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,.35)', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>Módulo de Aprendizaje</p>
                <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:700 }}>{leccion.modulo}</p>
              </div>
            </div>
            <button onClick={()=>navigate('/menu')} style={{
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
              color:'rgba(255,255,255,.5)', width:36, height:36, borderRadius:'50%',
              cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all .2s', flexShrink:0,
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.2)';e.currentTarget.style.borderColor='rgba(239,68,68,.4)';e.currentTarget.style.color='#ef4444';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.06)';e.currentTarget.style.borderColor='rgba(255,255,255,.1)';e.currentTarget.style.color='rgba(255,255,255,.5)';}}
            >✕</button>
          </div>

          {/* Barra de progreso */}
          <BarraProgreso leccionActual={leccionActual}/>

          {/* Contenido de la lección */}
          <div style={{
            flex:1, display:'flex', flexDirection:'column',
            opacity: animEntrada ? 1 : 0,
            transform: animEntrada ? 'translateY(0)' : 'translateY(8px)',
            transition:'opacity .25s ease, transform .25s ease',
          }}>
            {/* Tipo + icono + título */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <span style={{ fontSize:'2.2rem' }}>{leccion.icono}</span>
              <BadgeTipo tipo={leccion.tipo}/>
            </div>
            <h2 style={{ margin:'0 0 18px', fontSize:'1.8rem', fontWeight:900, color:'white', lineHeight:1.2, letterSpacing:'-.01em' }}>
              {leccion.titulo}
            </h2>

            {/* Info: puntos explicativos */}
            {leccion.tipo === 'info' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12, flex:1 }}>
                {leccion.puntos.map((p,i) => (
                  <div key={i} style={{
                    display:'flex', gap:14, alignItems:'flex-start',
                    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)',
                    borderRadius:16, padding:'12px 16px',
                    animation:`slideIn .3s ease ${i*0.08}s both`,
                    borderLeft:`3px solid ${leccion.color}`,
                  }}>
                    <span style={{ fontSize:'1.4rem', flexShrink:0, marginTop:1 }}>{p.emoji}</span>
                    <p style={{ margin:0, fontSize:14, color:'rgba(255,255,255,.78)', fontWeight:600, lineHeight:1.55 }}>{p.texto}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Libre / Interactivo: instrucciones */}
            {(leccion.tipo === 'libre' || leccion.tipo === 'interactivo') && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{
                  background:`${leccion.color || '#3b82f6'}18`,
                  border:`1px solid ${leccion.color || '#3b82f6'}44`,
                  borderRadius:18, padding:'18px 20px',
                }}>
                  <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:800, color:leccion.color||'#38bdf8', letterSpacing:'.06em', textTransform:'uppercase' }}>
                    {leccion.tipo==='interactivo' ? '🎯 Tu misión' : '🎮 Instrucciones'}
                  </p>
                  <p style={{ margin:0, fontSize:14, color:'rgba(255,255,255,.82)', fontWeight:700, lineHeight:1.6 }}>
                    {leccion.instrucciones}
                  </p>
                </div>

                {/* Objetivo interactivo */}
                {leccion.tipo==='interactivo' && (
                  <div style={{
                    background: completado ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.08)',
                    border: `2px ${completado?'solid':'dashed'} ${completado?'rgba(16,185,129,.5)':'rgba(239,68,68,.35)'}`,
                    borderRadius:18, padding:'20px 24px',
                    textAlign:'center', transition:'all .4s ease',
                  }}>
                    {completado ? (
                      <>
                        <p style={{ margin:0, fontSize:'2rem' }}>🎉</p>
                        <p style={{ margin:'4px 0 0', fontSize:16, fontWeight:900, color:'#10b981' }}>¡Perfecto! Formaste el {leccion.objetivo}</p>
                      </>
                    ) : (
                      <>
                        <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em' }}>Forma este número:</p>
                        <p style={{ margin:0, fontSize:'3rem', fontWeight:900, color:'#f87171', textShadow:'0 0 20px rgba(248,113,113,.4)' }}>
                          {leccion.objetivo?.toLocaleString()}
                        </p>
                        <p style={{ margin:'4px 0 0', fontSize:12, color:'rgba(255,255,255,.3)', fontWeight:600 }}>
                          Valor actual en el ábaco: <span style={{ color:'white', fontWeight:800 }}>{valorEnAbaco.toLocaleString()}</span>
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Valor actual (modo libre) */}
                {leccion.tipo==='libre' && (
                  <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'14px 20px', textAlign:'center' }}>
                    <p style={{ margin:'0 0 2px', fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.06em', textTransform:'uppercase' }}>Valor en el ábaco</p>
                    <p style={{ margin:0, fontSize:'2.4rem', fontWeight:900, color:'white', textShadow:'0 0 20px rgba(255,255,255,.15)' }}>
                      {valorEnAbaco.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de navegación */}
          <div style={{ display:'flex', gap:10, marginTop:20, flexShrink:0 }}>
            {leccionActual > 0 && (
              <button onClick={anteriorLeccion} style={{
                flex:1, padding:'13px', borderRadius:14, border:'1px solid rgba(255,255,255,.1)',
                background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.6)',
                fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .2s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.12)';e.currentTarget.style.color='white';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.06)';e.currentTarget.style.color='rgba(255,255,255,.6)';}}
              >← Anterior</button>
            )}
            <button onClick={siguienteLeccion}
              disabled={leccion.tipo==='interactivo' && !completado}
              style={{
                flex:2, padding:'14px', borderRadius:14, border:'none',
                background: leccion.tipo==='interactivo' && !completado
                  ? 'rgba(255,255,255,.06)'
                  : esUltima
                    ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                    : `linear-gradient(135deg,${leccion.color||'#a855f7'},${leccion.color||'#7c3aed'})`,
                color: leccion.tipo==='interactivo' && !completado ? 'rgba(255,255,255,.3)' : 'white',
                fontSize:15, fontWeight:900, cursor: leccion.tipo==='interactivo' && !completado ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', transition:'all .25s',
                boxShadow: leccion.tipo==='interactivo' && !completado ? 'none'
                  : esUltima ? '0 8px 20px rgba(251,191,36,.4)'
                  : `0 8px 20px ${leccion.color||'#a855f7'}44`,
              }}
              onMouseEnter={e=>{ if(!(leccion.tipo==='interactivo'&&!completado)){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.filter='brightness(1.1)'; }}}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.filter='none'; }}
            >
              {leccion.tipo==='interactivo' && !completado ? '🔒 Completa el reto primero'
                : esUltima ? '🎓 ¡Finalizar y ganar medalla!'
                : leccion.tipo==='interactivo' && completado ? '¡Correcto! Siguiente →'
                : 'Entendido, continuar →'}
            </button>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Ábaco ── */}
        <div style={{
          flex:1, padding:'36px 32px',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          background:'rgba(5,10,25,.3)',
          position:'relative',
        }}>
          {/* Badge del módulo actual */}
          <div style={{
            position:'absolute', top:24, left:24,
            display:'flex', alignItems:'center', gap:8,
            background:`${leccion.color||'#a855f7'}20`,
            border:`1px solid ${leccion.color||'#a855f7'}40`,
            borderRadius:999, padding:'5px 14px',
          }}>
            <span style={{ fontSize:14 }}>{leccion.icono}</span>
            <span style={{ fontSize:12, fontWeight:800, color:leccion.color||'#c084fc' }}>{leccion.modulo}</span>
          </div>

          {/* Ábaco interactivo */}
          <div style={{
            opacity: animEntrada ? 1 : 0,
            transform: animEntrada ? 'scale(1)' : 'scale(.97)',
            transition:'opacity .3s ease, transform .3s ease',
          }}>
            <AbacoInteractivo
              key={leccionActual}
              onValueChange={manejarCambioValor}
              animacionActiva={leccion.animacionDedo}
              columnasActivas={leccion.columnasActivas}
            />
          </div>

          {/* Marcador de lectura */}
          <div style={{
            marginTop:32, display:'flex', alignItems:'center', gap:20,
            background:'rgba(0,0,0,.4)', borderRadius:22,
            padding:'18px 36px', border:'1px solid rgba(255,255,255,.08)',
            boxShadow:'0 12px 30px rgba(0,0,0,.3)',
          }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>
                Lectura del ábaco
              </p>
              <p style={{ margin:0, fontSize:'2.8rem', fontWeight:900, color:'white', textShadow:'0 0 20px rgba(255,255,255,.2)', lineHeight:1 }}>
                {valorEnAbaco.toLocaleString()}
              </p>
            </div>
            {leccion.tipo==='interactivo' && leccion.objetivo && (
              <>
                <div style={{ width:1, height:48, background:'rgba(255,255,255,.1)' }}/>
                <div style={{ textAlign:'center' }}>
                  <p style={{ margin:0, fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:4 }}>Objetivo</p>
                  <p style={{ margin:0, fontSize:'2.8rem', fontWeight:900, color: completado ? '#10b981' : '#f87171', textShadow: completado ? '0 0 20px rgba(16,185,129,.4)' : '0 0 20px rgba(248,113,113,.4)', lineHeight:1 }}>
                    {leccion.objetivo.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Mensaje de completado */}
          {completado && (
            <div style={{
              marginTop:16, display:'flex', alignItems:'center', gap:10,
              background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.35)',
              borderRadius:16, padding:'12px 24px',
              animation:'aparecer .4s cubic-bezier(.34,1.56,.64,1) both',
            }}>
              <span style={{ fontSize:'1.5rem' }}>✅</span>
              <p style={{ margin:0, fontSize:14, fontWeight:800, color:'#34d399' }}>
                ¡Excelente! Formaste el número correcto. Presiona "Siguiente" para continuar.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes blobFloat { from{transform:translate(0,0) scale(1)} to{transform:translate(18px,-18px) scale(1.04)} }
        @keyframes slideIn   { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes aparecer  { from{opacity:0;transform:translateY(10px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        * { box-sizing:border-box; }

        /* ── Tablet ── */
        @media(max-width:900px){
          div[style*="flex-direction: row"]{flex-direction:column!important}
          div[style*="flex: 0 0 38%"]{flex:none!important;width:100%!important;padding:24px 20px!important;border-right:none!important;border-bottom:1px solid rgba(255,255,255,.06)!important}
          div[style*="flex: 1"][style*="padding: 36px 32px"]{padding:24px 16px!important}
        }

        /* ── Móvil ── */
        @media(max-width:480px){
          h2[style]{font-size:1.4rem!important}
          div[style*="font-size: 2.8rem"]{font-size:2rem!important}
        }
      `}</style>
    </div>
  );
}