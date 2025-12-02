import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const MainContent = styled.main`
  margin-left: 260px; /* Sidebar width */
  margin-top: 64px; /* Header height */
  min-height: calc(100vh - 64px);
  padding: 32px;
`;

const DashboardLayout = () => {
    return (
        <>
            <Sidebar />
            <Header title="Dashboard" /> {/* Title could be dynamic based on route */}
            <MainContent>
                <Outlet />
            </MainContent>
        </>
    );
};

export default DashboardLayout;
