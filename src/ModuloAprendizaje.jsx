import { useState } from 'react';
import AbacoInteractivo from './AbacoInteractivo';
import { useNavigate } from 'react-router-dom';

const LECCIONES = [
  // FASE 1: UNIDADES
  { 
    id: 1, tipo: 'info', 
    titulo: "El Soroban Japonés 🇯🇵", 
    texto: "Bienvenido a tu entrenamiento. El Soroban es una herramienta legendaria. No es una calculadora electrónica, es un gimnasio para tu cerebro. ¡Comencemos conociendo las reglas básicas!",
    columnasActivas: [] 
  },
  { 
    id: 2, tipo: 'info', 
    titulo: "El Valor de las Cuentas", 
    texto: "Observa la barra horizontal en el centro, a esa la llamamos 'Tierra'. \n\n• Las 4 cuentas de abajo valen 1.\n• La cuenta solitaria de arriba vale 5.\n\nPara que tengan valor, deben tocar la 'Tierra'.",
    columnasActivas: [] 
  },
  { 
    id: 3, tipo: 'libre', 
    titulo: "Modo Exploración: Unidades 🕹️", 
    instrucciones: "¡Inténtalo! Arrastra las cuentas de la columna iluminada con la letra 'U' (Unidades). Observa cómo cambia el número cuando las cuentas tocan la barra central.", 
    objetivo: null,
    columnasActivas: [12] // SOLO ENCIENDE UNIDADES
  },
  { 
    id: 4, tipo: 'interactivo', 
    titulo: "Tu primer movimiento", 
    instrucciones: "Usa tu dedo índice para ARRASTRAR HACIA ABAJO la cuenta superior en la columna 'U'.", 
    objetivo: 5, animacionDedo: 'bajar-5',
    columnasActivas: [12] 
  },
  { 
    id: 5, tipo: 'interactivo', 
    titulo: "Sumando desde abajo", 
    instrucciones: "Ahora, usa tu pulgar para ARRASTRAR HACIA ARRIBA dos cuentas de la parte inferior.", 
    objetivo: 2, animacionDedo: 'subir-1',
    columnasActivas: [12] 
  },
  { 
    id: 6, tipo: 'interactivo', 
    titulo: "Combinando: El Número 6", 
    instrucciones: "Haz el movimiento de 'Pinza': Arrastra el 5 hacia abajo y un 1 hacia arriba al mismo tiempo.", 
    objetivo: 6, animacionDedo: null,
    columnasActivas: [12] 
  },

  // FASE 2: INTRODUCCIÓN A LAS DECENAS
  { 
    id: 7, tipo: 'info', 
    titulo: "Las Decenas (Columna D)", 
    texto: "¡Excelente! Ya dominas la columna de las Unidades. Ahora, la columna que está justo a su izquierda tiene la letra 'D' (Decenas).\n\nEn esta nueva columna la magia se multiplica por diez: las de abajo valen 10, 20, 30... y la grande de arriba vale 50.",
    columnasActivas: [] 
  },
  { 
    id: 8, tipo: 'libre', 
    titulo: "Explorando las Decenas 🕹️", 
    instrucciones: "Nota que ahora hay DOS columnas encendidas. Arrastra libremente las cuentas en ambas columnas y observa cómo puedes formar números grandes.", 
    objetivo: null,
    columnasActivas: [11, 12] // AHORA SÍ ENCIENDE DECENAS Y UNIDADES
  },
  { 
    id: 9, tipo: 'interactivo', 
    titulo: "Conociendo el 50", 
    instrucciones: "En la columna 'D' (la nueva), ARRASTRA HACIA ABAJO la cuenta superior. ¡Acabas de formar el número 50!", 
    objetivo: 50, animacionDedo: 'bajar-50',
    columnasActivas: [11, 12] 
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '4rem', margin: 0, animation: 'aparecer 1s ease-out' }}>🏅</h1>
          <h2 style={{ color: '#ff9f43', marginTop: '15px' }}>¡ENTRENAMIENTO COMPLETADO!</h2>
          <p style={{ color: '#8e8e93', fontSize: '1.1rem', marginBottom: '30px' }}>
            Ya entiendes el secreto de las Unidades y Decenas.
          </p>
          <button className="boton-jugar" onClick={() => navigate('/menu')} style={{ backgroundColor: '#0095f6', width: '100%', borderRadius: '10px' }}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Tarjeta estilo App Moderna */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%', padding: '30px', position: 'relative' }}>
        
        {/* Header simple */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #efefef', paddingBottom: '15px', marginBottom: '20px' }}>
           <span style={{ color: '#8e8e93', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
             Paso {leccionActual + 1} de {LECCIONES.length}
           </span>
           <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#262626' }}>✕</button>
        </div>

        <h2 style={{ color: '#262626', fontSize: '1.8rem', fontWeight: '700', marginBottom: '15px', textAlign: 'center' }}>
          {leccion.titulo}
        </h2>

        {/* CONTENIDO TEÓRICO */}
        {leccion.tipo === 'info' && (
          <div style={{ padding: '10px 0' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#262626', whiteSpace: 'pre-line', textAlign: 'center' }}>
              {leccion.texto}
            </p>
            <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#0095f6', width: '100%', borderRadius: '12px', marginTop: '30px' }}>
              Entendido
            </button>
          </div>
        )}

        {/* CONTENIDO PRÁCTICO / LIBRE */}
        {(leccion.tipo === 'libre' || leccion.tipo === 'interactivo') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <p style={{ fontSize: '1.1rem', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', color: '#262626', textAlign: 'center', width: '100%', border: '1px solid #efefef' }}>
              {leccion.instrucciones}
            </p>

            {/* Ábaco con paso estricto de columnas */}
            <AbacoInteractivo 
              key={leccionActual} 
              onValueChange={manejarCambioValor} 
              animacionActiva={leccion.animacionDedo}
              columnasActivas={leccion.columnasActivas} 
            />

            {/* Monitor de valor */}
            <div style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#fafafa', borderRadius: '20px', border: '1px solid #efefef', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '1rem', color: '#8e8e93', fontWeight: '500' }}>Valor en Ábaco:</span>
               <span style={{ fontSize: '2rem', fontWeight: '800', color: '#262626' }}>{valorEnAbaco}</span>
            </div>

            {/* Validaciones y Botones */}
            {leccion.tipo === 'interactivo' && !completado && (
               <p style={{ color: '#ed4956', marginTop: '15px', fontWeight: '600' }}>
                 Objetivo: Formar el {leccion.objetivo}
               </p>
            )}

            {completado && leccion.tipo === 'interactivo' && (
              <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#38a169', width: '100%', borderRadius: '12px', marginTop: '20px', animation: 'aparecer 0.3s ease-out' }}>
                ¡Correcto! Continuar →
              </button>
            )}

            {leccion.tipo === 'libre' && (
              <button className="boton-jugar" onClick={siguienteLeccion} style={{ backgroundColor: '#0095f6', width: '100%', borderRadius: '12px', marginTop: '20px' }}>
                Listo, vamos a la práctica →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}