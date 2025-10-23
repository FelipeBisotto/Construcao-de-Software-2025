import { Route, Routes, NavLink } from 'react-router-dom';
import Users from './pages/Users';

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ marginBottom: 16 }}>
        <NavLink to="/" style={{ marginRight: 12 }}>Home</NavLink>
        <NavLink to="/users">Usuários</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<div>Bem-vindo ao CS2025 Frontend</div>} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </div>
  );
}

