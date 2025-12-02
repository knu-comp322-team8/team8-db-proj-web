import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Card = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.card};
  box-shadow: ${theme.shadows.card};
  padding: 24px;
  border: 1px solid ${theme.colors.border};
`;
