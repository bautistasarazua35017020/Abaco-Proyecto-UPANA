import { useState } from 'react';
import AbacoInteractivo from './AbacoInteractivo';
import { useNavigate } from 'react-router-dom';

const LECCIONES = [
  { 
    id: 1, tipo: 'info', 
    titulo: "El Soroban Japonés 🇯🇵", 
    texto: "El ábaco que usarás se llama 'Soroban'. No es una calculadora, es una herramienta para entrenar tu cerebro y hacerte increíblemente rápido." 
  },
  { 
    id: 2, tipo: 'info', 
    titulo: "El valor de las cuentas", 
    texto: "Imagina que la barra horizontal en el centro es la 'Tierra'. \n\n• Las 4 cuentas de abajo valen 1 cada una.\n• La cuenta solitaria de arriba vale 5.\n\nSolo valen cuando 'tocan la Tierra' (la barra central)." 
  },
  { 
    id: 3, tipo: 'info', 
    titulo: "La técnica de arrastre 👆", 
    texto: "Aquí no hacemos 'clic'. Tienes que ARRASTRAR las cuentas con el ratón o con el dedo como en un ábaco real:\n\n👍 El PULGAR: Sirve para arrastrar hacia ARRIBA las cuentas de abajo.\n👆 El ÍNDICE: Sirve para arrastrar hacia ABAJO la cuenta del 5." 
  },
  { 
    id: 4, tipo: 'libre', 
    titulo: "Modo Exploración Libre 🕹️", 
    instrucciones: "¡Arrastra las cuentas de la columna 'U' hacia la barra! Observa cómo cambia el número. (Tocar rápido no funcionará, debes deslizarlas).", 
    objetivo: null 
  },
  { 
    id: 5, tipo: 'interactivo', 
    titulo: "Prueba tu dedo Índice", 
    instrucciones: "Usa tu dedo índice para ARRASTRAR HACIA ABAJO la cuenta de arriba en la columna 'U'.", 
    objetivo: 5, animacionDedo: 'bajar-5' 
  },
  { 
    id: 6, tipo: 'interactivo', 
    titulo: "Prueba tu dedo Pulgar", 
    instrucciones: "ARRASTRA HACIA ARRIBA dos cuentas de abajo hacia la barra en la columna 'U'.", 
    objetivo: 2, animacionDedo: 'subir-1' 
  },
  { 
    id: 7, tipo: 'interactivo', 
    titulo: "La Pinza (El número 6)", 
    instrucciones: "Arrastra el 5 hacia abajo y arrastra un 1 hacia arriba para formar el 6.", 
    objetivo: 6, animacionDedo: null 
  },
  // NUEVAS LECCIONES PARA DECENAS (50)
  { 
    id: 8, tipo: 'info', 
    titulo: "Las Decenas (La letra D)", 
    texto: "La columna a la izquierda de la 'U' tiene la letra 'D' (Decenas). \n\n¡Aquí todo vale por diez! Las cuentas de abajo valen 10, 20, 30, 40... y la cuenta gigante de arriba vale 50." 
  },
  { 
    id: 9, tipo: 'interactivo', 
    titulo: "Conociendo el 50", 
    instrucciones: "En la columna 'D', ARRASTRA HACIA ABAJO la cuenta superior. ¡Felicidades, acabas de poner 50!", 
    objetivo: 50, animacionDedo: 'bajar-50' 
  }
];

export default function ModuloAprendizaje() {
  const [leccionActual, setLeccionActual] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [valorEnAbaco, setValorEnAbaco] = useState(0);
  const [mostrarMedalla, setMostrarMedalla] = useState(false);
  const navigate = useNavigate();

  const leccion = LECCIONES[leccionActual];

  const manejarCambioValor = (valor) => {
    setValorEnAbaco(valor);
    if (leccion.tipo === 'interactivo' && valor === leccion.objetivo) {
      setCompletado(true);
    } else {
      setCompletado(false);
    }
  };

  const siguienteLeccion = () => {
    if (leccionActual < LECCIONES.length - 1) {
      setLeccionActual(leccionActual + 1);
      setCompletado(false);
      setValorEnAbaco(0);
    } else {
      ganarMedalla();
    }
  };

  const ganarMedalla = () => {
    const usuarioString = localStorage.getItem('usuarioMate');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      usuario.tieneMedalla = true;
      localStorage.setItem('usuarioMate', JSON.stringify(usuario));
    }
    setMostrarMedalla(true);
  };

  if (mostrarMedalla) {
    return (
      <div className="login-contenedor">
        <div className="login-tarjeta" style={{ textAlign: 'center', padding: '50px' }}>
          <h1 style={{ fontSize: '4rem', animation: 'aparecer 1s ease-out' }}>🏅</h1>
          <h2 style={{ color: '#ff9f43' }}>¡FELICIDADES, APRENDIZ AVANZADO!</h2>
          <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
            Ahora dominas el arrastre de cuentas, las Unidades y las Decenas.
          </p>
          <button className="boton-jugar" onClick={() => navigate('/menu')} style={{ backgroundColor: '#4ecdc4' }}>
            Volver al Menú Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-contenedor">
      <div className="login-tarjeta" style={{ maxWidth: '800px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
           <span style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.2rem' }}>Paso {leccionActual + 1} de {LECCIONES.length}</span>
           <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#999' }}>✕</button>
        </div>

        <h2 style={{ color: '#ff6b6b', fontSize: '2rem' }}>{leccion.titulo}</h2>

        {leccion.tipo === 'info' && (
          <div style={{ padding: '20px', fontSize: '1.3rem', lineHeight: '1.8', color: '#444', textAlign: 'left', whiteSpace: 'pre-line' }}>
            {leccion.texto}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#54a0ff' }}>Entendido →</button>
            </div>
          </div>
        )}

        {leccion.tipo === 'libre' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '10px', color: '#2e7d32', textAlign: 'left' }}>
              {leccion.instrucciones}
            </p>
            <AbacoInteractivo key={leccionActual} onValueChange={manejarCambioValor} modoLibre={true} />
            <div style={{ marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '15px', border: '3px solid #ff9f43', display: 'inline-block' }}>
               <span style={{ fontSize: '1.2rem', color: '#666' }}>Valor actual:</span>
               <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b6b', marginLeft: '15px' }}>{valorEnAbaco}</span>
            </div>
            <div style={{ marginTop: '30px' }}>
              <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#ff9f43' }}>Ya dominé el arrastre →</button>
            </div>
          </div>
        )}

        {leccion.tipo === 'interactivo' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '10px', color: '#0056b3', textAlign: 'left' }}>
              {leccion.instrucciones}
            </p>
            <AbacoInteractivo key={leccionActual} onValueChange={manejarCambioValor} animacionActiva={leccion.animacionDedo} />
            
            {completado ? (
              <div style={{ marginTop: '20px', animation: 'aparecer 0.5s ease-in' }}>
                <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.3rem' }}>¡Excelente movimiento de dedos! ✨</p>
                <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#4caf50', marginTop: '10px' }}>
                  {leccionActual < LECCIONES.length - 1 ? "Siguiente Práctica →" : "¡Reclamar Medalla! 🏅"}
                </button>
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem' }}>
                Valor actual: <strong>{valorEnAbaco}</strong> (Objetivo: <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{leccion.objetivo}</span>)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}