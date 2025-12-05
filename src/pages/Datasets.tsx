import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import type { Dataset } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';

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

const Datasets = () => {
  const { datasets, fetchDatasets, createDataset, updateDataset, deleteDataset } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dataset State
  const [editingDataset, setEditingDataset] = useState<Partial<Dataset>>({
    dataset_id: '',
    learning_type: '파인튜닝',
    description: '',
    s3_path: ''
  });

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleCreate = () => {
    setEditingDataset({
      dataset_id: '',
      learning_type: '파인튜닝',
      description: '',
      s3_path: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 이 데이터셋을 삭제하시겠습니까?')) {
      await deleteDataset(id);
    }
  };

  const handleSubmit = async () => {
    if (!editingDataset.s3_path) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const isExisting = datasets.some(d => d.dataset_id === editingDataset.dataset_id);

    if (isExisting) {
      if (editingDataset.dataset_id) {
        await updateDataset(editingDataset.dataset_id, editingDataset);
      }
    } else {
      await createDataset(editingDataset as Dataset);
    }

    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <Title>데이터셋 관리</Title>
          <Subtitle>AI 모델 학습을 위한 데이터셋 관리</Subtitle>
        </div>
        <ActionButton onClick={handleCreate}>
          <MdAdd size={20} />
          데이터셋 추가
        </ActionButton>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Learning Type</Th>
              <Th>Description</Th>
              <Th>S3 Path</Th>
              <Th>Created At</Th>
              <Th style={{ width: '80px' }}></Th>
            </tr>
          </thead>
          <tbody>
            {datasets.map(dataset => (
              <Tr key={dataset.dataset_id}>
                <Td><Badge>{dataset.learning_type}</Badge></Td>
                <Td title={dataset.description}>
                  {dataset.description && dataset.description.length > 40
                    ? `${dataset.description.substring(0, 40)}...`
                    : dataset.description || '-'}
                </Td>
                <Td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{dataset.s3_path}</Td>
                <Td>{dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : '-'}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton onClick={() => handleEdit(dataset)} title="수정">
                      <MdEdit size={18} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(dataset.dataset_id)} title="삭제">
                      <MdDelete size={18} />
                    </IconButton>
                  </div>
                </Td>
              </Tr>
            ))}
            {datasets.length === 0 && (
              <tr>
                <Td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
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
            <ModalTitle>{datasets.some(d => d.dataset_id === editingDataset.dataset_id) ? '데이터셋 수정' : '새 데이터셋 추가'}</ModalTitle>

            <FormGroup>
              <Label>Learning Type</Label>
              <Select
                value={editingDataset.learning_type}
                onChange={e => setEditingDataset({ ...editingDataset, learning_type: e.target.value })}
              >
                <option value="파인튜닝">파인튜닝</option>
                <option value="프롬프트학습">프롬프트학습</option>
                <option value="전이학습">전이학습</option>
                <option value="강화학습">강화학습</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                value={editingDataset.description}
                onChange={e => setEditingDataset({ ...editingDataset, description: e.target.value })}
                placeholder="데이터셋 설명"
              />
            </FormGroup>
            <FormGroup>
              <Label>S3 Path</Label>
              <Input
                value={editingDataset.s3_path}
                onChange={e => setEditingDataset({ ...editingDataset, s3_path: e.target.value })}
                placeholder="s3://bucket/path/to/dataset"
              />
            </FormGroup>
            <ButtonGroup>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
              <Button variant="primary" onClick={handleSubmit}>저장</Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Datasets;
