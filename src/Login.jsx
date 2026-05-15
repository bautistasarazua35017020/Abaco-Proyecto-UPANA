import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const manejarLogin = (e) => {
    e.preventDefault();
    if (nombre && apellido && pin) {
      const usuarioFalso = { nombre, apellido, pin, categoria: 'Primaria Mayor', grado: 5, tieneMedalla: false };
      localStorage.setItem('usuarioMate', JSON.stringify(usuarioFalso));
      navigate('/menu');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      
      {/* Usamos la clase .tarjeta-login que definimos abajo en el <style> */}
      <div className="tarjeta-login">
        
        {/* LADO IZQUIERDO (O ARRIBA EN CELULAR) */}
        <div className="login-visual">
          <div style={{ fontSize: '5rem', marginBottom: '10px', filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.2))' }}>🧮</div>
          <h1 style={{ fontWeight: '900', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Proyecto Mate</h1>
          <p style={{ fontWeight: '600', lineHeight: '1.5', opacity: 0.9 }}>
            Despierta tu mente y aprende el arte milenario del Soroban japonés.
          </p>
        </div>

        {/* LADO DERECHO (O ABAJO EN CELULAR) */}
        <div className="login-formulario">
          <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '5px', fontWeight: '800' }}>¡Bienvenido!</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '25px' }}>Inicia sesión para continuar.</p>

          <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Tu Nombre:</label>
              <input 
                type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Mateo"
                style={{ padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Tu Apellido:</label>
              <input 
                type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej. Pérez"
                style={{ padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Tu PIN Secreto:</label>
              <input 
                type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****"
                style={{ padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                required 
              />
            </div>

            <button type="submit" style={{ 
              marginTop: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '16px', borderRadius: '12px', 
              border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}>
              ¡A Jugar!
            </button>
          </form>
        </div>

      </div>
      
      {/* MAGIA RESPONSIVA SEGURA */}
      <style>{`
        .tarjeta-login {
          display: flex;
          flex-direction: row;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          max-width: 850px;
          width: 100%;
          overflow: hidden;
          min-height: 500px;
        }
        .login-visual {
          flex: 1;
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          text-align: center;
        }
        .login-visual h1 { font-size: 2.5rem; }
        .login-visual p { font-size: 1.2rem; }
        .login-formulario {
          flex: 1.2;
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Cuando la pantalla es de celular (menor a 768px) */
        @media (max-width: 768px) {
          .tarjeta-login {
            flex-direction: column; /* Apila los elementos verticalmente */
            min-height: auto;
          }
          .login-visual {
            padding: 30px 20px;
          }
          .login-visual h1 { font-size: 2rem; }
          .login-visual p { font-size: 1rem; }
          .login-formulario {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}