import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import MenuPrincipal from './MenuPrincipal';
import ModuloAprendizaje from './ModuloAprendizaje';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/aprendizaje" element={<ModuloAprendizaje />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;