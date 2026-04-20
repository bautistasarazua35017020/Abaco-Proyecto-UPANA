import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Login.css'; 

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // Cargamos los datos cada vez que el componente se muestra
  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioMate');
    if (usuarioString) {
      setUsuario(JSON.parse(usuarioString));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioMate');
    navigate('/');
  };

  if (!usuario) return null;

  return (
    <div className="login-contenedor">
      <div className="login-tarjeta" style={{ maxWidth: '600px' }}>
        
        {/* SALUDO DINÁMICO: Cambia el birrete por la medalla si ya completó el tutorial */}
        <h1 className="login-titulo">
          ¡Hola, {usuario.nombre}! {usuario.tieneMedalla ? '🏅' : '🎓'}
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '10px' }}>
          Estás en: <strong>{usuario.categoria}</strong>
        </p>
        <p style={{ fontSize: '1rem', color: '#888', marginBottom: '30px' }}>
          Grado actual: {usuario.grado}
        </p>

        {/* ALERTA DE LOGRO: Un pequeño mensaje motivador si ya tiene la medalla */}
        {usuario.tieneMedalla && (
          <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold' }}>
            ✨ ¡Felicidades! Ya eres un Aprendiz de Ábaco
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="boton-jugar" 
            style={{ backgroundColor: '#ff9f43' }}
            onClick={() => navigate('/aprendizaje')}
          >
            {usuario.tieneMedalla ? '📖 Repasar el Ábaco' : '📖 Aprender a usar el Ábaco'}
          </button>
          
          <button 
            className="boton-jugar" 
            style={{ backgroundColor: '#4ecdc4' }}
            // Aquí agregaremos la navegación a los ejercicios pronto
          >
            ⚡ Ejercicios Flash (Comprobación)
          </button>

          <button 
            className="boton-jugar" 
            style={{ backgroundColor: '#54a0ff' }}
            // Aquí agregaremos el Dashboard pronto
          >
            🏆 Ver Dashboard (Top 3)
          </button>
        </div>

        <button 
          onClick={cerrarSesion} 
          style={{ marginTop: '30px', color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Salir de la cuenta
        </button>
      </div>
    </div>
  );
}