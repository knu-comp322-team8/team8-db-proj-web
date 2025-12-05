import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';

import UserOrg from './pages/UserOrg';
import Project from './pages/Project';
import Monitoring from './pages/Monitoring';
import Templates from './pages/Templates';
import ModelDeploy from './pages/ModelDeploy';
import Datasets from './pages/Datasets';

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserOrg />} />
            <Route path="/projects" element={<Project />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/model-deploy" element={<ModelDeploy />} />
            <Route path="/datasets" element={<Datasets />} /> {/* Added Datasets route */}
            <Route path="templates" element={<Templates />} />
            <Route path="monitoring" element={<div>Monitoring Page</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
