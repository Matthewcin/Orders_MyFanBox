import { Routes, Route, Link } from 'react-router-dom';
import Catalogo from './pages/Catalogo';
import AdminDashboard from './pages/AdminDashboard';
import OrderDetails from './pages/OrderDetails';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-8xl font-extrabold tracking-tighter">404</h1>
      <h2 className="text-lg font-normal text-neutral-400 mt-2">
        Esa página no existe o fue movida.
      </h2>
      <Link
        to="/"
        className="mt-8 bg-white text-black px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-transform hover:scale-105"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} />
      <Route path="/1620" element={<AdminDashboard />} />
      <Route path="/details/:id" element={<OrderDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}