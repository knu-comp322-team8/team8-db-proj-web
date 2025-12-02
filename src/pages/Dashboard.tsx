import styled from 'styled-components';
import { Card } from '../components/common/Card';
import { theme } from '../styles/theme';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 400px;
`;

const ChartCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const SummaryCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryTitle = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const SummaryValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const SummaryUnit = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${theme.colors.textSecondary};
`;

const SummaryCard = ({ title, value, unit }: { title: string, value: string, unit?: string }) => (
    <Card>
        <SummaryCardContent>
            <SummaryTitle>{title}</SummaryTitle>
            <SummaryValue>
                {value} {unit && <SummaryUnit>{unit}</SummaryUnit>}
            </SummaryValue>
        </SummaryCardContent>
    </Card>
);

const dataTraffic = [
    { name: 'Mon', sessions: 400, tokens: 2400 },
    { name: 'Tue', sessions: 300, tokens: 1398 },
    { name: 'Wed', sessions: 200, tokens: 9800 },
    { name: 'Thu', sessions: 278, tokens: 3908 },
    { name: 'Fri', sessions: 189, tokens: 4800 },
    { name: 'Sat', sessions: 239, tokens: 3800 },
    { name: 'Sun', sessions: 349, tokens: 4300 },
];

const dataDeployment = [
    { name: 'Production', value: 400 },
    { name: 'Development', value: 300 },
];

const COLORS = [theme.colors.primary, theme.colors.active];

const Dashboard = () => {
    return (
        <DashboardContainer>
            {/* Summary Cards */}
            <SummaryGrid>
                <SummaryCard title="Total Users" value="1,234" />
                <SummaryCard title="Active Models" value="12" />
                <SummaryCard title="Total Sessions" value="8,543" />
                <SummaryCard title="GPU Usage" value="78" unit="%" />
            </SummaryGrid>

            {/* Charts */}
            <ChartSection>
                <ChartCard>
                    <ChartTitle>Traffic Trend</ChartTitle>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataTraffic}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="sessions" stroke={theme.colors.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                <ChartCard>
                    <ChartTitle>Deployment Status</ChartTitle>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataDeployment}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataDeployment.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </ChartSection>
        </DashboardContainer>
    );
};

export default Dashboard;
