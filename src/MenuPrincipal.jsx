import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioMate');
    if (usuarioString) setUsuario(JSON.parse(usuarioString));
    else navigate('/');
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: "'Nunito', sans-serif"
    }}>
      
      <div className="tarjeta-menu">
        
        {/* LADO IZQUIERDO (O ARRIBA EN CELULAR) */}
        <div className="menu-perfil">
          <div style={{ width: '120px', height: '120px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '4.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', marginBottom: '15px', border: '4px solid rgba(255,255,255,0.5)' }}>
            {usuario.tieneMedalla ? '😎' : '🤓'}
          </div>
          <h1 style={{ fontWeight: '900', margin: '0 0 5px 0', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            {usuario.nombre} {usuario.apellido}
          </h1>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.3)', padding: '8px 15px', borderRadius: '20px', marginTop: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>{usuario.categoria} — Grado {usuario.grado}</p>
          </div>

          {usuario.tieneMedalla && (
            <div style={{ marginTop: '20px', backgroundColor: '#fef08a', color: '#854d0e', padding: '10px 20px', borderRadius: '15px', fontWeight: '900', fontSize: '14px', boxShadow: '0 5px 10px rgba(0,0,0,0.1)' }}>
              🏅 Aprendiz de Soroban
            </div>
          )}
        </div>

        {/* LADO DERECHO (O ABAJO EN CELULAR) */}
        <div className="menu-acciones">
          <h2 style={{ color: '#1e293b', marginBottom: '25px', fontWeight: '900', textAlign: 'center' }}>¿Qué haremos hoy?</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button style={{ backgroundColor: '#f97316', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }} onClick={() => navigate('/aprendizaje')}>
              📖 {usuario.tieneMedalla ? 'Repasar las Cuentas' : 'Aprender a usar las Cuentas'}
            </button>
            <button style={{ backgroundColor: '#14b8a6', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)' }} onClick={() => navigate('/ejercicios')}>
              ⚡ Ejercicios Flash
            </button>
            <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '18px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              🏆 Ver Dashboard (Top 3)
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <button onClick={() => { localStorage.removeItem('usuarioMate'); navigate('/'); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', textDecoration: 'underline' }}>
              Cerrar sesión
            </button>
          </div>
        </div>

      </div>
      
      {/* MAGIA RESPONSIVA SEGURA */}
      <style>{`
        .tarjeta-menu {
          display: flex;
          flex-direction: row;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          max-width: 850px;
          width: 100%;
          overflow: hidden;
          min-height: 480px;
        }
        .menu-perfil {
          flex: 1;
          background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          text-align: center;
        }
        .menu-perfil h1 { font-size: 2.2rem; }
        .menu-acciones {
          flex: 1.2;
          padding: 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .menu-acciones h2 { font-size: 1.8rem; }

        @media (max-width: 768px) {
          .tarjeta-menu {
            flex-direction: column;
            min-height: auto;
          }
          .menu-perfil {
            padding: 30px 20px;
          }
          .menu-perfil h1 { font-size: 1.8rem; }
          .menu-acciones {
            padding: 30px 20px;
          }
          .menu-acciones h2 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}