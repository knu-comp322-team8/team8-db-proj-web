import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../../store/useDataStore';
import { theme } from '../../styles/theme';
import { MdClose, MdDelete } from 'react-icons/md';

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

const Badge = styled.span<{ type?: 'status' | 'type'; value: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
        if (props.type === 'status') {
            switch (props.value) {
                case "진행중": return `background: #e0f2fe; color: #0284c7;`;
                case "완료": return `background: #dcfce7; color: #16a34a;`;
                case "오류": return `background: #fee2e2; color: #dc2626;`;
                case "중단": return `background: #f3f4f6; color: #4b5563;`;
                default: return `background: #f3f4f6; color: #4b5563;`;
            }
        } else {
            return `border: 1px solid ${theme.colors.border}; color: ${theme.colors.textSecondary};`;
        }
    }}
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

interface SessionDetailModalProps {
    sessionId: string;
    onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ sessionId, onClose }) => {
    const { currentSession, fetchSession, currentSessionLogs, fetchSessionLogs, deleteSessionLog } = useDataStore();

    useEffect(() => {
        if (sessionId) {
            fetchSession(sessionId);
            fetchSessionLogs(sessionId);
        }
    }, [sessionId, fetchSession, fetchSessionLogs]);

    const handleDeleteLog = async (sessionId: string, logSequence: number) => {
        if (confirm('정말 이 로그를 삭제하시겠습니까?')) {
            await deleteSessionLog(sessionId, logSequence);
        }
    };

    if (!currentSession) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>세션 상세 정보</ModalTitle>
                    <CloseButton onClick={onClose}><MdClose size={24} /></CloseButton>
                </ModalHeader>

                <DetailHeader>
                    <DetailGrid>
                        <DetailItem><DetailLabel>Session ID</DetailLabel><DetailValue>{currentSession.session_id}</DetailValue></DetailItem>
                        <DetailItem><DetailLabel>User</DetailLabel><DetailValue>{currentSession.user_name}</DetailValue></DetailItem>
                        <DetailItem><DetailLabel>Status</DetailLabel><DetailValue><Badge type="status" value={currentSession.status}>{currentSession.status}</Badge></DetailValue></DetailItem>
                        <DetailItem><DetailLabel>Type</DetailLabel><DetailValue><Badge type="type" value={currentSession.session_type}>{currentSession.session_type}</Badge></DetailValue></DetailItem>
                        <DetailItem><DetailLabel>Start Time</DetailLabel><DetailValue>{new Date(currentSession.start_time).toLocaleString()}</DetailValue></DetailItem>
                        <DetailItem><DetailLabel>End Time</DetailLabel><DetailValue>{currentSession.end_time ? new Date(currentSession.end_time).toLocaleString() : '-'}</DetailValue></DetailItem>
                    </DetailGrid>
                </DetailHeader>

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
                                            <IconButton onClick={() => handleDeleteLog(sessionId, log.log_sequence)} title="로그 삭제">
                                                <MdDelete size={16} />
                                            </IconButton>
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
    );
};
