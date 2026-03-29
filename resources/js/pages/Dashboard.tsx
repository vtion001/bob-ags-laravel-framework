import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import { DashboardHeader } from '../components/dashboard';
import { DashboardStats } from '../components/dashboard';
import { DashboardRecentCalls } from '../components/dashboard';
import AgentAssignmentWarning from '../components/dashboard/AgentAssignmentWarning';
import Card from '../components/ui/Card';
import { PhoneIcon } from 'lucide-react';
import { useState } from 'react';

interface DashboardStatsData {
    totalCalls: number;
    analyzed: number;
    hotLeads: number;
    avgScore: string;
}

interface DashboardPageProps extends PageProps {
    auth?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export default function Dashboard({ auth }: DashboardPageProps) {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Placeholder data - will be replaced with actual API data
    const stats: DashboardStatsData = {
        totalCalls: 0,
        analyzed: 0,
        hotLeads: 0,
        avgScore: '0',
    };

    const recentCalls: any[] = [];
    const userGroups: any[] = [];
    const allAgents: any[] = [];

    const isAdmin = true;
    const assignedLabel = null;

    const handleGroupChange = (groupId: string) => {
        setSelectedGroup(groupId);
        setSelectedAgent('all');
    };

    const handleAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
    };

    const handleSyncNow = async () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const toggleAutoRefresh = () => setAutoRefresh(!autoRefresh);

    return (
        <Layout auth={auth}>
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <DashboardHeader
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    isAdmin={isAdmin}
                    userGroups={userGroups}
                    selectedGroup={selectedGroup}
                    onGroupChange={handleGroupChange}
                    selectedAgent={selectedAgent}
                    onAgentChange={handleAgentChange}
                    allAgents={allAgents}
                    getAvailableAgents={() => allAgents}
                    onSyncNow={handleSyncNow}
                    isRefreshing={isRefreshing}
                    autoRefresh={autoRefresh}
                    onToggleAutoRefresh={toggleAutoRefresh}
                    onAnalyze={() => {}}
                    isAnalyzing={false}
                />

                <AgentAssignmentWarning
                    assignedAgentId={null}
                    assignedGroupId={null}
                    isAdmin={isAdmin}
                />

                <DashboardStats
                    totalCalls={stats.totalCalls}
                    analyzed={stats.analyzed}
                    hotLeads={stats.hotLeads}
                    avgScore={stats.avgScore}
                />

                {recentCalls.length === 0 ? (
                    <Card className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                            <PhoneIcon className="w-8 h-8 text-navy-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-700 mb-1">No calls found</h3>
                        <p className="text-navy-500 text-sm">Calls will appear here once detected</p>
                    </Card>
                ) : (
                    <DashboardRecentCalls
                        calls={recentCalls}
                        isAdmin={isAdmin}
                        assignedLabel={assignedLabel}
                        userGroups={userGroups}
                        selectedGroup={selectedGroup}
                        allAgents={allAgents}
                        selectedAgent={selectedAgent}
                        timeRange={timeRange}
                    />
                )}
            </div>
        </Layout>
    );
}
