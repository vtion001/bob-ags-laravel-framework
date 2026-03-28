import { StatsCard } from './StatsCard';

export function Analytics() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Calls" value="0" />
            <StatsCard title="Avg Score" value="0" />
            <StatsCard title="Active Agents" value="0" />
            <StatsCard title="Total Duration" value="0h" />
        </div>
    );
}
