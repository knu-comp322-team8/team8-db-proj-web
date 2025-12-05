import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import type { Project } from '../store/useDataStore';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from 'react-icons/md';
import { Card } from '../components/common/Card';
import { theme } from '../styles/theme';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  background-color: white;
  outline: none;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.button};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.primary};
  }
`;

const TableContainer = styled(Card)`
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 16px 24px;
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
  }

  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: ${theme.colors.textSecondary};
    font-size: 14px;
  }

  tr:last-child td {
    border-bottom: none;
  }
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
    color: ${theme.colors.primary};
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 16px;
  width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  color: ${theme.colors.textPrimary};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
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
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
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
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  ${({ variant }) => variant === 'primary' ? `
    background-color: ${theme.colors.primary};
    color: white;
    border: none;
    &:hover { background-color: ${theme.colors.primary}; }
  ` : `
    background-color: white;
    color: ${theme.colors.textPrimary};
    border: 1px solid ${theme.colors.border};
    &:hover { background-color: ${theme.colors.background}; }
  `}
`;

// Large Modal Styles for Project Detail
const LargeModalContent = styled.div`
  background: white;
  width: 90%;
  height: 90%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const LargeModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
`;

const LargeModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const LargeModalBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPane = styled.div`
  width: 350px;
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow-y: auto;
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  overflow-y: auto;
`;

const SessionItem = styled.div<{ isSelected: boolean }>`
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isSelected ? '#eff6ff' : 'white'};

  &:hover {
    background-color: ${props => props.isSelected ? '#eff6ff' : '#f9fafb'};
  }
`;

const SessionId = styled.div`
  font-family: monospace;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

const SessionMeta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
`;

const Badge = styled.span<{ type?: 'status' | 'type'; value: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  
  ${props => {
        if (props.type === 'status') {
            switch (props.value) {
                case 'IN_PROGRESS': return `background: #e0f2fe; color: #0284c7;`;
                case 'COMPLETED': return `background: #dcfce7; color: #16a34a;`;
                case 'ERROR': return `background: #fee2e2; color: #dc2626;`;
                case 'STOPPED': return `background: #f3f4f6; color: #4b5563;`;
                default: return `background: #f3f4f6; color: #4b5563;`;
            }
        } else {
            return `border: 1px solid ${theme.colors.border}; color: ${theme.colors.textSecondary};`;
        }
    }}
`;

const LogTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    padding: 12px 16px;
    background-color: #f1f5f9;
    color: ${theme.colors.textSecondary};
    font-weight: 600;
    border-bottom: 1px solid ${theme.colors.border};
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid ${theme.colors.border};
    color: ${theme.colors.textPrimary};
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const DetailHeader = styled.div`
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid ${theme.colors.border};
  margin-bottom: 1px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const ProjectPage: React.FC = () => {
    const {
        projects, departments, users, departmentUsers, sessions, currentSessionLogs,
        fetchProjects, fetchDepartments, fetchUsers, fetchDepartmentUsers,
        createProject, updateProject, deleteProject,
        fetchSessionsByProject, fetchSessionLogs
    } = useDataStore();

    const [searchType, setSearchType] = useState<'projectName' | 'creatorName' | 'departmentName'>('projectName');
    const [searchValue, setSearchValue] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');

    // Create/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [form, setForm] = useState<Partial<Project>>({
        id: '', name: '', description: '', departmentId: '', creatorId: ''
    });

    // Detail Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
        fetchProjects();
    }, []);

    const handleSearch = () => {
        const params: any = {};
        if (searchType === 'projectName' && searchValue) params.projectName = searchValue;
        if (searchType === 'creatorName' && searchValue) params.creatorName = searchValue;
        if (searchType === 'departmentName' && selectedDeptId) params.departmentName = selectedDeptId;

        fetchProjects(params);
    };

    const handleCreate = () => {
        setModalMode('create');
        setForm({ id: '', name: '', description: '', departmentId: '', creatorId: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setModalMode('edit');
        setForm({ ...project });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
            await deleteProject(id);
        }
    };

    const handleSubmit = async () => {
        if (modalMode === 'create') {
            if (!form.name || !form.departmentId || !form.creatorId) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }
            await createProject(form as Project);
        } else {
            await updateProject(form.id!, form);
        }
        setIsModalOpen(false);
    };

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        fetchSessionsByProject(project.id);
        setSelectedSessionId(null);
    };

    const handleSessionClick = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        fetchSessionLogs(sessionId);
    };

    const closeDetailModal = () => {
        setSelectedProject(null);
        setSelectedSessionId(null);
    };

    // Helper to get names
    const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;

    return (
        <PageContainer>
            <Header>
                <Title>프로젝트 관리</Title>
                <Controls>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <FilterSelect
                            value={searchType}
                            onChange={(e) => {
                                setSearchType(e.target.value as any);
                                setSearchValue('');
                                setSelectedDeptId('');
                            }}
                        >
                            <option value="projectName">프로젝트명</option>
                            <option value="creatorName">생성자</option>
                            <option value="departmentName">부서별</option>
                        </FilterSelect>

                        {searchType === 'departmentName' ? (
                            <FilterSelect
                                value={selectedDeptId}
                                onChange={(e) => setSelectedDeptId(e.target.value)}
                            >
                                <option value="">부서 선택</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </FilterSelect>
                        ) : (
                            <Input
                                style={{ width: '200px' }}
                                placeholder="검색어 입력"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                }}
                            />
                        )}

                        <PrimaryButton onClick={handleSearch} style={{ padding: '8px 16px' }}>
                            <MdSearch size={20} />
                        </PrimaryButton>
                    </div>

                    <PrimaryButton onClick={handleCreate}>
                        <MdAdd size={20} /> 프로젝트 생성
                    </PrimaryButton>
                </Controls>
            </Header>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <th>프로젝트명</th>
                            <th>설명</th>
                            <th>부서</th>
                            <th>생성자</th>
                            <th>생성일</th>
                            <th style={{ width: '100px' }}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <tr key={project.id} style={{ cursor: 'pointer' }} onClick={() => handleProjectClick(project)}>
                                    <td>{project.name}</td>
                                    <td>{project.description || '-'}</td>
                                    <td>{getDeptName(project.departmentId)}</td>
                                    <td>{getUserName(project.creatorId)}</td>
                                    <td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}</td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <IconButton onClick={() => handleEdit(project)} title="수정">
                                                <MdEdit size={18} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(project.id)} title="삭제">
                                                <MdDelete size={18} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                    프로젝트가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            {isModalOpen && (
                <ModalOverlay onClick={() => setIsModalOpen(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalTitle>{modalMode === 'create' ? '새 프로젝트 생성' : '프로젝트 수정'}</ModalTitle>



                        <FormGroup>
                            <Label>프로젝트명</Label>
                            <Input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="프로젝트 이름 입력"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>설명</Label>
                            <Input
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="프로젝트 설명 (선택)"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>소속 부서</Label>
                            <Select
                                value={form.departmentId}
                                onChange={e => {
                                    const deptId = e.target.value;
                                    setForm({ ...form, departmentId: deptId, creatorId: '' });
                                    if (deptId) {
                                        fetchDepartmentUsers(deptId);
                                    }
                                }}
                                disabled={modalMode === 'edit'}
                            >
                                <option value="">부서 선택</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>생성자</Label>
                            <Select
                                value={form.creatorId}
                                onChange={e => setForm({ ...form, creatorId: e.target.value })}
                                disabled={modalMode === 'edit' || !form.departmentId}
                            >
                                <option value="">
                                    {!form.departmentId ? '부서를 먼저 선택하세요' : '생성자 선택'}
                                </option>
                                {departmentUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <ButtonGroup>
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
                            <Button variant="primary" onClick={handleSubmit}>
                                {modalMode === 'create' ? '생성' : '저장'}
                            </Button>
                        </ButtonGroup>
                    </ModalContent>
                </ModalOverlay>
            )}

            {selectedProject && (
                <ModalOverlay onClick={closeDetailModal}>
                    <LargeModalContent onClick={e => e.stopPropagation()}>
                        <LargeModalHeader>
                            <LargeModalTitle>{selectedProject.name}</LargeModalTitle>
                            <IconButton onClick={closeDetailModal}><MdClose size={24} /></IconButton>
                        </LargeModalHeader>
                        <LargeModalBody>
                            <LeftPane>
                                {sessions.map(session => (
                                    <SessionItem
                                        key={session.session_id}
                                        isSelected={selectedSessionId === session.session_id}
                                        onClick={() => handleSessionClick(session.session_id)}
                                    >
                                        <SessionId>{session.session_id}</SessionId>
                                        <SessionMeta>
                                            <span>{session.user_name}</span>
                                            <Badge type="status" value={session.status}>{session.status}</Badge>
                                        </SessionMeta>
                                    </SessionItem>
                                ))}
                                {sessions.length === 0 && (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>세션이 없습니다.</div>
                                )}
                            </LeftPane>
                            <RightPane>
                                {selectedSessionId ? (
                                    <>
                                        {(() => {
                                            const session = sessions.find(s => s.session_id === selectedSessionId);
                                            return session ? (
                                                <DetailHeader>
                                                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>세션 상세 정보</div>
                                                    <DetailGrid>
                                                        <DetailItem><DetailLabel>Session ID</DetailLabel><DetailValue>{session.session_id}</DetailValue></DetailItem>
                                                        <DetailItem><DetailLabel>User</DetailLabel><DetailValue>{session.user_name}</DetailValue></DetailItem>
                                                        <DetailItem><DetailLabel>Status</DetailLabel><DetailValue><Badge type="status" value={session.status}>{session.status}</Badge></DetailValue></DetailItem>
                                                        <DetailItem><DetailLabel>Type</DetailLabel><DetailValue><Badge type="type" value={session.session_type}>{session.session_type}</Badge></DetailValue></DetailItem>
                                                        <DetailItem><DetailLabel>Start Time</DetailLabel><DetailValue>{new Date(session.start_time).toLocaleString()}</DetailValue></DetailItem>
                                                        <DetailItem><DetailLabel>End Time</DetailLabel><DetailValue>{session.end_time ? new Date(session.end_time).toLocaleString() : '-'}</DetailValue></DetailItem>
                                                    </DetailGrid>
                                                </DetailHeader>
                                            ) : null;
                                        })()}
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>세션 로그</div>
                                            <LogTable>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '60px' }}>Seq</th>
                                                        <th style={{ width: '80px' }}>Type</th>
                                                        <th>Content (Path)</th>
                                                        <th style={{ width: '120px' }}>Server</th>
                                                        <th style={{ width: '180px' }}>Config</th>
                                                        <th style={{ width: '140px' }}>Time</th>
                                                        <th style={{ width: '70px' }}>Tokens</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentSessionLogs.map(log => (
                                                        <React.Fragment key={log.log_sequence}>
                                                            <tr>
                                                                <td rowSpan={2} style={{ verticalAlign: 'middle' }}>{log.log_sequence}</td>
                                                                <td><span style={{ color: '#3730a3', fontWeight: '500' }}>User</span></td>
                                                                <td>{log.request_prompt_s3_path}</td>
                                                                <td rowSpan={2} style={{ verticalAlign: 'middle', fontSize: '12px' }}>
                                                                    <div style={{ color: theme.colors.textSecondary }}>{log.deployment_server || '-'}</div>
                                                                </td>
                                                                <td rowSpan={2} style={{ verticalAlign: 'middle', fontSize: '11px', color: theme.colors.textSecondary }}>
                                                                    <div>Temp: {log.config_temperature ?? 1.0}</div>
                                                                    <div>MaxT: {log.config_max_tokens ?? 4096}</div>
                                                                    <div>TopP: {log.config_top_p ?? 0.8}</div>
                                                                    <div>TopK: {log.config_top_k ?? 50}</div>
                                                                </td>
                                                                <td>{new Date(log.request_time).toLocaleString()}</td>
                                                                <td rowSpan={2} style={{ verticalAlign: 'middle' }}>{log.token_used}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><span style={{ color: '#16a34a', fontWeight: '500' }}>System</span></td>
                                                                <td>{log.response_s3_path}</td>
                                                                <td>{new Date(log.response_time).toLocaleString()}</td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                                    {currentSessionLogs.length === 0 && (
                                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>로그가 없습니다.</td></tr>
                                                    )}
                                                </tbody>
                                            </LogTable>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                        세션을 선택하여 상세 정보를 확인하세요.
                                    </div>
                                )}
                            </RightPane>
                        </LargeModalBody>
                    </LargeModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default ProjectPage;