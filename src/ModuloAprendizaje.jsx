import { useState } from 'react';
import AbacoInteractivo from './AbacoInteractivo';
import { useNavigate } from 'react-router-dom';

const LECCIONES = [
  { id: 1, tipo: 'info', titulo: "El Soroban Japonés", emoji: "🧮", texto: "¡Bienvenido a tu entrenamiento ninja mental! \n\nEl Soroban no es un juguete, es una antigua herramienta matemática. Funciona como una 'calculadora mágica' que conectará tus dedos con tu cerebro.\n\nAl mover estas cuentas, podrás sumar y restar en tu mente rapidísimo.", columnasActivas: [] },
  { id: 2, tipo: 'info', titulo: "La Regla de la Tierra", emoji: "🌍", texto: "Observa el ábaco de al lado: hay una barra negra cruzando por la mitad. A esta barra la llamamos 'La Tierra'.\n\n🔹 Cuentas de Abajo: Hay 4 bolitas blancas abajo. Cada una vale '1'.\n🔹 Cuenta de Arriba: Hay una sola bolita arriba. ¡Esa vale '5'!\n\n⚠️ REGLA DE ORO: Las cuentas SOLO tienen valor cuando las mueves y tocan 'La Tierra' (la barra negra).", columnasActivas: [] },
  { id: 3, tipo: 'info', titulo: "Tus Dedos", emoji: "👉", texto: "Para ser veloz, cada dedo tiene un trabajo estricto.\n\n👍 EL PULGAR (El Levantador):\nÚsalo ÚNICAMENTE para arrastrar hacia ARRIBA las cuentas de abajo.\n\n👇 EL ÍNDICE (El Multitareas):\nÚsalo para arrastrar hacia ABAJO las cuentas inferiores. También es el único autorizado para tocar la cuenta del '5'.", columnasActivas: [] },
  { id: 4, tipo: 'libre', titulo: "Exploración: Unidades", instrucciones: "Ves la columna encendida con la letra 'U' (Unidades). Arrastra las cuentas blancas hacia la barra negra y mira cómo cambia el valor.", objetivo: null, columnasActivas: [12] },
  { id: 5, tipo: 'interactivo', titulo: "Llamando al 5", instrucciones: "Pruébalo: Usa tu dedo ÍNDICE para arrastrar HACIA ABAJO la cuenta superior solitaria. Recuerda que vale 5.", objetivo: 5, animacionDedo: 'bajar-5', columnasActivas: [12] },
  { id: 6, tipo: 'interactivo', titulo: "Sumando desde abajo", instrucciones: "Ahora, usa tu dedo PULGAR para arrastrar HACIA ARRIBA tres cuentas de la parte inferior.", objetivo: 3, animacionDedo: 'subir-1', columnasActivas: [12] },
  { id: 7, tipo: 'interactivo', titulo: "La técnica de Pinza", instrucciones: "Vamos a formar el 7 (5 + 2). Arrastra el 5 hacia abajo y dos cuentas de abajo hacia arriba al mismo tiempo.", objetivo: 7, animacionDedo: null, columnasActivas: [12] },
  { id: 8, tipo: 'info', titulo: "Salto a las Decenas", emoji: "🚀", texto: "¡Impresionante! Ya dominas las Unidades (U). \n\nAhora vamos a encender la columna de la izquierda, marcada con una 'D' (Decenas).\n\nAquí todo vale por diez: Las bolitas de abajo valen 10, 20, 30... ¡Y la cuenta gigante de arriba vale 50!", columnasActivas: [] },
  { id: 9, tipo: 'libre', titulo: "Explorando Decenas", instrucciones: "¡Las columnas D y U están activas! Arrastra cuentas en ambas columnas. Por ejemplo, si bajas el 50 y subes un 1, formarás el 51.", objetivo: null, columnasActivas: [11, 12] },
  { id: 10, tipo: 'interactivo', titulo: "Tu primer número grande", instrucciones: "En la columna 'D', arrastra hacia abajo la cuenta del 50. Luego, en la columna 'U', arrastra hacia arriba dos cuentas para formar el 52.", objetivo: 52, animacionDedo: null, columnasActivas: [11, 12] }
];

export default function ModuloAprendizaje() {
  const [leccionActual, setLeccionActual] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [valorEnAbaco, setValorEnAbaco] = useState(0);
  const navigate = useNavigate();

  const leccion = LECCIONES[leccionActual];

  const manejarCambioValor = (valor) => {
    setValorEnAbaco(valor);
    if (leccion.tipo === 'interactivo' && valor === leccion.objetivo) setCompletado(true);
    else setCompletado(false);
  };

  const siguienteLeccion = () => {
    if (leccionActual < LECCIONES.length - 1) {
      setLeccionActual(leccionActual + 1);
      setCompletado(false);
      setValorEnAbaco(0);
    } else {
      const usuario = JSON.parse(localStorage.getItem('usuarioMate') || '{}');
      usuario.tieneMedalla = true;
      localStorage.setItem('usuarioMate', JSON.stringify(usuario));
      navigate('/menu');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0ea5e9', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      <div className="tarjeta-modulo">
        
        {/* LADO IZQUIERDO: TEXTOS */}
        <div className="modulo-texto">
          <div className="etiqueta-paso">
             Paso {leccionActual + 1} / {LECCIONES.length}
          </div>
          
          <button onClick={() => navigate('/menu')} className="btn-cerrar">✕</button>

          <div style={{ marginTop: '30px' }}>
            {leccion.emoji && <span className="emoji-sticker titulo-emoji">{leccion.emoji}</span>}
            
            <h2 className="titulo-leccion">{leccion.titulo}</h2>
            
            {leccion.tipo === 'info' ? (
              <p className="texto-info">{leccion.texto}</p>
            ) : (
              <p className="texto-instruccion">{leccion.instrucciones}</p>
            )}

            <div style={{ marginTop: '30px' }}>
              {leccion.tipo === 'info' && (
                <button onClick={siguienteLeccion} className="btn-accion btn-naranja">
                  Entendido, continuar →
                </button>
              )}

              {leccion.tipo === 'interactivo' && !completado && (
                 <div className="caja-objetivo">
                   🎯 Objetivo: Formar el {leccion.objetivo}
                 </div>
              )}

              {completado && leccion.tipo === 'interactivo' && (
                <button onClick={siguienteLeccion} className="btn-accion btn-verde" style={{ animation: 'aparecer 0.4s ease-out' }}>
                  ¡Correcto! Siguiente reto →
                </button>
              )}

              {leccion.tipo === 'libre' && (
                <button onClick={siguienteLeccion} className="btn-accion btn-morado">
                  Terminé de jugar →
                </button>
              )}
            </div>

          </div>
        </div>

        {/* LADO DERECHO: ÁBACO */}
        <div className="modulo-abaco">
          <AbacoInteractivo 
            key={leccionActual} 
            onValueChange={manejarCambioValor} 
            animacionActiva={leccion.animacionDedo}
            columnasActivas={leccion.columnasActivas} 
          />
          
          <div className="caja-marcador">
             <span className="marcador-texto">Valor en Ábaco:</span>
             <span className="marcador-numero">{valorEnAbaco}</span>
          </div>
        </div>

      </div>
      
      <style>{`
        /* Diseño PC */
        .tarjeta-modulo {
          display: flex;
          flex-direction: row;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          max-width: 1550px;
          width: 98%;
          overflow: hidden;
          min-height: 650px;
        }
        .modulo-texto {
          flex: 0 0 32%;
          background-color: #ffffff;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        .modulo-abaco {
          flex: 1;
          background-color: #FFF8E1;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .etiqueta-paso { position: absolute; top: 30px; left: 40px; color: #94a3b8; font-weight: 800; font-size: 1.2rem; text-transform: uppercase; }
        .btn-cerrar { position: absolute; top: 20px; right: 30px; background: none; border: none; cursor: pointer; font-size: 2rem; color: #cbd5e1; }
        .titulo-emoji { font-size: 4rem; }
        .titulo-leccion { color: #0f172a; font-size: 2.5rem; font-weight: 900; margin: 15px 0; }
        .texto-info { font-size: 1.4rem; line-height: 1.6; color: #334155; white-space: pre-line; font-weight: 600; }
        .texto-instruccion { font-size: 1.4rem; background-color: #f0f9ff; padding: 25px; border-radius: 16px; color: #0369a1; border: 2px solid #bae6fd; line-height: 1.5; font-weight: 700; }
        .btn-accion { width: 100%; padding: 20px; border-radius: 16px; border: none; font-size: 1.4rem; font-weight: 800; cursor: pointer; color: white; }
        .btn-naranja { background-color: #f97316; box-shadow: 0 8px 15px rgba(249, 115, 22, 0.3); }
        .btn-verde { background-color: #10b981; box-shadow: 0 8px 15px rgba(16, 185, 129, 0.3); }
        .btn-morado { background-color: #8b5cf6; box-shadow: 0 8px 15px rgba(139, 92, 246, 0.3); }
        .caja-objetivo { background-color: #fff1f2; padding: 20px; border-radius: 16px; color: #e11d48; font-weight: 800; font-size: 1.4rem; border: 3px dashed #fecdd3; text-align: center; }
        .caja-marcador { margin-top: 30px; padding: 20px 50px; background-color: #ffffff; border-radius: 24px; border: 4px solid #F57F17; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .marcador-texto { font-size: 1.6rem; color: #F57F17; font-weight: 900; text-transform: uppercase; }
        .marcador-numero { font-size: 4rem; font-weight: 900; color: #0f172a; }

        /* MAGIA RESPONSIVA MÓVIL */
        @media (max-width: 900px) {
          .tarjeta-modulo { flex-direction: column; min-height: auto; }
          .modulo-texto { padding: 80px 25px 30px 25px; } /* Más padding arriba para no chocar con botones */
          .modulo-abaco { padding: 30px 15px; }
          .etiqueta-paso { top: 20px; left: 20px; font-size: 1rem; }
          .btn-cerrar { top: 10px; right: 15px; }
          .titulo-emoji { font-size: 3rem; }
          .titulo-leccion { font-size: 2rem; }
          .texto-info, .texto-instruccion, .caja-objetivo, .btn-accion { font-size: 1.1rem; padding: 15px; }
          .caja-marcador { flex-direction: column; padding: 15px 30px; gap: 5px; text-align: center; }
          .marcador-texto { font-size: 1.2rem; }
          .marcador-numero { font-size: 3rem; }
        }
      `}</style>
    </div>
  );
}