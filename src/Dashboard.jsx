import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5005'
  : `http://${window.location.hostname}:5005`;

const AVATARS = ['🦁', '🐼', '🦊', '🦋', '🐬', '🦄', '🐸', '🦖', '🌟', '🚀'];

// ─── Podio top 3 ─────────────────────────────────────────────────────────────
const Podio = ({ top3, esMio }) => {
  const orden = [top3[1], top3[0], top3[2]]; // 2°, 1°, 3°
  const alturas = [140, 180, 110];
  const medallas = ['🥈', '🥇', '🥉'];
  const posiciones = [2, 1, 3];
  const colores = ['#94a3b8', '#fbbf24', '#cd7c2f'];
  const brillos = [
    '0 0 20px rgba(148,163,184,.4)',
    '0 0 30px rgba(251,191,36,.5)',
    '0 0 20px rgba(205,124,47,.4)',
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      gap: 12, padding: '0 20px 24px', marginTop: 8,
    }}>
      {orden.map((item, i) => {
        if (!item) return <div key={i} style={{ width: 100 }} />;
        const esMiUsuario = esMio(item);
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, flex: 1, maxWidth: 120,
            animation: `popIn .5s cubic-bezier(.34,1.56,.64,1) ${i * .12}s both`,
          }}>
            {/* Avatar / emoji */}
            <div style={{
              width: i === 1 ? 64 : 52, height: i === 1 ? 64 : 52,
              borderRadius: '50%', fontSize: i === 1 ? '2rem' : '1.6rem',
              background: `${colores[i]}22`,
              border: `2px solid ${colores[i]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: brillos[i],
              outline: esMiUsuario ? '3px solid #00f2fe' : 'none',
              outlineOffset: 2,
            }}>
              {medallas[i]}
            </div>
            {/* Nombre */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                margin: 0, fontSize: 12, fontWeight: 800, color: 'white',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 100,
              }}>
                {(item.estudiante || 'Jugador').split(' ')[0]}
                {esMiUsuario ? ' 👈' : ''}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700 }}>
                Grado {item.grado || '-'}
              </p>
            </div>
            {/* Barra del podio */}
            <div style={{
              width: '100%', height: alturas[i],
              background: `linear-gradient(180deg, ${colores[i]}44 0%, ${colores[i]}18 100%)`,
              border: `1px solid ${colores[i]}55`,
              borderRadius: '12px 12px 0 0',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              boxShadow: brillos[i],
            }}>
              <span style={{ fontSize: i === 1 ? 22 : 18, fontWeight: 900, color: colores[i] }}>
                #{posiciones[i]}
              </span>
              <span style={{ fontSize: 11, fontWeight: 900, color: colores[i] }}>
                {(item.puntos || 0).toLocaleString()}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 700 }}>PTS</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Fila del ranking ─────────────────────────────────────────────────────────
const FilaJugador = ({ item, rank, delay }) => {
  const esMio = item.esMiUsuario;
  const [hover, setHover] = useState(false);

  const { color, icono, bg } =
    rank <= 3  ? { color: '#fbbf24', icono: rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉', bg: 'rgba(251,191,36,.07)' }
    : rank <= 10 ? { color: '#ef4444', icono: '🔥', bg: 'rgba(239,68,68,.06)' }
    : { color: '#38bdf8', icono: '💎', bg: 'rgba(56,189,248,.05)' };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', padding: '13px 18px',
        borderRadius: 16, marginBottom: 8,
        background: esMio
          ? 'linear-gradient(90deg,rgba(0,242,254,.08),rgba(56,189,248,.04))'
          : hover ? `${bg}` : 'rgba(15,23,42,.5)',
        border: esMio ? '1.5px solid rgba(0,242,254,.35)' : `1px solid rgba(255,255,255,.05)`,
        boxShadow: esMio ? '0 0 14px rgba(0,242,254,.1)' : hover ? '0 4px 16px rgba(0,0,0,.25)' : 'none',
        transform: hover ? 'translateX(4px)' : 'translateX(0)',
        transition: 'all .2s ease',
        animation: `slideInRank .35s ease ${delay}s both`,
        cursor: 'default',
        borderLeft: `4px solid ${esMio ? '#00f2fe' : color}`,
      }}
    >
      {/* Posición */}
      <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{rank}</div>
        <div style={{ fontSize: '1rem', marginTop: 2 }}>{icono}</div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, paddingLeft: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <p style={{
            margin: 0, fontSize: '1rem', fontWeight: 800, color: 'white',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.estudiante || 'Jugador'}
          </p>
          {esMio && (
            <span style={{
              fontSize: 10, fontWeight: 800, color: '#00f2fe',
              background: 'rgba(0,242,254,.1)', border: '1px solid rgba(0,242,254,.3)',
              borderRadius: 999, padding: '1px 8px',
            }}>TÚ</span>
          )}
        </div>
        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,.45)', fontWeight: 700,
          background: 'rgba(255,255,255,.07)', padding: '2px 8px', borderRadius: 999,
          display: 'inline-block', marginTop: 3,
        }}>
          Grado {item.grado || '-'}
        </span>
      </div>

      {/* Puntos */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1 }}>
          {(item.puntos || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 800, marginTop: 2, letterSpacing: '.06em' }}>PTS</div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();

  const [usuario] = useState(() => {
    const s = localStorage.getItem('usuarioMate');
    return s ? JSON.parse(s) : null;
  });

  const [tabActiva, setTabActiva] = useState(() =>
    usuario?.categoria?.toLowerCase().includes('mayor') ? 'mayor' : 'menor'
  );

  const [avatarIndex] = useState(() => {
    const id = usuario?.usuarioId || usuario?.id || usuario?.usuarioID;
    const s = localStorage.getItem(`avatar_${id}`);
    return s ? parseInt(s, 10) : 0;
  });

  const [mounted, setMounted] = useState(false);
  const [datosMenor, setDatosMenor] = useState([]);
  const [datosMayor, setDatosMayor] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaActiva, setVistaActiva] = useState('ranking'); // 'podio' | 'ranking'

  useEffect(() => {
    if (!usuario) { navigate('/'); return; }
    cargarDatos();
    setTimeout(() => setMounted(true), 80);
  }, [navigate, usuario]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [rM, rMay] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Puntuaciones/dashboard/primaria%20menor`),
        fetch(`${API_BASE_URL}/api/Puntuaciones/dashboard/primaria%20mayor`),
      ]);
      if (rM.ok)   setDatosMenor(await rM.json().then(d => Array.isArray(d) ? d : []));
      if (rMay.ok) setDatosMayor(await rMay.json().then(d => Array.isArray(d) ? d : []));
    } catch(e) { console.error(e); }
    setCargando(false);
  };

  const lista = useMemo(() => (tabActiva === 'menor' ? datosMenor : datosMayor), [tabActiva, datosMenor, datosMayor]);

  const { miPosicion, misPuntos, rankingFinal } = useMemo(() => {
    if (!usuario) return { miPosicion: '-', misPuntos: 0, rankingFinal: [] };
    const idReal = String(usuario.usuarioId || usuario.id || usuario.usuarioID || '').trim();
    const nombreReal = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim().toLowerCase();
    const miIdx = lista.findIndex(item => {
      const itemId   = String(item?.usuarioId || item?.UsuarioId || item?.id || '').trim();
      const itemNom  = String(item?.estudiante || '').trim().toLowerCase();
      return (idReal && itemId === idReal) || itemNom === nombreReal;
    });
    const puntos = miIdx !== -1 ? Number(lista[miIdx]?.puntos) || 0 : 0;
    return {
      miPosicion:  miIdx !== -1 ? miIdx + 1 : '-',
      misPuntos:   puntos,
      rankingFinal: lista.map((item, idx) => ({ ...item, esMiUsuario: idx === miIdx })),
    };
  }, [lista, usuario]);

  const esMioFn = (item) => {
    const idReal = String(usuario?.usuarioId || usuario?.id || usuario?.usuarioID || '').trim();
    const nomReal = `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim().toLowerCase();
    const itemId  = String(item?.usuarioId || item?.UsuarioId || item?.id || '').trim();
    const itemNom = String(item?.estudiante || '').trim().toLowerCase();
    return (idReal && itemId === idReal) || itemNom === nomReal;
  };

  const top3 = rankingFinal.slice(0, 3);

  if (!usuario) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0c29 0%,#1a1245 50%,#0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Nunito','Segoe UI',sans-serif",
    }}>

      {/* Blobs decorativos */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[
          { c:'#00f2fe', x:'8%',  y:'15%', s:380 },
          { c:'#a855f7', x:'75%', y:'55%', s:320 },
          { c:'#fbbf24', x:'50%', y:'5%',  s:220 },
        ].map((b,i)=>(
          <div key={i} style={{
            position:'absolute', left:b.x, top:b.y,
            width:b.s, height:b.s, borderRadius:'50%',
            background:b.c, opacity:.1, filter:'blur(75px)',
            animation:`blobFloat ${5+i}s ease-in-out infinite alternate`,
          }}/>
        ))}
      </div>

      {/* Tarjeta principal */}
      <div style={{
        maxWidth: 580, width:'100%', zIndex:10,
        background:'rgba(15,23,42,.82)',
        backdropFilter:'blur(24px)',
        borderRadius: 28,
        border:'1px solid rgba(255,255,255,.08)',
        boxShadow:'0 32px 80px rgba(0,0,0,.6), inset 0 0 24px rgba(0,242,254,.03)',
        display:'flex', flexDirection:'column',
        height:'90vh', maxHeight:820,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(.97)',
        transition:'opacity .5s ease, transform .5s cubic-bezier(.34,1.2,.64,1)',
        overflow:'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding:'22px 24px 14px',
          background:'linear-gradient(180deg,rgba(0,242,254,.05) 0%,transparent 100%)',
          borderBottom:'1px solid rgba(255,255,255,.06)',
          flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <button onClick={()=>navigate('/menu')} style={{
              background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)',
              color:'white', fontWeight:700, padding:'8px 16px', borderRadius:12,
              cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,242,254,.15)';e.currentTarget.style.borderColor='rgba(0,242,254,.4)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.borderColor='rgba(255,255,255,.1)';}}
            >← Menú</button>

            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'2rem', filter:'drop-shadow(0 0 10px rgba(251,191,36,.6))' }}>🏆</span>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:900, color:'white', letterSpacing:'-.01em' }}>
                Tabla de Ligas
              </h1>
            </div>

            {/* Toggle podio / lista */}
            <button onClick={()=>setVistaActiva(v=>v==='ranking'?'podio':'ranking')} style={{
              background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)',
              color:'white', fontWeight:700, padding:'8px 14px', borderRadius:12,
              cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(168,85,247,.2)';e.currentTarget.style.borderColor='rgba(168,85,247,.4)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.borderColor='rgba(255,255,255,.1)';}}
            >{vistaActiva==='ranking'?'🏅 Podio':'📋 Lista'}</button>
          </div>

          {/* Tabs */}
          <div style={{
            display:'flex', background:'rgba(0,0,0,.3)', borderRadius:14,
            padding:5, marginTop:16,
          }}>
            {[['menor','📚 Primaria Menor'],['mayor','🎯 Primaria Mayor']].map(([val,label])=>(
              <button key={val} onClick={()=>setTabActiva(val)} style={{
                flex:1, padding:'10px 8px', border:'none',
                background:tabActiva===val?'#00f2fe':'transparent',
                color:tabActiva===val?'#0f0c29':'rgba(255,255,255,.45)',
                fontSize:13, fontWeight:800, borderRadius:10,
                cursor:'pointer', fontFamily:'inherit',
                boxShadow:tabActiva===val?'0 0 16px rgba(0,242,254,.4)':'none',
                transition:'all .3s cubic-bezier(.34,1.2,.64,1)',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── Contenido scrollable ── */}
        <div style={{
          flex:1, overflowY:'auto', padding:'16px 20px',
        }}>
          {cargando ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16 }}>
              <div style={{
                width:40, height:40, borderRadius:'50%',
                border:'3px solid rgba(0,242,254,.2)',
                borderTopColor:'#00f2fe',
                animation:'girar 1s linear infinite',
                boxShadow:'0 0 12px rgba(0,242,254,.4)',
              }}/>
              <p style={{ color:'rgba(255,255,255,.4)', fontWeight:700, fontSize:14 }}>Cargando clasificaciones...</p>
            </div>
          ) : rankingFinal.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
              <span style={{ fontSize:'3rem', opacity:.5, filter:'grayscale(1)' }}>🏆</span>
              <p style={{ color:'rgba(255,255,255,.4)', fontWeight:700, textAlign:'center', fontSize:14, lineHeight:1.6 }}>
                La temporada acaba de empezar.<br/>¡Juega para clasificar!
              </p>
            </div>
          ) : vistaActiva === 'podio' ? (
            <>
              <Podio top3={top3} esMio={esMioFn} />
              {/* Resto del ranking bajo el podio */}
              {rankingFinal.slice(3).map((item, i) => (
                <FilaJugador key={i} item={item} rank={i + 4} delay={i * 0.04} />
              ))}
            </>
          ) : (
            rankingFinal.map((item, i) => (
              <FilaJugador key={i} item={item} rank={i + 1} delay={i * 0.04} />
            ))
          )}
        </div>

        {/* ── Footer Mi posición ── */}
        <div style={{
          background:'linear-gradient(135deg,rgba(0,242,254,.06) 0%,rgba(15,23,42,.95) 100%)',
          borderTop:'1px solid rgba(0,242,254,.18)',
          padding:'16px 22px',
          display:'flex', alignItems:'center', gap:14,
          flexShrink:0,
        }}>
          {/* Avatar */}
          <div style={{
            width:50, height:50, borderRadius:'50%', flexShrink:0,
            background:'rgba(255,255,255,.08)',
            border:'2px solid rgba(0,242,254,.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.7rem',
            boxShadow:'0 0 14px rgba(0,242,254,.2)',
          }}>
            {AVATARS[avatarIndex]}
          </div>

          {/* Info */}
          <div style={{ flex:1, overflow:'hidden' }}>
            <p style={{
              margin:0, fontWeight:800, color:'#00f2fe', fontSize:'1rem',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {usuario.nombre} {usuario.apellido}
            </p>
            <p style={{ margin:'2px 0 0', fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase' }}>
              {tabActiva === 'menor' ? 'Primaria Menor' : 'Primaria Mayor'}
            </p>
          </div>

          {/* Posición y puntos */}
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{
              fontSize: miPosicion === '-' ? '1rem' : '1.8rem',
              fontWeight:900, color:'white', lineHeight:1,
            }}>
              {miPosicion === '-' ? 'Sin ranking' : `#${miPosicion}`}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', fontWeight:800, marginTop:3, letterSpacing:'.06em', textTransform:'uppercase' }}>
              {misPuntos.toLocaleString()} pts
            </div>
          </div>

          {/* Botón refrescar */}
          <button onClick={cargarDatos} style={{
            background:'rgba(0,242,254,.1)', border:'1px solid rgba(0,242,254,.25)',
            color:'#00f2fe', borderRadius:12, padding:'8px 12px',
            cursor:'pointer', fontSize:16, lineHeight:1, flexShrink:0,
            fontFamily:'inherit', transition:'all .2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,242,254,.22)';e.currentTarget.style.transform='rotate(45deg)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,242,254,.1)';e.currentTarget.style.transform='rotate(0)';}}
            title="Actualizar"
          >↻</button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes blobFloat  { from{transform:translate(0,0) scale(1)} to{transform:translate(18px,-18px) scale(1.04)} }
        @keyframes girar      { to{transform:rotate(360deg)} }
        @keyframes slideInRank{ from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn      { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }

        /* Scrollbar elegante */
        div::-webkit-scrollbar       { width:5px }
        div::-webkit-scrollbar-track { background:rgba(0,0,0,.1); border-radius:10px }
        div::-webkit-scrollbar-thumb { background:rgba(0,242,254,.25); border-radius:10px }
        div::-webkit-scrollbar-thumb:hover { background:rgba(0,242,254,.5) }

        * { box-sizing:border-box }

        /* ── Responsive tablet ── */
        @media(max-width:768px){
          div[style*="max-width: 580px"]{
            max-width:100% !important;
            height:100vh !important;
            max-height:100vh !important;
            border-radius:0 !important;
            border:none !important;
          }
        }

        /* ── Responsive móvil ── */
        @media(max-width:480px){
          h1[style]{ font-size:1.3rem !important }
        }
      `}</style>
    </div>
  );
}