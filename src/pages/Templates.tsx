import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import type { PromptTemplate } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { MdAdd, MdSearch, MdDelete } from 'react-icons/md';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338ca;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: white;
  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  font-weight: 600;
  font-size: 13px;
`;

const Td = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textPrimary};
  font-size: 14px;
`;

const Tr = styled.tr`
  transition: background-color 0.2s;
  &:hover {
    background-color: ${theme.colors.background};
  }
  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #4b5563;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${theme.colors.background};
    color: ${theme.colors.error || '#ef4444'};
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 500px;
  max-width: 90%;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  color: ${theme.colors.textPrimary};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: white;
  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  
  ${props => props.variant === 'primary' ? `
    background-color: ${theme.colors.primary};
    color: white;
    &:hover { background-color: #4338ca; }
  ` : `
    background-color: #f3f4f6;
    color: ${theme.colors.textPrimary};
    &:hover { background-color: #e5e7eb; }
  `}
`;

const Templates = () => {
  const { templates, fetchTemplates, createTemplate, deleteTemplate, users, fetchUsers } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState<'templateName' | 'creatorName'>('templateName');
  const [searchValue, setSearchValue] = useState('');

  // New Template State
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate>>({
    template_id: '',
    template_name: '',
    prompt_s3_path: '',
    description: '',
    task_category: '품질검토',
    variables: '',
    version: 'v1.0',
    creator_user_id: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchUsers();
  }, []);

  const handleSearch = () => {
    fetchTemplates({
      templateName: searchType === 'templateName' ? searchValue : undefined,
      creatorName: searchType === 'creatorName' ? searchValue : undefined
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
      await deleteTemplate(id);
    }
  };

  const handleSubmit = async () => {
    if (!newTemplate.template_name || !newTemplate.creator_user_id) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    await createTemplate(newTemplate as PromptTemplate);
    setIsModalOpen(false);
    setNewTemplate({
      template_id: '',
      template_name: '',
      prompt_s3_path: '',
      description: '',
      task_category: '품질검토',
      variables: '',
      version: 'v1.0',
      creator_user_id: ''
    });
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <Title>프롬프트 템플릿</Title>
          <Subtitle>AI 모델 프롬프트 템플릿 관리 및 버전 제어</Subtitle>
        </div>
        <Controls>
          <div style={{ display: 'flex', gap: '8px' }}>
            <FilterSelect
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
            >
              <option value="templateName">템플릿명</option>
              <option value="creatorName">생성자</option>
            </FilterSelect>
            <SearchInput
              style={{ width: '200px' }}
              placeholder="검색어 입력"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            <ActionButton onClick={handleSearch} style={{ padding: '8px 16px' }}>
              <MdSearch size={20} />
            </ActionButton>
          </div>
          <ActionButton onClick={() => setIsModalOpen(true)}>
            <MdAdd size={20} />
            템플릿 생성
          </ActionButton>
        </Controls>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>S3 Path</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Version</Th>
              <Th>Creator</Th>
              <Th>Usage</Th>
              <Th>Created At</Th>
              <Th style={{ width: '50px' }}></Th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <Tr key={template.template_id}>
                <Td>{template.template_name}</Td>
                <Td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{template.prompt_s3_path}</Td>
                <Td title={template.description}>
                  {template.description && template.description.length > 15
                    ? `${template.description.substring(0, 15)}...`
                    : template.description || '-'}
                </Td>
                <Td><Badge>{template.task_category}</Badge></Td>
                <Td>{template.version}</Td>
                <Td>{template.creator_user_name || template.creator_user_id}</Td>
                <Td>{template.usage_count}</Td>
                <Td>{template.created_at ? new Date(template.created_at).toLocaleDateString() : '-'}</Td>
                <Td>
                  <IconButton onClick={() => handleDelete(template.template_id)} title="삭제">
                    <MdDelete size={18} />
                  </IconButton>
                </Td>
              </Tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <Td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                  데이터가 없습니다.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>새 템플릿 생성</ModalTitle>

            <FormGroup>
              <Label>Template Name</Label>
              <Input
                value={newTemplate.template_name}
                onChange={e => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                placeholder="템플릿 이름"
              />
            </FormGroup>
            <FormGroup>
              <Label>S3 Path</Label>
              <Input
                value={newTemplate.prompt_s3_path}
                onChange={e => setNewTemplate({ ...newTemplate, prompt_s3_path: e.target.value })}
                placeholder="s3://bucket/path/to/prompt"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                value={newTemplate.description}
                onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="템플릿 설명"
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Select
                value={newTemplate.task_category}
                onChange={e => setNewTemplate({ ...newTemplate, task_category: e.target.value })}
              >
                <option value="품질검토">품질검토</option>
                <option value="질의응답">질의응답</option>
                <option value="문서화">문서화</option>
                <option value="코딩">코딩</option>
                <option value="요약">요약</option>
                <option value="번역">번역</option>
                <option value="생성">생성</option>
                <option value="분석">분석</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Creator</Label>
              <Select
                value={newTemplate.creator_user_id}
                onChange={e => setNewTemplate({ ...newTemplate, creator_user_id: e.target.value })}
              >
                <option value="">생성자 선택</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </Select>
            </FormGroup>
            <ButtonGroup>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
              <Button variant="primary" onClick={handleSubmit}>생성</Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Templates;
