import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css'; // Aquí conectamos los colores y el diseño

export default function Login() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pin, setPin] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault(); // Evita que la página parpadee al enviar

    try {
      // Conexión a tu Backend en C#
      const respuesta = await fetch('https://localhost:7132/api/Usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre: nombre, 
          apellido: apellido, 
          pinAcceso: pin 
        })
      });

      if (respuesta.ok) {
        const usuario = await respuesta.json();
        // 1. Guardamos los datos del niño en la memoria del navegador
        localStorage.setItem('usuarioMate', JSON.stringify(usuario));
        // 2. Lo teletransportamos al menú
        navigate('/menu');
      } else {
        setMensaje('Ups... Revisa tu nombre, apellido o PIN.');
      }
    } catch (error) {
      setMensaje('Asegúrate de que el servidor (pantalla negra) esté encendido.');
    }
  };

  return (
    <div className="login-contenedor">
      <div className="login-tarjeta">
        <h1 className="login-titulo">¡Entra a Ábaco! 🧮</h1>
        <form onSubmit={manejarEnvio} className="login-formulario">
          
          <div className="campo">
            <label>Tu Nombre:</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej. Mateo"
              required 
            />
          </div>

          <div className="campo">
            <label>Tu Apellido:</label>
            <input 
              type="text" 
              value={apellido} 
              onChange={(e) => setApellido(e.target.value)} 
              placeholder="Ej. Perez"
              required 
            />
          </div>

          <div className="campo">
            <label>Tu PIN Secreto:</label>
            <input 
              type="password" 
              maxLength="4"
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              placeholder="****"
              required 
            />
          </div>

          <button type="submit" className="boton-jugar">¡A Jugar!</button>
        </form>

        {/* Aquí mostramos el mensaje de éxito o error */}
        {mensaje && <p className="mensaje-alerta">{mensaje}</p>}
      </div>
    </div>
  );
}