import { useState, useEffect } from 'react';
import './Abaco.css';

export default function AbacoInteractivo({ onValueChange, animacionActiva, columnasActivas = [] }) {
  const [columnas, setColumnas] = useState(Array(13).fill({ arriba: false, abajo: 0 }));
  const [startY, setStartY] = useState(null);

  useEffect(() => {
    const valD = (columnas[11].arriba ? 5 : 0) + columnas[11].abajo;
    const valU = (columnas[12].arriba ? 5 : 0) + columnas[12].abajo;
    if (onValueChange) onValueChange((valD * 10) + valU);
  }, [columnas, onValueChange]);

  const iniciarArrastre = (e) => {
    setStartY(e.clientY || e.touches?.[0]?.clientY);
  };

  const finalizarArrastre = (e, index, esArriba, valorFicha) => {
    if (startY === null) return;
    
    const endY = e.clientY || e.changedTouches?.[0]?.clientY || startY;
    const distancia = endY - startY;
    const umbralArrastre = 10; // Reducido para pantallas pequeñas

    // LÓGICA ESTRICTA: Si la columna no está autorizada por la lección, no hace nada.
    if (!columnasActivas.includes(index)) { 
      setStartY(null); 
      return; 
    }

    if (Math.abs(distancia) > umbralArrastre) {
      const nuevasColumnas = [...columnas];
      const col = { ...nuevasColumnas[index] };

      if (esArriba) {
        if (distancia > 0 && !col.arriba) col.arriba = true;
        else if (distancia < 0 && col.arriba) col.arriba = false;
      } else {
        if (distancia < 0) col.abajo = Math.max(col.abajo, valorFicha); 
        else if (distancia > 0) col.abajo = Math.min(col.abajo, valorFicha - 1);
      }
      nuevasColumnas[index] = col;
      setColumnas(nuevasColumnas);
    }
    setStartY(null);
  };

  return (
    <div className="abaco-marco-global">
      <div className="abaco-madera">
        {columnas.map((col, index) => {
          // La columna brilla solo si la lección lo permite
          const esActiva = columnasActivas.includes(index);
          
          return (
            <div key={index} className={`columna-contenedor ${esActiva ? 'columna-activa' : 'columna-inactiva'}`}>
              
              {/* Etiquetas D y U solo para las columnas 11 y 12 cuando estén activas */}
              {esActiva && (index === 11 || index === 12) && (
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', fontSize: '1rem', textAlign: 'center' }}>
                  {index === 11 ? 'D' : 'U'}
                </div>
              )}

              <div className="columna">
                {index === 12 && animacionActiva === 'bajar-5' && !col.arriba && <div className="dedo-animado dedo-indice">👆⬇️</div>}
                {index === 11 && animacionActiva === 'bajar-50' && !col.arriba && <div className="dedo-animado dedo-indice">👆⬇️</div>}
                
                <div 
                  className={`ficha ficha-5 ${col.arriba ? 'activa' : ''}`} 
                  onPointerDown={iniciarArrastre}
                  onPointerUp={(e) => finalizarArrastre(e, index, true, 5)}
                  onPointerOut={(e) => startY && finalizarArrastre(e, index, true, 5)}
                />
                
                <div className="barra-central" />
                
                {index === 12 && animacionActiva === 'subir-1' && col.abajo === 0 && <div className="dedo-animado dedo-pulgar">👍⬆️</div>}

                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`ficha ficha-1 ${col.abajo >= i ? 'activa' : ''}`}
                    onPointerDown={iniciarArrastre}
                    onPointerUp={(e) => finalizarArrastre(e, index, false, i)}
                    onPointerOut={(e) => startY && finalizarArrastre(e, index, false, i)}
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