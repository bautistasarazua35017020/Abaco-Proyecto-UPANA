import { useState, useEffect } from 'react';
import './Abaco.css';

export default function AbacoInteractivo({ onValueChange, animacionActiva, columnasActivas = [], valorObjetivo = null }) {
  const [columnas, setColumnas] = useState(() => 
    Array.from({ length: 13 }, () => ({ arriba: false, abajo: 0 }))
  );
  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    let total = 0;
    const multiplicadores = { 12: 1, 11: 10, 10: 100, 9: 1000, 8: 10000, 7: 100000 };
    for (let i = 7; i <= 12; i++) {
      const valorColumna = (columnas[i].arriba ? 5 : 0) + columnas[i].abajo;
      total += valorColumna * multiplicadores[i];
    }
    if (onValueChange) onValueChange(total);
  }, [columnas, onValueChange]);

  const iniciarArrastre = (e, index, esArriba, valorFicha) => {
    e.target.setPointerCapture(e.pointerId);
    setDragState({ startY: e.clientY || e.touches?.[0]?.clientY, index, esArriba, valorFicha });
  };

  const moverArrastre = (e) => {
    if (!dragState) return;
    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const distancia = currentY - dragState.startY;

    if (Math.abs(distancia) > 3) {
      if (!columnasActivas.includes(dragState.index)) {
        setDragState(null); return;
      }
      const nuevasColumnas = [...columnas];
      const col = { ...nuevasColumnas[dragState.index] };

      if (dragState.esArriba) {
        if (distancia > 0 && !col.arriba) col.arriba = true;
        else if (distancia < 0 && col.arriba) col.arriba = false;
      } else {
        if (distancia < 0) col.abajo = Math.max(col.abajo, dragState.valorFicha);
        else if (distancia > 0) col.abajo = Math.min(col.abajo, dragState.valorFicha - 1);
      }
      nuevasColumnas[dragState.index] = col;
      setColumnas(nuevasColumnas);
      setDragState(null);
    }
  };

  const finalizarArrastre = (e) => {
    if (e && e.target && e.target.releasePointerCapture && e.pointerId) {
      try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
    }
    setDragState(null);
  };

  const getEtiqueta = (index) => {
    switch(index) {
      case 12: return { letra: 'U', valor: '1' };
      case 11: return { letra: 'D', valor: '10' };
      case 10: return { letra: 'C', valor: '100' };
      case 9:  return { letra: 'UM', valor: '1k' };
      case 8:  return { letra: 'DM', valor: '10k' };
      case 7:  return { letra: 'CM', valor: '100k' };
      default: return null;
    }
  };

  // ─── LÓGICA DE AYUDA VISUAL (ENTRENADOR) ───
  const getDigitoObjetivo = (val, idx) => {
    if (val === null || val === undefined) return null;
    const colMap = { 12:1, 11:10, 10:100, 9:1000, 8:10000, 7:100000 };
    if (!colMap[idx]) return null;
    return Math.floor(val / colMap[idx]) % 10;
  };

  return (
    <div className="abaco-marco-global">
      <style>{`
        /* Estilos inyectados para las ayudas visuales del entrenador */
        .resaltar-naranja {
          background-color: #f97316 !important;
          box-shadow: 0 0 15px #f97316, inset 0 -3px 5px rgba(0,0,0,0.4) !important;
          border: 1px solid #ffedd5 !important;
        }
        .resaltar-celeste {
          background-color: #38bdf8 !important;
          box-shadow: 0 0 15px #38bdf8, inset 0 -3px 5px rgba(0,0,0,0.4) !important;
          border: 1px solid #e0f2fe !important;
        }
        .hint-mano {
          position: absolute;
          font-size: 2rem;
          z-index: 50;
          pointer-events: none;
          filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5));
        }
        .mano-baja { top: -35px; left: 50%; transform: translateX(-50%); animation: hintBaja 1s ease-in-out infinite; }
        .mano-sube { bottom: -35px; left: 50%; transform: translateX(-50%); animation: hintSube 1s ease-in-out infinite; }
        @keyframes hintBaja { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }
        @keyframes hintSube { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
      `}</style>

      <div className="abaco-madera">
        {columnas.map((col, index) => {
          const esActiva = columnasActivas.includes(index);
          const etiqueta = getEtiqueta(index);

          // Cálculos para saber si esta columna necesita asistencia
          const targetDigit = getDigitoObjetivo(valorObjetivo, index);
          let targetArriba = null, targetAbajo = null;
          if (targetDigit !== null) {
            targetArriba = targetDigit >= 5;
            targetAbajo = targetDigit % 5;
          }

          // ¿La ficha de 5 necesita moverse?
          const ficha5NecesitaMover = targetArriba !== null && col.arriba !== targetArriba;
          const direccion5 = targetArriba ? 'bajar' : 'subir'; 

          // ¿Qué fichas de 1 necesitan moverse?
          const ficha1NecesitaMover = (i) => {
            if (targetAbajo === null) return false;
            // Si hay que subir cuentas (ej: target=3, actual=1 -> hay que subir la 2 y 3)
            if (targetAbajo > col.abajo && i > col.abajo && i <= targetAbajo) return 'subir';
            // Si hay que bajar cuentas (ej: target=1, actual=3 -> hay que bajar la 2 y 3)
            if (targetAbajo < col.abajo && i > targetAbajo && i <= col.abajo) return 'bajar';
            return false;
          };

          return (
            <div 
              key={index} 
              className={`columna-contenedor ${esActiva ? 'columna-activa' : 'columna-inactiva'}`}
              style={{ position: 'relative', overflow: 'visible', opacity: 1, pointerEvents: esActiva ? 'auto' : 'none' }}
            >
              {etiqueta && (
                <div translate="no" className="notranslate" style={{ position: 'absolute', top: '-55px', left: '50%', transform: 'translateX(-50%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: '2px 2px 4px #000', userSelect: 'none', zIndex: 20 }}>
                  <span style={{ fontWeight: '900', fontSize: '1.4rem', lineHeight: '1' }}>{etiqueta.letra}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>{etiqueta.valor}</span>
                </div>
              )}

              <div className="columna">
                {/* FICHA DE 5 */}
                <div 
                  className={`ficha ficha-5 ${col.arriba ? 'activa' : ''} ${ficha5NecesitaMover ? 'resaltar-naranja' : ''}`} 
                  onPointerDown={(e) => iniciarArrastre(e, index, true, 5)}
                  onPointerMove={moverArrastre}
                  onPointerUp={finalizarArrastre}
                  onPointerCancel={finalizarArrastre}
                >
                  {ficha5NecesitaMover && (
                    <span className={`hint-mano ${direccion5 === 'bajar' ? 'mano-baja' : 'mano-sube'}`}>
                      {direccion5 === 'bajar' ? '👇' : '👆'}
                    </span>
                  )}
                </div>
                
                <div className="barra-central" />
                
                {/* FICHAS DE 1 */}
                {[1, 2, 3, 4].map((i) => {
                  const accionFicha1 = ficha1NecesitaMover(i);
                  return (
                    <div 
                      key={i}
                      className={`ficha ficha-1 ${col.abajo >= i ? 'activa' : ''} ${accionFicha1 ? 'resaltar-celeste' : ''}`}
                      onPointerDown={(e) => iniciarArrastre(e, index, false, i)}
                      onPointerMove={moverArrastre}
                      onPointerUp={finalizarArrastre}
                      onPointerCancel={finalizarArrastre}
                    >
                      {accionFicha1 && (
                        <span className={`hint-mano ${accionFicha1 === 'bajar' ? 'mano-baja' : 'mano-sube'}`}>
                          {accionFicha1 === 'bajar' ? '👇' : '👆'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}