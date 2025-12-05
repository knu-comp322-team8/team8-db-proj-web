import { useEffect } from 'react';
import styled from 'styled-components';
import { useDataStore } from '../store/useDataStore';
import { theme } from '../styles/theme';
import { Card } from '../components/common/Card';
import {
    MdWarning, MdCheckCircle, MdError, MdPerson, MdBusiness,
    MdMemory, MdCloudOff, MdTrendingUp, MdList
} from 'react-icons/md';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const WidgetCard = styled(Card)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 320px; /* Fixed height for consistency */
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const WidgetTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WidgetContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const MetricValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  height: 100%;
  padding-right: 4px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: ${theme.colors.background};
  border-radius: 8px;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
`;

const ItemSub = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS: Record<string, string> = {
    'Active': '#10B981', // Green
    'Error': '#EF4444', // Red
    'Maintenance': '#F59E0B', // Amber
    'Stopped': '#6B7280' // Gray
};

const Dashboard = () => {
    const { dashboardStats, fetchDashboardStats } = useDataStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    if (!dashboardStats) {
        return <div>Loading dashboard...</div>;
    }

    // Prepare Data for Charts
    const deploymentData = dashboardStats.deploymentStatus.map(item => ({
        name: item.status,
        value: item.count
    }));

    const roleData = dashboardStats.roleDistribution
        .map(item => ({
            name: item.role,
            value: item.count
        }))
        .sort((a, b) => b.value - a.value);

    const projectData = dashboardStats.projectsByDept.map(item => ({
        name: item.department_name,
        count: item.project_count
    }));

    const gpuData = dashboardStats.gpuUsage.map(item => ({
        name: item.environment,
        gpu: item.avg_gpu,
        deployments: item.deployment_count
    }));

    return (
        <PageContainer>
            <Header>
                <Title>통합 관제 대시보드</Title>
            </Header>

            {/* Row 1: System Health & Infrastructure */}
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.textSecondary, marginTop: '8px' }}>시스템 및 인프라 현황</h2>
            <Grid>
                {/* 1. Deployment Status */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdCheckCircle /> 배포 상태</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deploymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={(data) => {
                                        if (data.name === 'Error') {
                                            navigate('/deployments?status=Error'); // Assuming query param support
                                        }
                                    }}
                                    cursor="pointer"
                                >
                                    {deploymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 2. GPU Resource Usage */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdMemory /> GPU 리소스 사용량</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gpuData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="gpu" name="Avg GPU" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="deployments" name="Count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 3. Idle Models */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdCloudOff /> 미배포 모델 (유휴 자원)</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <MetricValue style={{ color: dashboardStats.idleModelsCount > 0 ? '#F59E0B' : theme.colors.textSecondary }}>
                            {dashboardStats.idleModelsCount}
                            <span style={{ fontSize: '16px', marginLeft: '8px', color: theme.colors.textSecondary }}>개</span>
                        </MetricValue>
                        {dashboardStats.idleModelsCount > 0 && (
                            <div style={{ textAlign: 'center', color: '#F59E0B', fontSize: '14px', marginTop: '-40px' }}>
                                리소스 정리가 필요합니다.
                            </div>
                        )}
                    </WidgetContent>
                </WidgetCard>
            </Grid>

            {/* Row 2: Organizational Analytics */}
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.textSecondary, marginTop: '8px' }}>조직 및 프로젝트 분석</h2>
            <Grid>
                {/* 4. User Role Distribution */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdPerson /> 사용자 역할 분포</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent, index }) => index < 5 ? `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%` : null}
                                >
                                    {roleData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 5. Projects by Department */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdBusiness /> 부서별 프로젝트</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" fill={theme.colors.primary} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 6. Key Stakeholders */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdPerson /> 주요 이해관계자</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ListContainer>
                            {dashboardStats.stakeholders.map((user) => (
                                <ListItem key={user.user_id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: '#EEF2FF', color: theme.colors.primary,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <MdPerson />
                                        </div>
                                        <ItemInfo>
                                            <ItemTitle>{user.user_name}</ItemTitle>
                                            <ItemSub>{user.role}</ItemSub>
                                        </ItemInfo>
                                    </div>
                                    <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                                        {user.department_name || 'N/A'}
                                    </div>
                                </ListItem>
                            ))}
                        </ListContainer>
                    </WidgetContent>
                </WidgetCard>
            </Grid>

            {/* Row 3: Monitoring & Cost Efficiency */}
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.textSecondary, marginTop: '8px' }}>모니터링 및 비용 효율성</h2>
            <Grid>
                {/* 7. High Cost Sessions */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdTrendingUp /> 고비용 세션 (Top 5)</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ListContainer>
                            {dashboardStats.highCostSessions.map((session) => (
                                <ListItem key={session.session_id}>
                                    <ItemInfo>
                                        <ItemTitle>{session.user_name || 'Unknown User'}</ItemTitle>
                                        <ItemSub>{new Date(session.request_time).toLocaleString()}</ItemSub>
                                    </ItemInfo>
                                    <div style={{ fontWeight: 700, color: '#EF4444' }}>
                                        {session.token_used.toLocaleString()} Tokens
                                    </div>
                                </ListItem>
                            ))}
                        </ListContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 8. Power Users */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdList /> 파워 유저 랭킹</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        <ListContainer>
                            {dashboardStats.powerUsers.map((user, index) => (
                                <ListItem key={user.user_id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            backgroundColor: index < 3 ? '#FEF3C7' : '#F3F4F6',
                                            color: index < 3 ? '#D97706' : '#6B7280',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '12px'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <ItemTitle>{user.user_name}</ItemTitle>
                                    </div>
                                    <div style={{ fontWeight: 600, color: theme.colors.primary }}>
                                        {user.session_count} Sessions
                                    </div>
                                </ListItem>
                            ))}
                        </ListContainer>
                    </WidgetContent>
                </WidgetCard>

                {/* 9. Live Issues Alert */}
                <WidgetCard>
                    <WidgetHeader>
                        <WidgetTitle><MdWarning /> 실시간 이슈 알림</WidgetTitle>
                    </WidgetHeader>
                    <WidgetContent>
                        {dashboardStats.liveIssues.length > 0 ? (
                            <ListContainer>
                                {dashboardStats.liveIssues.map((user) => (
                                    <ListItem
                                        key={user.user_id}
                                        style={{ cursor: 'pointer', border: '1px solid #FECACA', backgroundColor: '#FEF2F2' }}
                                        onClick={() => navigate(`/monitoring?userName=${user.user_name}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <MdError color="#EF4444" />
                                            <ItemInfo>
                                                <ItemTitle>{user.user_name}</ItemTitle>
                                                <ItemSub>{user.department_name || 'Unknown Dept'}</ItemSub>
                                            </ItemInfo>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
                                            Check Logs &rarr;
                                        </div>
                                    </ListItem>
                                ))}
                            </ListContainer>
                        ) : (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', height: '100%', color: '#10B981'
                            }}>
                                <MdCheckCircle size={48} />
                                <div style={{ marginTop: '16px', fontWeight: 600 }}>모든 시스템 정상</div>
                            </div>
                        )}
                    </WidgetContent>
                </WidgetCard>
            </Grid>
        </PageContainer>
    );
};

export default Dashboard;
