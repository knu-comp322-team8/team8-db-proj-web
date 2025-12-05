import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import type { Department, User } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { Card } from '../components/common/Card';
import {
    MdFolder, MdFolderOpen, MdPerson,
    MdAdd, MdEdit, MdDelete, MdSearch
} from 'react-icons/md';

const PageContainer = styled.div`
  display: flex;
  height: calc(100vh - 128px); /* Adjust for header + padding */
  gap: 24px;
`;

// Left Panel: Department Tree
const TreePanel = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const TreeContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const TreeItem = styled.div<{ depth: number; selected: boolean }>`
  padding: 8px 12px;
  padding-left: ${({ depth }) => depth * 20 + 12}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? theme.colors.background : 'transparent')};
  border-radius: ${theme.borderRadius.button};
  color: ${({ selected }) => (selected ? theme.colors.primary : theme.colors.textPrimary)};
  font-weight: ${({ selected }) => (selected ? 600 : 400)};

  &:hover {
    background-color: ${theme.colors.background};
  }
`;

const IconButton = styled.button`
  padding: 4px;
  border-radius: 4px;
  color: ${theme.colors.textSecondary};
  &:hover {
    background-color: rgba(0,0,0,0.05);
    color: ${theme.colors.textPrimary};
  }
`;

// Right Panel: User Management
const ContentPanel = styled(Card)`
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DeptInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DeptTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const DeptManager = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PrimaryButton = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  padding: 10px 16px;
  border-radius: ${theme.borderRadius.button};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4338CA; /* Darker Indigo */
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
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
  font-size: 14px;
  position: sticky;
  top: 0;
  background-color: ${theme.colors.surface};
`;

const Td = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textPrimary};
  font-size: 14px;
`;

const Badge = styled.span<{ type: 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.badge};
  font-size: 12px;
  font-weight: 600;
  background-color: ${({ type }) => (type === 'active' ? '#D1FAE5' : '#F3F4F6')};
  color: ${({ type }) => (type === 'active' ? '#065F46' : '#374151')};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const UserOrg = () => {
    // State for Modals
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    // Removed unused editingUser/editingDept state as we use form state directly

    // Form State
    const [userForm, setUserForm] = useState<{ id: string; name: string; email: string; role: string; isActive: boolean; departmentId?: string }>({ id: '', name: '', email: '', role: 'Engineer', isActive: true });
    const [deptForm, setDeptForm] = useState({ id: '', name: '', managerId: '' });

    // Search State
    const [searchType, setSearchType] = useState<'name' | 'role'>('name');
    const [searchValue, setSearchValue] = useState('');

    const {
        departments, users,
        fetchDepartments, fetchUsers,
        createUser, updateUser, deleteUser,
        createDepartment, updateDepartment, deleteDepartment
    } = useDataStore();
    const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        fetchDepartments();
        // Do NOT fetch users initially as per requirement
    }, [fetchDepartments]);

    // Set initial selection based on URL query param
    useEffect(() => {
        if (departments.length > 0) {
            const params = new URLSearchParams(location.search);
            const deptIdParam = params.get('deptId');

            if (deptIdParam) {
                // Verify the dept exists
                const deptExists = departments.some(d => d.id === deptIdParam);
                if (deptExists) {
                    setSelectedDeptId(deptIdParam);
                    fetchUsers({ departmentId: deptIdParam }); // Fetch users for the linked department
                    return;
                }
            }

            // If no param, we don't select anything by default, keeping the right panel empty
        }
    }, [departments, location.search, fetchUsers]);

    const selectedDept = selectedDeptId && selectedDeptId !== 'all' ? departments.find(d => d.id === selectedDeptId) : null;
    // filteredUsers is no longer needed as 'users' in store now contains only the fetched users

    const handleCreateDept = () => {
        setModalMode('create');
        setDeptForm({ id: '', name: '', managerId: '' });
        setIsDeptModalOpen(true);
    };

    const handleEditDept = (dept: Department) => {
        setModalMode('edit');
        setDeptForm({ id: dept.id, name: dept.name, managerId: '' }); // Manager ID logic needs refinement if API returns it
        setIsDeptModalOpen(true);
    };

    const handleDeleteDept = async (id: string) => {
        if (window.confirm('정말 이 부서를 삭제하시겠습니까?')) {
            await deleteDepartment(id);
            if (selectedDeptId === id) setSelectedDeptId(null);
        }
    };

    const handleSubmitDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            await createDepartment({
                ...deptForm,
                manager: '', // Default value as it's required by interface but not in form
                projects: [] // Default value
            });
        } else {
            await updateDepartment(deptForm.id, deptForm);
        }
        setIsDeptModalOpen(false);
    };

    const handleCreateUser = () => {
        setModalMode('create');
        setUserForm({
            id: '', name: '', email: '', role: 'Engineer', isActive: true,
            departmentId: (selectedDeptId === 'all' || !selectedDeptId) ? undefined : selectedDeptId
        });
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setModalMode('edit');
        setUserForm({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            departmentId: user.departmentId
        });
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('정말 이 사용자를 삭제하시겠습니까?')) {
            const refreshParams = (selectedDeptId && selectedDeptId !== 'all')
                ? { departmentId: selectedDeptId }
                : undefined;
            await deleteUser(id, refreshParams);
        }
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = {
            ...userForm,
            departmentId: userForm.departmentId || undefined // Convert null to undefined
        };

        const refreshParams = (selectedDeptId && selectedDeptId !== 'all')
            ? { departmentId: selectedDeptId }
            : undefined;

        if (modalMode === 'edit') {
            await updateUser(userForm.id, userData, refreshParams);
        } else {
            await createUser(userData, refreshParams);
        } setIsUserModalOpen(false);
    };

    const renderTree = (depts: Department[], depth = 0) => {
        return (
            <>
                {/* All Departments Option */}
                {depth === 0 && (
                    <TreeItem
                        depth={depth}
                        selected={selectedDeptId === 'all'}
                        onClick={() => {
                            setSelectedDeptId('all');
                            fetchUsers(); // Fetch all users
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedDeptId === 'all' ? <MdFolderOpen /> : <MdFolder />}
                            전체부서 직원목록
                        </div>
                    </TreeItem>
                )}

                {depts.map((dept) => (
                    <div key={dept.id}>
                        <TreeItem
                            depth={depth}
                            selected={selectedDeptId === dept.id}
                            onClick={() => {
                                setSelectedDeptId(dept.id);
                                fetchUsers({ departmentId: dept.id }); // Fetch users for this department
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {selectedDeptId === dept.id ? <MdFolderOpen /> : <MdFolder />}
                                {dept.name}
                            </div>
                            {selectedDeptId === dept.id && (
                                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '4px' }}>
                                    <IconButton title="Edit Department" onClick={() => handleEditDept(dept)}><MdEdit size={14} /></IconButton>
                                    <IconButton title="Delete Department" onClick={() => handleDeleteDept(dept.id)}><MdDelete size={14} /></IconButton>
                                </div>
                            )}
                        </TreeItem>
                        {/* Recursive call for sub-departments would go here if implemented */}
                    </div>
                ))}
            </>
        );
    };

    return (
        <PageContainer>
            {/* Left Panel: Department Tree */}
            <TreePanel>
                <PanelHeader>
                    <PanelTitle>부서 목록</PanelTitle>
                    <IconButton title="부서 추가" onClick={handleCreateDept}><MdAdd size={20} /></IconButton>
                </PanelHeader>
                <TreeContent>
                    {renderTree(departments)}
                </TreeContent>
            </TreePanel>

            {/* Right Panel: User Management */}
            <ContentPanel>
                {selectedDeptId ? (
                    <>
                        <ContentHeader>
                            <DeptInfo>
                                <DeptTitle>
                                    {selectedDeptId === 'all' ? '전체 사용자' : (selectedDept?.name || 'Unknown Department')}
                                </DeptTitle>
                                {selectedDeptId !== 'all' && selectedDept && (
                                    <DeptManager>
                                        <MdPerson size={16} />
                                        관리자: <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>{selectedDept.manager}</span>
                                    </DeptManager>
                                )}
                            </DeptInfo>

                            <SearchContainer>
                                <SearchTypeSelect
                                    value={searchType}
                                    onChange={(e) => {
                                        setSearchType(e.target.value as 'name' | 'role');
                                        setSearchValue(''); // Reset value on type change
                                    }}
                                >
                                    <option value="name">이름</option>
                                    <option value="role">역할</option>
                                </SearchTypeSelect>

                                <SearchInputWrapper>
                                    {searchType === 'name' ? (
                                        <SearchTextInput
                                            placeholder="검색어 입력 (Enter)"
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const deptId = selectedDeptId === 'all' ? undefined : selectedDeptId;
                                                    fetchUsers({ departmentId: deptId || undefined, userName: searchValue });
                                                }
                                            }}
                                        />
                                    ) : (
                                        <SearchRoleSelect
                                            value={searchValue}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSearchValue(val);
                                                const deptId = selectedDeptId === 'all' ? undefined : selectedDeptId;
                                                fetchUsers({ departmentId: deptId || undefined, role: val });
                                            }}
                                        >
                                            <option value="">역할 선택</option>
                                            <option value="Business Analyst">Business Analyst</option>
                                            <option value="Customer Success">Customer Success</option>
                                            <option value="Data Analyst">Data Analyst</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="DevOps Engineer">DevOps Engineer</option>
                                            <option value="Engineer">Engineer</option>
                                            <option value="Finance Analyst">Finance Analyst</option>
                                            <option value="HR Specialist">HR Specialist</option>
                                            <option value="Intern">Intern</option>
                                            <option value="ML Engineer">ML Engineer</option>
                                            <option value="MLOps Engineer">MLOps Engineer</option>
                                            <option value="Operations Manager">Operations Manager</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="QA Engineer">QA Engineer</option>
                                            <option value="Quality Analyst">Quality Analyst</option>
                                            <option value="Research Scientist">Research Scientist</option>
                                            <option value="SRE">SRE</option>
                                            <option value="Security Analyst">Security Analyst</option>
                                            <option value="Security Engineer">Security Engineer</option>
                                            <option value="Senior Engineer">Senior Engineer</option>
                                            <option value="Support Specialist">Support Specialist</option>
                                            <option value="Team Leader">Team Leader</option>
                                            <option value="UX Designer">UX Designer</option>
                                        </SearchRoleSelect>
                                    )}
                                    <SearchIconWrapper>
                                        <MdSearch size={20} />
                                    </SearchIconWrapper>
                                </SearchInputWrapper>
                            </SearchContainer>

                            <PrimaryButton onClick={handleCreateUser}>
                                <MdAdd size={20} /> 사용자 추가
                            </PrimaryButton>
                        </ContentHeader>
                        <TableContainer>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>이름</Th>
                                        {selectedDeptId === 'all' && <Th>부서</Th>}
                                        <Th>이메일</Th>
                                        <Th>역할</Th>
                                        <Th>상태</Th>
                                        <Th style={{ width: '100px' }}>작업</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map(user => (
                                            <tr key={user.id}>
                                                <Td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                            backgroundColor: theme.colors.background, display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            <MdPerson color={theme.colors.textSecondary} />
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </Td>
                                                {selectedDeptId === 'all' && <Td>{user.departmentName || '-'}</Td>}
                                                <Td>{user.email}</Td>
                                                <Td>{user.role}</Td>
                                                <Td>
                                                    <Badge type={user.isActive ? 'active' : 'inactive'}>
                                                        {user.isActive ? '활성' : '비활성'}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <ActionGroup>
                                                        <IconButton title="사용자 수정" onClick={() => handleEditUser(user)}><MdEdit size={18} /></IconButton>
                                                        <IconButton title="사용자 삭제" onClick={() => handleDeleteUser(user.id)}><MdDelete size={18} /></IconButton>
                                                    </ActionGroup>
                                                </Td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <Td colSpan={selectedDeptId === 'all' ? 6 : 5} style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: '48px' }}>
                                                사용자가 없습니다.
                                            </Td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </TableContainer>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.colors.textSecondary }}>
                        부서를 선택하여 사용자를 조회하세요
                    </div>
                )}
            </ContentPanel>

            {/* Department Modal */}
            {
                isDeptModalOpen && (
                    <ModalOverlay>
                        <ModalContent>
                            <h3>{modalMode === 'create' ? '부서 생성' : '부서 수정'}</h3>
                            <form onSubmit={handleSubmitDept}>

                                <FormGroup>
                                    <Label>부서명</Label>
                                    <Input
                                        value={deptForm.name}
                                        onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <Button type="button" onClick={() => setIsDeptModalOpen(false)}>취소</Button>
                                    <PrimaryButton as="button" type="submit">저장</PrimaryButton>
                                </div>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )
            }

            {/* User Modal */}
            {
                isUserModalOpen && (
                    <ModalOverlay>
                        <ModalContent>
                            <h3>{modalMode === 'create' ? '사용자 생성' : '사용자 수정'}</h3>
                            <form onSubmit={handleSubmitUser}>

                                <FormGroup>
                                    <Label>이름</Label>
                                    <Input
                                        value={userForm.name}
                                        onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>이메일</Label>
                                    <Input
                                        type="email"
                                        value={userForm.email}
                                        onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                {/* Password field removed as per request */}
                                <FormGroup>
                                    <Label>역할</Label>
                                    <Select
                                        value={userForm.role}
                                        onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                    >
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="Customer Success">Customer Success</option>
                                        <option value="Data Analyst">Data Analyst</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                        <option value="Engineer">Engineer</option>
                                        <option value="Finance Analyst">Finance Analyst</option>
                                        <option value="HR Specialist">HR Specialist</option>
                                        <option value="Intern">Intern</option>
                                        <option value="ML Engineer">ML Engineer</option>
                                        <option value="MLOps Engineer">MLOps Engineer</option>
                                        <option value="Operations Manager">Operations Manager</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="QA Engineer">QA Engineer</option>
                                        <option value="Quality Analyst">Quality Analyst</option>
                                        <option value="Research Scientist">Research Scientist</option>
                                        <option value="SRE">SRE</option>
                                        <option value="Security Analyst">Security Analyst</option>
                                        <option value="Security Engineer">Security Engineer</option>
                                        <option value="Senior Engineer">Senior Engineer</option>
                                        <option value="Support Specialist">Support Specialist</option>
                                        <option value="Team Leader">Team Leader</option>
                                        <option value="UX Designer">UX Designer</option>
                                    </Select>
                                </FormGroup>
                                {modalMode === 'edit' && (
                                    <FormGroup>
                                        <Label>상태</Label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    checked={userForm.isActive}
                                                    onChange={() => setUserForm({ ...userForm, isActive: true })}
                                                /> 활성
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    checked={!userForm.isActive}
                                                    onChange={() => setUserForm({ ...userForm, isActive: false })}
                                                /> 비활성
                                            </label>
                                        </div>
                                    </FormGroup>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <Button type="button" onClick={() => setIsUserModalOpen(false)}>취소</Button>
                                    <PrimaryButton as="button" type="submit">저장</PrimaryButton>
                                </div>
                            </form>
                        </ModalContent>
                    </ModalOverlay>
                )
            }
        </PageContainer >
    );
};

export default UserOrg;

// Modal Styles
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
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: ${theme.borderRadius.button};
  border: 1px solid ${theme.colors.border};
  background-color: white;
  &:hover {
    background-color: ${theme.colors.background};
  }
`;

// Search Styles
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto; /* Push to the right, but before the button */
  margin-right: 16px;
`;

const SearchTypeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  background-color: white;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 240px;
`;

const SearchTextInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  padding-right: 36px; /* Space for icon */
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SearchRoleSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  padding-right: 36px; /* Space for icon */
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.button};
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  background-color: white;
  appearance: none; /* Hide default arrow to use our icon */
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  right: 8px;
  color: ${theme.colors.textSecondary};
  pointer-events: none;
  display: flex;
  align-items: center;
`;
