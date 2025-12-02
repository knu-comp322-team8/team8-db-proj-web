import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            {/* Placeholder routes for other pages */}
            <Route path="users" element={<div>User & Org Page</div>} />
            <Route path="models" element={<div>Models Page</div>} />
            <Route path="deployments" element={<div>Deployments Page</div>} />
            <Route path="templates" element={<div>Templates Page</div>} />
            <Route path="monitoring" element={<div>Monitoring Page</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
