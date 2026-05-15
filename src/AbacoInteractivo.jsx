import { useState, useEffect } from 'react';
import './Abaco.css';

export default function AbacoInteractivo({ onValueChange, animacionActiva, columnasActivas = [] }) {
  const [columnas, setColumnas] = useState(Array(13).fill({ arriba: false, abajo: 0 }));
  
  // Nuevo estado para rastrear el arrastre en tiempo real
  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    const valD = (columnas[11].arriba ? 5 : 0) + columnas[11].abajo;
    const valU = (columnas[12].arriba ? 5 : 0) + columnas[12].abajo;
    if (onValueChange) onValueChange((valD * 10) + valU);
  }, [columnas, onValueChange]);

  // 1. Cuando el usuario toca la cuenta (Inicia el rastreo)
  const iniciarArrastre = (e, index, esArriba, valorFicha) => {
    // Esta línea mágica "captura" el ratón/dedo para que no pierda el objetivo si se mueve muy rápido
    e.target.setPointerCapture(e.pointerId); 
    
    setDragState({
      startY: e.clientY || e.touches?.[0]?.clientY,
      index,
      esArriba,
      valorFicha
    });
  };

  // 2. Mientras el usuario mueve el dedo/mouse (Reacción instantánea)
  const moverArrastre = (e) => {
    if (!dragState) return;

    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const distancia = currentY - dragState.startY;

    // SENSIBILIDAD ULTRA FINA: Solo 3 píxeles de movimiento para que reaccione
    if (Math.abs(distancia) > 3) {
      if (!columnasActivas.includes(dragState.index)) {
        setDragState(null);
        return;
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
      
      // Terminamos el arrastre al instante para que la cuenta haga "snap" (se encaje) de una vez
      setDragState(null);
    }
  };

  // 3. Cuando suelta o el ratón sale (Limpiamos)
  const finalizarArrastre = (e) => {
    if (e && e.target && e.target.releasePointerCapture && e.pointerId) {
      try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
    }
    setDragState(null);
  };

  return (
    <div className="abaco-marco-global">
      <div className="abaco-madera">
        {columnas.map((col, index) => {
          const esActiva = columnasActivas.includes(index);
          return (
            <div key={index} className={`columna-contenedor ${esActiva ? 'columna-activa' : 'columna-inactiva'}`}>
              
              {esActiva && (index === 11 || index === 12) && (
                <div style={{ color: 'white', fontWeight: '900', marginBottom: '8px', fontSize: '1.4rem', textShadow: '2px 2px 4px #000' }}>
                  {index === 11 ? 'D' : 'U'}
                </div>
              )}

              <div className="columna">
                {index === 12 && animacionActiva === 'bajar-5' && !col.arriba && <div className="dedo-animado dedo-indice emoji-sticker">👇</div>}
                {index === 11 && animacionActiva === 'bajar-50' && !col.arriba && <div className="dedo-animado dedo-indice emoji-sticker">👇</div>}
                
                <div 
                  className={`ficha ficha-5 ${col.arriba ? 'activa' : ''}`} 
                  onPointerDown={(e) => iniciarArrastre(e, index, true, 5)}
                  onPointerMove={moverArrastre}
                  onPointerUp={finalizarArrastre}
                  onPointerCancel={finalizarArrastre}
                />
                
                <div className="barra-central" />
                
                {index === 12 && animacionActiva === 'subir-1' && col.abajo === 0 && <div className="dedo-animado dedo-pulgar emoji-sticker">👍</div>}

                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`ficha ficha-1 ${col.abajo >= i ? 'activa' : ''}`}
                    onPointerDown={(e) => iniciarArrastre(e, index, false, i)}
                    onPointerMove={moverArrastre}
                    onPointerUp={finalizarArrastre}
                    onPointerCancel={finalizarArrastre}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}