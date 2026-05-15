import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EjerciciosFlash() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  
  const [estado, setEstado] = useState('inicio');
  const [contador, setContador] = useState(3);
  const [indiceNumero, setIndiceNumero] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [tipoActual, setTipoActual] = useState('');

  const [ejercicio, setEjercicio] = useState({
    secuenciaNumeros: [], opciones: [], correcta: null
  });

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioMate');
    if (usuarioString) setUsuario(JSON.parse(usuarioString));
    else navigate('/');
  }, [navigate]);

  // --- GENERADOR DE SONIDO DINÁMICO (Web Audio API) ---
  // Ahora recibe parámetros para crear distintos efectos con la misma función
  const reproducirSonido = (frecuencia, tipoOnda, volumen, duracion) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const contexto = new AudioContext();
      const oscilador = contexto.createOscillator();
      const ganancia = contexto.createGain();

      oscilador.type = tipoOnda; // 'sine', 'square', 'sawtooth', 'triangle'
      oscilador.frequency.setValueAtTime(frecuencia, contexto.currentTime); 

      ganancia.gain.setValueAtTime(volumen, contexto.currentTime); 
      ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + duracion); 

      oscilador.connect(ganancia);
      ganancia.connect(contexto.destination);

      oscilador.start();
      oscilador.stop(contexto.currentTime + duracion); 
    } catch (error) {
      console.log("El navegador no permitió reproducir el sonido automáticamente", error);
    }
  };

  const generarEjercicioDinamico = (tipo) => {
    let secuencia = [];
    let total = 0;

    if (tipo === 'suma') {
      for(let i=0; i<4; i++) {
        let num = Math.floor(Math.random() * 20) + 1; 
        secuencia.push(num); total += num;
      }
    } 
    else if (tipo === 'resta') {
      let base = Math.floor(Math.random() * 40) + 50; 
      secuencia.push(base); total = base;
      for(let i=0; i<3; i++) {
        let num = Math.floor(Math.random() * 10) + 1; 
        secuencia.push(-num); total -= num;
      }
    } 
    else if (tipo === 'mixta') {
      let base = Math.floor(Math.random() * 20) + 20; 
      secuencia.push(base); total = base;
      for(let i=0; i<3; i++) {
        let esSuma = Math.random() > 0.5;
        let num = Math.floor(Math.random() * 15) + 1;
        if (!esSuma && (total - num < 0)) esSuma = true; 
        secuencia.push(esSuma ? num : -num);
        total += (esSuma ? num : -num);
      }
    }

    let opciones = [
      total, total + Math.floor(Math.random() * 3) + 1, 
      total - Math.floor(Math.random() * 3) - 1, total + Math.floor(Math.random() * 5) + 4
    ];
    opciones = opciones.sort(() => Math.random() - 0.5);

    setEjercicio({ secuenciaNumeros: secuencia, opciones: opciones, correcta: total });
    setTipoActual(tipo); setEstado('cuenta-regresiva'); setContador(3); setIndiceNumero(0); setSeleccion(null);
  };

  // --- EFECTO: CUENTA REGRESIVA ---
  useEffect(() => {
    if (estado === 'cuenta-regresiva') {
      if (contador > 0) {
        // Sonido de "Tic" suave
        reproducirSonido(440, 'sine', 0.2, 0.1); 
        
        const timer = setTimeout(() => setContador(contador - 1), 800);
        return () => clearTimeout(timer);
      } else {
        // Sonido de "¡Go!" un poco más largo y agudo
        reproducirSonido(880, 'sine', 0.4, 0.3); 
        setEstado('mostrando');
      }
    }
  }, [estado, contador]);

  // --- EFECTO: MOSTRAR NÚMEROS (FLASH) ---
  useEffect(() => {
    if (estado === 'mostrando') {
      if (indiceNumero < ejercicio.secuenciaNumeros.length) {
        
        // ¡Sonido MUCHO MÁS FUERTE y penetrante para los números!
        // Frecuencia 1000Hz, Onda tipo Triángulo y 60% de volumen
        reproducirSonido(1000, 'triangle', 0.6, 0.15); 

        const timer = setTimeout(() => setIndiceNumero(indiceNumero + 1), 1200); 
        return () => clearTimeout(timer);
      } else {
        setEstado('preguntando');
      }
    }
  }, [estado, indiceNumero, ejercicio.secuenciaNumeros.length]);

  const evaluarRespuesta = (respuesta) => {
    setSeleccion(respuesta);
    setTimeout(() => setEstado('resultado'), 600);
  };

  if (!usuario) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div className="tarjeta-flash">
        <button onClick={() => navigate('/menu')} className="btn-cerrar-flash">✕</button>

        {estado === 'inicio' && (
          <div className="animacion-aparecer">
            <span className="emoji-flash">⚡</span>
            <h1 className="titulo-flash">Flash Anzan</h1>
            <p className="subtitulo-flash">
              Pon a prueba tu mente. Los números parpadearán rápido, ¡resuélvelo sin usar los dedos!
            </p>
            <button onClick={() => setEstado('seleccion')} className="btn-comenzar">
              Elegir Entrenamiento
            </button>
          </div>
        )}

        {estado === 'seleccion' && (
          <div className="animacion-aparecer ancho-total">
            <h2 className="titulo-secundario">Selecciona tu Reto</h2>
            <p className="texto-categoria">Categoría habilitada: {usuario.categoria}</p>
            
            <div className="grid-opciones">
              <button onClick={() => generarEjercicioDinamico('suma')} className="btn-reto btn-reto-suma">
                <span className="emoji-reto">➕</span> Suma a Suma
              </button>
              <button onClick={() => generarEjercicioDinamico('resta')} className="btn-reto btn-reto-resta">
                <span className="emoji-reto">➖</span> Resta a Resta
              </button>
              <button onClick={() => generarEjercicioDinamico('mixta')} className="btn-reto btn-reto-mixta">
                <span className="emoji-reto">⚖️</span> Suma y Resta
              </button>
              <button disabled className="btn-reto btn-reto-deshabilitado">
                <span className="emoji-reto emoji-gris">✖️</span> Multiplicación <br/><span style={{ fontSize: '1rem' }}>(Próximamente)</span>
              </button>
            </div>
          </div>
        )}

        {estado === 'cuenta-regresiva' && (
          <div className="animacion-latido">
            <h2 className="texto-preparate">Ojos a la pantalla</h2>
            <div className="numero-contador">{contador}</div>
          </div>
        )}

        {estado === 'mostrando' && (
          <div className="contenedor-mostrando">
            <div key={indiceNumero} className="numero-flash" style={{ color: ejercicio.secuenciaNumeros[indiceNumero] > 0 ? '#0f172a' : '#e11d48' }}>
               {ejercicio.secuenciaNumeros[indiceNumero] > 0 ? `+${ejercicio.secuenciaNumeros[indiceNumero]}` : ejercicio.secuenciaNumeros[indiceNumero]}
            </div>
          </div>
        )}

        {estado === 'preguntando' && (
          <div className="animacion-aparecer ancho-total">
            <h2 className="titulo-pregunta">¿Cuál es el resultado?</h2>
            <div className="grid-respuestas">
              {ejercicio.opciones.map((opcion, index) => (
                <button 
                  key={index}
                  onClick={() => evaluarRespuesta(opcion)}
                  className={`btn-respuesta ${seleccion === opcion ? 'seleccionado' : ''}`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        )}

        {estado === 'resultado' && (
          <div className="animacion-aparecer ancho-total">
            <div className="emoji-resultado">
              {seleccion === ejercicio.correcta ? '🎉' : '❌'}
            </div>
            <h2 className="titulo-resultado" style={{ color: seleccion === ejercicio.correcta ? '#10b981' : '#ef4444' }}>
              {seleccion === ejercicio.correcta ? '¡Respuesta Perfecta!' : 'Casi lo logras'}
            </h2>
            <p className="texto-resultado">
              La respuesta correcta era: <span style={{ color: '#0f172a', fontSize: '2rem' }}>{ejercicio.correcta}</span>
            </p>
            
            <div className="caja-botones-finales">
              <button onClick={() => setEstado('seleccion')} className="btn-secundario">Cambiar de Reto</button>
              <button onClick={() => generarEjercicioDinamico(tipoActual)} className="btn-primario">Otro igual 🔁</button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* Diseño PC */
        .tarjeta-flash { background-color: #ffffff; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.4); max-width: 800px; width: 100%; min-height: 500px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 50px; position: relative; text-align: center; }
        .btn-cerrar-flash { position: absolute; top: 20px; right: 30px; background: none; border: none; cursor: pointer; font-size: 2rem; color: #cbd5e1; }
        .ancho-total { width: 100%; }
        .emoji-flash { font-size: 5rem; display: inline-block; margin-bottom: 20px; filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.2)); }
        .titulo-flash { font-size: 3rem; color: #0f172a; font-weight: 900; margin: 0 0 15px 0; }
        .subtitulo-flash { font-size: 1.4rem; color: #475569; margin-bottom: 40px; font-weight: 600; }
        .btn-comenzar { background-color: #10b981; color: white; padding: 20px 50px; border-radius: 16px; border: none; font-size: 1.5rem; font-weight: 900; cursor: pointer; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4); }
        .titulo-secundario { font-size: 2.2rem; color: #0f172a; font-weight: 900; margin-bottom: 10px; }
        .texto-categoria { font-size: 1.2rem; color: #64748b; margin-bottom: 30px; font-weight: 700; }
        .grid-opciones, .grid-respuestas { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
        .btn-reto { padding: 25px; border-radius: 20px; font-size: 1.4rem; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: all 0.2s; }
        .btn-reto:hover { transform: translateY(-5px); }
        .btn-reto-suma { background-color: #f0f9ff; color: #0284c7; border: 3px solid #bae6fd; }
        .btn-reto-resta { background-color: #fff1f2; color: #e11d48; border: 3px solid #fecdd3; }
        .btn-reto-mixta { background-color: #f5f3ff; color: #7c3aed; border: 3px solid #ddd6fe; }
        .btn-reto-deshabilitado { background-color: #f8fafc; color: #94a3b8; border: 3px dashed #e2e8f0; cursor: not-allowed; opacity: 0.7; }
        .btn-reto-deshabilitado:hover { transform: none; }
        .emoji-reto { font-size: 2.5rem; }
        .emoji-gris { filter: grayscale(100%); }
        .texto-preparate { font-size: 2rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
        .numero-contador { font-size: 8rem; font-weight: 900; color: #8b5cf6; text-shadow: 4px 4px 0px #e2e8f0; }
        .contenedor-mostrando { width: 100%; height: 250px; display: flex; justify-content: center; align-items: center; }
        .numero-flash { font-size: 10rem; font-weight: 900; animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .titulo-pregunta { font-size: 2.5rem; color: #0f172a; font-weight: 900; margin-bottom: 30px; }
        .btn-respuesta { background-color: #f8fafc; color: #0f172a; padding: 30px; border-radius: 20px; border: 3px solid #e2e8f0; font-size: 3rem; font-weight: 900; cursor: pointer; transition: all 0.2s; }
        .btn-respuesta:hover { border-color: #8b5cf6; }
        .btn-respuesta.seleccionado { background-color: #cbd5e1; border-color: #94a3b8; }
        .emoji-resultado { font-size: 6rem; margin-bottom: 10px; }
        .titulo-resultado { font-size: 3rem; font-weight: 900; margin: 0 0 10px 0; }
        .texto-resultado { font-size: 1.5rem; color: #64748b; font-weight: 700; margin-bottom: 40px; }
        .caja-botones-finales { display: flex; gap: 20px; justify-content: center; }
        .btn-secundario { background-color: #f1f5f9; color: #475569; padding: 18px 30px; border-radius: 16px; border: none; font-size: 1.2rem; font-weight: 800; cursor: pointer; }
        .btn-primario { background-color: #8b5cf6; color: white; padding: 18px 30px; border-radius: 16px; border: none; font-size: 1.2rem; font-weight: 800; cursor: pointer; box-shadow: 0 8px 15px rgba(139, 92, 246, 0.3); }

        /* Animaciones */
        .animacion-aparecer { animation: aparecer 0.5s ease; }
        .animacion-latido { animation: latido 0.8s infinite alternate; }
        @keyframes latido { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes zoomIn { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes aparecer { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* MAGIA RESPONSIVA MÓVIL */
        @media (max-width: 768px) {
          .tarjeta-flash { padding: 30px 20px; min-height: auto; }
          .btn-cerrar-flash { top: 15px; right: 20px; font-size: 1.5rem; }
          .titulo-flash { font-size: 2rem; }
          .subtitulo-flash { font-size: 1.1rem; }
          .btn-comenzar { padding: 15px 30px; font-size: 1.2rem; }
          .titulo-secundario { font-size: 1.8rem; }
          .grid-opciones, .grid-respuestas { gap: 15px; }
          .btn-reto { padding: 15px; font-size: 1rem; }
          .emoji-reto { font-size: 1.8rem; }
          .numero-contador { font-size: 5rem; }
          .contenedor-mostrando { height: 150px; }
          .numero-flash { font-size: 5rem; } 
          .titulo-pregunta { font-size: 1.8rem; }
          .btn-respuesta { padding: 15px; font-size: 2rem; }
          .emoji-resultado { font-size: 4rem; }
          .titulo-resultado { font-size: 2rem; }
          .texto-resultado { font-size: 1.2rem; }
          .caja-botones-finales { flex-direction: column; gap: 10px; }
        }
      `}</style>
    </div>
  );
}