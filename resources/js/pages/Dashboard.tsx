import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import { DashboardHeader } from '../components/dashboard';
import { DashboardStats } from '../components/dashboard';
import { DashboardRecentCalls } from '../components/dashboard';
import AgentAssignmentWarning from '../components/dashboard/AgentAssignmentWarning';
import Card from '../components/ui/Card';
import { PhoneIcon } from 'lucide-react';
import { useDashboard } from '../hooks/dashboard/useDashboard';

interface DashboardPageProps extends PageProps {
    auth?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        is_god?: boolean;
    } | null;
}

export default function Dashboard({ auth }: DashboardPageProps) {
    const {
        isLoading,
        isRefreshing,
        isAnalyzing,
        analyzeProgress,
        autoRefresh,
        userGroups,
        allAgents,
        selectedGroup,
        selectedAgent,
        timeRange,
        setTimeRange,
        stats,
        recentCalls,
        liveMeta,
        handleGroupChange,
        handleAgentChange,
        handleSyncNow,
        toggleAutoRefresh,
        handleAnalyze,
        getAvailableAgents,
    } = useDashboard();

    const isAdmin = liveMeta?.isAdmin ?? auth?.role === 'admin' ?? false;
    const assignedAgentId = liveMeta?.assignedAgentId ?? null;
    const assignedGroupId = liveMeta?.assignedGroupId ?? null;

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
                    getAvailableAgents={getAvailableAgents}
                    onSyncNow={handleSyncNow}
                    isRefreshing={isRefreshing}
                    autoRefresh={autoRefresh}
                    onToggleAutoRefresh={toggleAutoRefresh}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                />

                <AgentAssignmentWarning
                    assignedAgentId={assignedAgentId}
                    assignedGroupId={assignedGroupId}
                    isAdmin={isAdmin}
                />

                <DashboardStats
                    totalCalls={stats.totalCalls}
                    analyzed={stats.analyzed}
                    hotLeads={stats.hotLeads}
                    avgScore={stats.avgScore}
                />

                {isLoading ? (
                    <Card className="text-center py-16">
                        <p className="text-navy-500 text-sm">Loading calls...</p>
                    </Card>
                ) : recentCalls.length === 0 ? (
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
                        assignedLabel={null}
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
