import { useState, useEffect } from 'react';
import './Abaco.css';

export default function AbacoInteractivo({ onValueChange, animacionActiva, modoLibre }) {
  const [columnas, setColumnas] = useState(Array(13).fill({ arriba: false, abajo: 0 }));
  
  // Estado para rastrear dónde empezó a tocar el dedo/mouse
  const [startY, setStartY] = useState(null);

  useEffect(() => {
    const valD = (columnas[11].arriba ? 5 : 0) + columnas[11].abajo;
    const valU = (columnas[12].arriba ? 5 : 0) + columnas[12].abajo;
    if (onValueChange) onValueChange((valD * 10) + valU);
  }, [columnas, onValueChange]);

  // Cuando el niño pone el dedo/clic
  const iniciarArrastre = (e) => {
    setStartY(e.clientY);
  };

  // Cuando el niño levanta el dedo/suelta el clic
  const finalizarArrastre = (e, index, esArriba, valorFicha) => {
    if (startY === null) return;
    
    // Calculamos cuánto movió el dedo (positivo = abajo, negativo = arriba)
    const distancia = e.clientY - startY;
    const umbralArrastre = 15; // Mínimo de píxeles a arrastrar para que cuente

    // Reglas de bloqueo: Solo permitimos columnas D (11) y U (12)
    if (!modoLibre && index !== 12 && index !== 11) { setStartY(null); return; }
    if (modoLibre && index !== 11 && index !== 12) { setStartY(null); return; }

    if (Math.abs(distancia) > umbralArrastre) {
      const nuevasColumnas = [...columnas];
      const col = { ...nuevasColumnas[index] };

      if (esArriba) {
        // Ficha del 5 / 50: Solo se activa arrastrando ABAJO, se desactiva arrastrando ARRIBA
        if (distancia > 0 && !col.arriba) col.arriba = true;
        else if (distancia < 0 && col.arriba) col.arriba = false;
      } else {
        // Fichas del 1 / 10: Se activan arrastrando ARRIBA, se desactivan arrastrando ABAJO
        if (distancia < 0) {
          // Si arrastra la ficha 3 para arriba, suben la 1, 2 y 3.
          col.abajo = Math.max(col.abajo, valorFicha); 
        } else if (distancia > 0) {
          // Si arrastra la ficha 2 para abajo, caen la 2, 3 y 4. Queda solo 1.
          col.abajo = Math.min(col.abajo, valorFicha - 1);
        }
      }
      nuevasColumnas[index] = col;
      setColumnas(nuevasColumnas);
    }
    
    setStartY(null); // Reiniciamos el rastreo
  };

  return (
    <div className="abaco-marco-global">
      <div className="abaco-madera">
        {columnas.map((col, index) => {
          const esActiva = index === 11 || index === 12; // Ahora encendemos 11 y 12 para las lecciones
          
          return (
            <div key={index} className={`columna-contenedor ${esActiva ? 'columna-activa' : 'columna-inactiva'}`}>
              {esActiva && (
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.2rem' }}>
                  {index === 11 ? 'D' : 'U'}
                </div>
              )}

              <div className="columna">
                {/* Animaciones */}
                {index === 12 && animacionActiva === 'bajar-5' && !col.arriba && <div className="dedo-animado dedo-indice">👆⬇️</div>}
                {index === 11 && animacionActiva === 'bajar-50' && !col.arriba && <div className="dedo-animado dedo-indice">👆⬇️</div>}
                
                {/* Ficha Superior */}
                <div 
                  className={`ficha ficha-5 ${col.arriba ? 'activa' : ''}`} 
                  onPointerDown={iniciarArrastre}
                  onPointerUp={(e) => finalizarArrastre(e, index, true, 5)}
                  onPointerOut={(e) => startY && finalizarArrastre(e, index, true, 5)} // Por si saca el dedo rápido
                />
                
                <div className="barra-central" />
                
                {index === 12 && animacionActiva === 'subir-1' && col.abajo === 0 && <div className="dedo-animado dedo-pulgar">👍⬆️</div>}

                {/* Fichas Inferiores */}
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