import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdFolder,
  MdMemory,
  MdDescription,
  MdMonitor,
  MdStorage
} from 'react-icons/md';
import { theme } from '../../styles/theme';

const SidebarContainer = styled.aside`
  width: 260px;
  height: 100vh;
  background-color: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

const LogoArea = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid ${theme.colors.border};
  font-weight: 700;
  font-size: 20px;
  color: ${theme.colors.primary};
`;

const NavList = styled.nav`
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.button};
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background-color: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
  }

  &.active {
    background-color: ${theme.colors.primary};
    color: white;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <LogoArea>LLM Dashboard</LogoArea>
      <NavList>
        <NavItem to="/">
          <MdDashboard size={20} /> Dashboard
        </NavItem>
        <NavItem to="/users">
          <MdPeople size={20} /> User & Org
        </NavItem>
        <NavItem to="/projects">
          <MdFolder size={20} /> Projects
        </NavItem>
        <NavItem to="/monitoring">
          <MdMonitor size={20} /> Sessions
        </NavItem>
        <NavItem to="/model-deploy">
          <MdMemory size={20} />
          Model & Deploy
        </NavItem>
        <NavItem to="/datasets">
          <MdStorage size={20} />
          Datasets
        </NavItem>
        <NavItem to="/templates">
          <MdDescription size={20} /> Templates
        </NavItem>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
