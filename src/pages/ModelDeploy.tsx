import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import type { Model, Deployment } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdCheck } from 'react-icons/md';

const PageContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px); // Subtract header height if needed, or just 100vh minus padding
  gap: 24px;
  padding: 24px;
`;

const Section = styled.div`
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const ActionButton = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;

  &:hover {
    background-color: #4338ca;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ListItem = styled.div<{ isActive?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.isActive ? theme.colors.primary : theme.colors.border};
  background-color: ${props => props.isActive ? '#eef2ff' : 'white'};
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;



const Badge = styled.span<{ color?: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => props.color || '#f3f4f6'};
  color: #4b5563;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  gap: 8px;
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

const ModalContent = styled.div<{ width?: string }>`
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: ${props => props.width || '500px'};
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

const DatasetList = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
`;

const DatasetItem = styled.div<{ isSelected?: boolean }>`
  padding: 10px 12px;
  border-bottom: 1px solid ${theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#eef2ff' : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => props.isSelected ? '#eef2ff' : '#f9fafb'};
  }
`;

const ModelDeploy = () => {
    const {
        models, fetchModels, createModel, updateModel, deleteModel,
        currentDeployments, fetchDeploymentsByModel, createDeployment, updateDeployment, deleteDeployment,
        datasets, fetchDatasets
    } = useDataStore();

    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

    // Model Modal State
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<Partial<Model> | null>(null);

    // Deployment Modal State
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [editingDeploy, setEditingDeploy] = useState<Partial<Deployment> | null>(null);

    // Dataset Search State
    const [datasetSearchName, setDatasetSearchName] = useState('');
    const [datasetSearchType, setDatasetSearchType] = useState('');

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        if (selectedModelId) {
            fetchDeploymentsByModel(selectedModelId);
        }
    }, [selectedModelId]);

    // Model Handlers
    const handleCreateModel = () => {
        setEditingModel({ model_id: '', model_name: '', model_type: '' });
        setIsModelModalOpen(true);
    };

    const handleEditModel = (model: Model) => {
        setEditingModel(model);
        setIsModelModalOpen(true);
    };

    const handleDeleteModel = async (id: string) => {
        if (confirm('모델을 삭제하시겠습니까?')) {
            await deleteModel(id);
            if (selectedModelId === id) setSelectedModelId(null);
        }
    };

    const submitModel = async () => {
        if (!editingModel?.model_name || !editingModel.model_type) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const isEdit = models.find(m => m.model_id === editingModel.model_id);

        if (isEdit) {
            if (editingModel.model_id) {
                await updateModel(editingModel.model_id, editingModel);
            }
        } else {
            await createModel(editingModel as Model);
        }
        setIsModelModalOpen(false);
    };

    // Deployment Handlers
    const handleCreateDeploy = () => {
        if (!selectedModelId) return;
        setEditingDeploy({
            deployment_id: '',
            server_name: '',
            gpu_count: 0,
            environment: '개발',
            status: '활성',
            model_id: selectedModelId,
            dataset_id: ''
        });
        setDatasetSearchName('');
        setDatasetSearchType('');
        fetchDatasets(); // Fetch initial datasets
        setIsDeployModalOpen(true);
    };

    const handleEditDeploy = (deploy: Deployment) => {
        setEditingDeploy(deploy);
        setDatasetSearchName('');
        setDatasetSearchType('');
        fetchDatasets();
        setIsDeployModalOpen(true);
    };

    const handleDeleteDeploy = async (id: string) => {
        if (confirm('배포 환경을 삭제하시겠습니까?')) {
            await deleteDeployment(id);
            if (selectedModelId) fetchDeploymentsByModel(selectedModelId);
        }
    };

    const searchDatasets = () => {
        fetchDatasets({
            datasetName: datasetSearchName || undefined,
            learningType: datasetSearchType || undefined
        });
    };

    const submitDeploy = async () => {
        if (!editingDeploy?.server_name) {
            alert('필수 필드를 입력해주세요.');
            return;
        }

        const isUpdate = currentDeployments.some(d => d.deployment_id === editingDeploy.deployment_id);

        if (isUpdate) {
            if (editingDeploy.deployment_id) {
                await updateDeployment(editingDeploy.deployment_id, editingDeploy);
            }
        } else {
            await createDeployment(editingDeploy as Deployment);
        }

        if (selectedModelId) fetchDeploymentsByModel(selectedModelId);
        setIsDeployModalOpen(false);
    };

    return (
        <PageContainer>
            {/* Left Pane: Models */}
            <Section>
                <SectionHeader>
                    <SectionTitle>Models</SectionTitle>
                    <ActionButton onClick={handleCreateModel}>
                        <MdAdd size={16} /> Add Model
                    </ActionButton>
                </SectionHeader>
                <ListContainer>
                    {models.map(model => (
                        <ListItem
                            key={model.model_id}
                            isActive={selectedModelId === model.model_id}
                            onClick={() => setSelectedModelId(model.model_id)}
                        >
                            <ItemHeader>
                                <ItemTitle>{model.model_name}</ItemTitle>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleEditModel(model); }}>
                                        <MdEdit size={16} />
                                    </IconButton>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.model_id); }}>
                                        <MdDelete size={16} />
                                    </IconButton>
                                </div>
                            </ItemHeader>

                            <div style={{ marginTop: '8px' }}>
                                <Badge>{model.model_type}</Badge>
                            </div>
                        </ListItem>
                    ))}
                </ListContainer>
            </Section>

            {/* Right Pane: Deployments */}
            <Section>
                <SectionHeader>
                    <SectionTitle>Deployments</SectionTitle>
                    {selectedModelId && (
                        <ActionButton onClick={handleCreateDeploy}>
                            <MdAdd size={16} /> Add Deployment
                        </ActionButton>
                    )}
                </SectionHeader>
                <ListContainer>
                    {!selectedModelId ? (
                        <EmptyState>
                            <MdSearch size={48} />
                            <p>모델을 선택하여 배포 현황을 확인하세요.</p>
                        </EmptyState>
                    ) : currentDeployments.length === 0 ? (
                        <EmptyState>
                            <p>배포된 환경이 없습니다.</p>
                        </EmptyState>
                    ) : (
                        currentDeployments.map(deploy => (
                            <ListItem key={deploy.deployment_id}>
                                <ItemHeader>
                                    <ItemTitle>{deploy.server_name}</ItemTitle>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <IconButton onClick={() => handleEditDeploy(deploy)}>
                                            <MdEdit size={16} />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteDeploy(deploy.deployment_id)}>
                                            <MdDelete size={16} />
                                        </IconButton>
                                    </div>
                                </ItemHeader>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <Badge color="#dbeafe">{deploy.environment}</Badge>
                                    <Badge color={deploy.status === '활성' ? '#dcfce7' : '#fee2e2'}>{deploy.status}</Badge>
                                    <Badge>GPU: {deploy.gpu_count}</Badge>
                                    {deploy.dataset_id && <Badge color="#f3e8ff">Dataset: {deploy.dataset_id}</Badge>}
                                </div>
                            </ListItem>
                        ))
                    )}
                </ListContainer>
            </Section>

            {/* Model Modal */}
            {isModelModalOpen && editingModel && (
                <ModalOverlay onClick={() => setIsModelModalOpen(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalTitle>{models.some(m => m.model_id === editingModel.model_id) ? '모델 수정' : '모델 생성'}</ModalTitle>

                        <FormGroup>
                            <Label>Model Name</Label>
                            <Input
                                value={editingModel.model_name}
                                onChange={e => setEditingModel({ ...editingModel, model_name: e.target.value })}
                                placeholder="모델 이름"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Type</Label>
                            <Input
                                value={editingModel.model_type}
                                onChange={e => setEditingModel({ ...editingModel, model_type: e.target.value })}
                                placeholder="예: LLM, Vision, etc."
                            />
                        </FormGroup>
                        <ButtonGroup>
                            <Button variant="secondary" onClick={() => setIsModelModalOpen(false)}>취소</Button>
                            <Button variant="primary" onClick={submitModel}>저장</Button>
                        </ButtonGroup>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Deployment Modal */}
            {isDeployModalOpen && editingDeploy && (
                <ModalOverlay onClick={() => setIsDeployModalOpen(false)}>
                    <ModalContent width="1200px" onClick={e => e.stopPropagation()}>
                        <ModalTitle>{currentDeployments.some(d => d.deployment_id === editingDeploy.deployment_id) ? '배포 환경 수정' : '배포 환경 생성'}</ModalTitle>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>

                                <FormGroup>
                                    <Label>Server Name</Label>
                                    <Input
                                        value={editingDeploy.server_name}
                                        onChange={e => setEditingDeploy({ ...editingDeploy, server_name: e.target.value })}
                                        placeholder="서버 이름"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>GPU Count</Label>
                                    <Input
                                        type="number"
                                        value={editingDeploy.gpu_count}
                                        onChange={e => setEditingDeploy({ ...editingDeploy, gpu_count: parseInt(e.target.value) })}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Environment</Label>
                                    <Select
                                        value={editingDeploy.environment}
                                        onChange={e => setEditingDeploy({ ...editingDeploy, environment: e.target.value })}
                                    >
                                        <option value="개발">개발</option>
                                        <option value="스테이징">스테이징</option>
                                        <option value="프로덕션">프로덕션</option>
                                        <option value="테스트">테스트</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Status</Label>
                                    <Select
                                        value={editingDeploy.status}
                                        onChange={e => setEditingDeploy({ ...editingDeploy, status: e.target.value })}
                                    >
                                        <option value="활성">활성</option>
                                        <option value="비활성">비활성</option>
                                        <option value="오류">오류</option>
                                        <option value="유지보수">유지보수</option>
                                    </Select>
                                </FormGroup>
                            </div>

                            <div>
                                <Label>Dataset Selection (Optional)</Label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <Input
                                        placeholder="데이터셋 검색"
                                        value={datasetSearchName}
                                        onChange={e => setDatasetSearchName(e.target.value)}
                                    />
                                    <Select
                                        style={{ width: '120px' }}
                                        value={datasetSearchType}
                                        onChange={e => setDatasetSearchType(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="파인튜닝">파인튜닝</option>
                                        <option value="프롬프트학습">프롬프트학습</option>
                                        <option value="전이학습">전이학습</option>
                                        <option value="강화학습">강화학습</option>
                                    </Select>
                                    <Button variant="secondary" onClick={searchDatasets}><MdSearch /></Button>
                                </div>
                                <DatasetList style={{ maxHeight: '600px' }}>
                                    <DatasetItem
                                        isSelected={!editingDeploy.dataset_id}
                                        onClick={() => setEditingDeploy({ ...editingDeploy, dataset_id: '' })}
                                    >
                                        <span>선택 안함</span>
                                        {editingDeploy.dataset_id === '' && <MdCheck color={theme.colors.primary} />}
                                    </DatasetItem>
                                    {datasets.map(ds => (
                                        <DatasetItem
                                            key={ds.dataset_id}
                                            isSelected={editingDeploy.dataset_id === ds.dataset_id}
                                            onClick={() => setEditingDeploy({ ...editingDeploy, dataset_id: ds.dataset_id })}
                                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '16px', color: theme.colors.primary }}>{ds.dataset_id}</span>
                                                    <Badge>{ds.learning_type}</Badge>
                                                </div>
                                                {editingDeploy.dataset_id === ds.dataset_id && <MdCheck color={theme.colors.primary} />}
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>
                                                {ds.description || '설명 없음'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.colors.textSecondary, fontFamily: 'monospace' }}>
                                                {ds.s3_path}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                                                Created: {ds.created_at ? new Date(ds.created_at).toLocaleString() : '-'}
                                            </div>
                                        </DatasetItem>
                                    ))}
                                </DatasetList>
                                <div style={{ marginTop: '8px', fontSize: '13px', color: theme.colors.textSecondary }}>
                                    Selected Dataset ID: <b>{editingDeploy.dataset_id || 'None'}</b>
                                </div>
                            </div>
                        </div>

                        <ButtonGroup>
                            <Button variant="secondary" onClick={() => setIsDeployModalOpen(false)}>취소</Button>
                            <Button variant="primary" onClick={submitDeploy}>저장</Button>
                        </ButtonGroup>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default ModelDeploy;
