import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MenuPrincipal from './MenuPrincipal';
import ModuloAprendizaje from './ModuloAprendizaje';
import EjerciciosFlash from './EjerciciosFlash';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/aprendizaje" element={<ModuloAprendizaje />} />
        <Route path="/ejercicios" element={<EjerciciosFlash />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;