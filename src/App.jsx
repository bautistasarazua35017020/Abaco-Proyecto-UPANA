import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MenuPrincipal from './MenuPrincipal';
import ModuloAprendizaje from './ModuloAprendizaje';
import EntrenadorSoroban from './EntrenadorSoroban';
import EjerciciosFlash from './EjerciciosFlash';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/aprendizaje" element={<ModuloAprendizaje />} />
        <Route path="/entrenador" element={<EntrenadorSoroban />} />
        <Route path="/ejercicios" element={<EjerciciosFlash />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;