import styled from 'styled-components';
import { theme } from '../../styles/theme';


const HeaderContainer = styled.header`
  height: 64px;
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  position: fixed;
  top: 0;
  left: 260px; /* Sidebar width */
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;



const Header = ({ title }: { title: string }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
    </HeaderContainer>
  );
};

export default Header;
