import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdSearch, MdPerson } from 'react-icons/md';
import axios from 'axios';
import { theme } from '../../styles/theme';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ManagerSelectModalProps {
  onClose: () => void;
  onSelect: (userId: string) => void;
}

export const ManagerSelectModal = ({ onClose, onSelect }: ManagerSelectModalProps) => {
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/users/`);
        console.log('Fetched users:', response.data);
        setLocalUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users for manager selection:", error);
      }
    };
    fetchAllUsers();
  }, []);

  const filteredUsers = localUsers.filter(user =>
    (user.user_name || user.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>관리자 지정</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <SearchInputWrapper>
          <SearchInput
            placeholder="사용자 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <SearchIconWrapper>
            <MdSearch size={20} />
          </SearchIconWrapper>
        </SearchInputWrapper>

        <UserList>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserItem key={user.user_id || user.id} onClick={() => onSelect(user.user_id || user.id)}>
                <UserInfo>
                  <Avatar>
                    <MdPerson />
                  </Avatar>
                  <div>
                    <UserName>{user.user_name || user.name}</UserName>
                    <UserEmail>{user.user_email || user.email}</UserEmail>
                  </div>
                </UserInfo>
                <SelectButton>선택</SelectButton>
              </UserItem>
            ))
          ) : (
            <EmptyState>검색 결과가 없습니다.</EmptyState>
          )}
        </UserList>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: ${theme.borderRadius.card};
  width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
      font-size: 18px;
      font-weight: 700;
      color: ${theme.colors.textPrimary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  &:hover { color: ${theme.colors.textPrimary}; }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  padding-right: 36px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
  font-size: 14px;
  outline: none;
  &:focus { border-color: ${theme.colors.primary}; }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 12px;
  color: ${theme.colors.textSecondary};
  pointer-events: none;
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.background};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 32px; height: 32px;
  border-radius: 50%;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const SelectButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  background-color: ${theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  
  &:hover {
      background-color: #4338CA;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;
