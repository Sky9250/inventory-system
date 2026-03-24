import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import ProductionReports from './pages/ProductionReports';
import Dispatch from './pages/Dispatch';
import MachineProduction from './pages/MachineProduction';
import Electricity from './pages/Electricity';
import RawMaterials from './pages/RawMaterials';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import './styles/global.css';

function PrivateRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {[
          { path: '/dashboard', component: <Dashboard /> },
          { path: '/products', component: <Products /> },
          { path: '/stock', component: <Stock /> },
          { path: '/production', component: <ProductionReports /> },
          { path: '/machine-production', component: <MachineProduction /> },
          { path: '/electricity', component: <Electricity /> },
          { path: '/raw-materials', component: <RawMaterials /> },
          { path: '/dispatch', component: <Dispatch /> },
          { path: '/reports', component: <Reports /> },
          { path: '/settings', component: <Settings /> },
        ].map(({ path, component }) => (
          <Route key={path} path={path} element={
            <PrivateRoute><Layout>{component}</Layout></PrivateRoute>
          } />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
