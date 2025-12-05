import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDataStore, SessionStatus, SessionType } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { MdSearch, MdClose, MdDelete } from 'react-icons/md';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  align-items: center;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  min-width: 200px;
  
  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  min-width: 150px;
  background-color: white;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.primary};
    opacity: 0.9;
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
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.background};
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span<{ type?: 'status' | 'type'; value: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
        if (props.type === 'status') {
            switch (props.value) {
                case SessionStatus.IN_PROGRESS: return `background: #e0f2fe; color: #0284c7;`;
                case SessionStatus.COMPLETED: return `background: #dcfce7; color: #16a34a;`;
                case SessionStatus.ERROR: return `background: #fee2e2; color: #dc2626;`;
                case SessionStatus.STOPPED: return `background: #f3f4f6; color: #4b5563;`;
                default: return `background: #f3f4f6; color: #4b5563;`;
            }
        } else {
            return `border: 1px solid ${theme.colors.border}; color: ${theme.colors.textSecondary};`;
        }
    }}
`;

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
  width: 90%;
  height: 85%;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  padding: 4px;
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
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
  padding: 20px 24px;
  background-color: white;
  border-bottom: 1px solid ${theme.colors.border};
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

const Monitoring = () => {
    const { sessions, fetchSessions, currentSessionLogs, fetchSessionLogs, deleteSession, deleteSessionLog } = useDataStore();
    const [filters, setFilters] = useState({
        projectName: '',
        userName: '',
        type: '' as SessionType | '',
        status: '' as SessionStatus | ''
    });
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSearch = () => {
        fetchSessions({
            projectName: filters.projectName || undefined,
            userName: filters.userName || undefined,
            type: filters.type || undefined,
            status: filters.status || undefined
        });
    };

    const handleRowClick = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        fetchSessionLogs(sessionId);
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (confirm('정말 이 세션을 삭제하시겠습니까?')) {
            await deleteSession(sessionId);
            if (selectedSessionId === sessionId) {
                setSelectedSessionId(null);
            }
        }
    };

    const handleDeleteLog = async (sessionId: string, logSequence: number) => {
        if (confirm('정말 이 로그를 삭제하시겠습니까?')) {
            await deleteSessionLog(sessionId, logSequence);
        }
    };

    const closeModal = () => {
        setSelectedSessionId(null);
    };

    return (
        <Container>
            <Header>
                <Title>세션기록</Title>
                <Subtitle>세션 이력 및 상세 로그 분석</Subtitle>
            </Header>

            <FilterBar>
                <Input
                    placeholder="프로젝트명 검색"
                    value={filters.projectName}
                    onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
                />
                <Input
                    placeholder="사용자명 검색"
                    value={filters.userName}
                    onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
                />
                <Select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as SessionType })}
                >
                    <option value="">모든 타입</option>
                    {Object.values(SessionType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as SessionStatus })}
                >
                    <option value="">모든 상태</option>
                    {Object.values(SessionStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </Select>
                <Button onClick={handleSearch}>
                    <MdSearch size={20} />
                    검색
                </Button>
            </FilterBar>

            <TableContainer>
                <Table>
                    <thead>
                        <tr>
                            <Th>Session ID</Th>
                            <Th>Status</Th>
                            <Th>Type</Th>
                            <Th>Start Time</Th>
                            <Th>End Time</Th>
                            <Th>User</Th>
                            <Th>Project</Th>
                            <Th style={{ width: '50px' }}></Th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(session => (
                            <Tr key={session.session_id} onClick={() => handleRowClick(session.session_id)}>
                                <Td style={{ fontFamily: 'monospace' }}>{session.session_id.substring(0, 8)}...</Td>
                                <Td><Badge type="status" value={session.status}>{session.status}</Badge></Td>
                                <Td><Badge type="type" value={session.session_type}>{session.session_type}</Badge></Td>
                                <Td>{new Date(session.start_time).toLocaleString()}</Td>
                                <Td>{session.end_time ? new Date(session.end_time).toLocaleString() : '-'}</Td>
                                <Td>{session.user_name || session.user_id}</Td>
                                <Td>{session.project_name || '-'}</Td>
                                <Td>
                                    <IconButton onClick={(e) => handleDeleteSession(e, session.session_id)} title="삭제">
                                        <MdDelete size={18} />
                                    </IconButton>
                                </Td>
                            </Tr>
                        ))}
                        {sessions.length === 0 && (
                            <tr>
                                <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                                    데이터가 없습니다.
                                </Td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </TableContainer>

            {selectedSessionId && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>세션 상세 정보</ModalTitle>
                            <CloseButton onClick={closeModal}><MdClose size={24} /></CloseButton>
                        </ModalHeader>

                        {(() => {
                            const session = sessions.find(s => s.session_id === selectedSessionId);
                            return session ? (
                                <DetailHeader>
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

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f9fafb' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: theme.colors.textPrimary }}>세션 로그</div>
                            <LogTable>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>Seq</th>
                                        <th style={{ width: '80px' }}>Type</th>
                                        <th>Content (Path)</th>
                                        <th style={{ width: '120px' }}>Server</th>
                                        <th style={{ width: '180px' }}>Config</th>
                                        <th style={{ width: '150px' }}>Time</th>
                                        <th style={{ width: '70px' }}>Tokens</th>
                                        <th style={{ width: '50px' }}></th>
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
                                                <td rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                                    {selectedSessionId && (
                                                        <IconButton onClick={() => handleDeleteLog(selectedSessionId, log.log_sequence)} title="로그 삭제">
                                                            <MdDelete size={16} />
                                                        </IconButton>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span style={{ color: '#16a34a', fontWeight: '500' }}>System</span></td>
                                                <td>{log.response_s3_path}</td>
                                                <td>{new Date(log.response_time).toLocaleString()}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                    {currentSessionLogs.length === 0 && (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>로그가 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </LogTable>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default Monitoring;
