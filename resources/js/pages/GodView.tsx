import { useState, useEffect } from 'react';

interface LogEntry {
    id: number;
    type: 'request' | 'query' | 'error' | 'event';
    action: string;
    method?: string;
    url?: string;
    status_code?: number;
    duration_ms?: number;
    memory_mb?: number;
    context?: any;
    stack_trace?: string;
    created_at: string;
}

interface Stats {
    total_logs: number;
    requests: number;
    queries: number;
    errors: number;
    events: number;
}

interface PageProps {
    logs: LogEntry[];
    stats: Stats;
}

export default function GodView({ logs: initialLogs, stats: initialStats }: PageProps) {
    const [logs, setLogs] = useState<LogEntry[]>(initialLogs || []);
    const [stats, setStats] = useState<Stats>(initialStats || { total_logs: 0, requests: 0, queries: 0, errors: 0, events: 0 });
    const [activeTab, setActiveTab] = useState<'all' | 'request' | 'query' | 'error' | 'event'>('all');
    const [loading, setLoading] = useState(false);
    const [hours, setHours] = useState(24);

    useEffect(() => {
        fetchData();
    }, [hours]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/godview/data?hours=${hours}&limit=500`, {
                credentials: 'include',
            });
            const data = await response.json();
            setLogs(data.logs || []);
            setStats(data.stats || { total_logs: 0, requests: 0, queries: 0, errors: 0, events: 0 });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
        setLoading(false);
    };

    const handleClear = async () => {
        if (!confirm('Clear logs older than 7 days?')) return;
        try {
            const response = await fetch('/api/godview/clear?days=7', {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            alert(data.message);
            fetchData();
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (activeTab === 'all') return true;
        return log.type === activeTab;
    });

    const formatTime = (ms?: number) => {
        if (!ms) return '-';
        return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
    };

    const formatDate = (date: string) => new Date(date).toLocaleString();

    const getTypeBadge = (type: string) => {
        const colors = {
            request: 'bg-green-500/20 text-green-400 border border-green-500/30',
            query: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
            error: 'bg-red-500/20 text-red-400 border border-red-500/30',
            event: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        };
        return `px-2 py-0.5 rounded text-xs uppercase font-bold ${colors[type as keyof typeof colors] || colors.event}`;
    };

    const getMethodBadge = (method?: string) => {
        const colors: Record<string, string> = {
            GET: 'bg-green-500/20 text-green-400',
            POST: 'bg-blue-500/20 text-blue-400',
            PUT: 'bg-yellow-500/20 text-yellow-400',
            DELETE: 'bg-red-500/20 text-red-400',
            PATCH: 'bg-purple-500/20 text-purple-400',
        };
        return `px-1.5 py-0.5 rounded text-xs font-bold ${colors[method || ''] || 'bg-gray-500/20 text-gray-400'}`;
    };

    return (
        <div className="min-h-screen bg-navy-950 text-white">
            {/* Header */}
            <div className="bg-navy-900 border-b border-navy-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="bg-navy-700 px-3 py-1 rounded">GV</span>
                            GodView Dashboard
                        </h1>
                        <p className="text-navy-400 text-sm mt-1">
                            Activity tracking and debugging for Bob AGS
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="bg-navy-800 border border-navy-600 text-white px-3 py-2 rounded text-sm"
                        >
                            <option value={1}>Last 1 hour</option>
                            <option value={6}>Last 6 hours</option>
                            <option value={24}>Last 24 hours</option>
                            <option value={72}>Last 3 days</option>
                            <option value={168}>Last 7 days</option>
                        </select>
                        <button
                            onClick={fetchData}
                            className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded text-sm"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded text-sm"
                        >
                            Clear Old Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-6 py-4 grid grid-cols-5 gap-4">
                {[
                    { label: 'Total Logs', value: stats.total_logs, color: 'text-white' },
                    { label: 'Requests', value: stats.requests, color: 'text-green-400' },
                    { label: 'Queries', value: stats.queries, color: 'text-blue-400' },
                    { label: 'Errors', value: stats.errors, color: 'text-red-400' },
                    { label: 'Events', value: stats.events, color: 'text-yellow-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-navy-900 border border-navy-700 rounded-lg p-4">
                        <div className="text-navy-400 text-xs uppercase">{stat.label}</div>
                        <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-navy-700 flex gap-1">
                {(['all', 'request', 'query', 'error', 'event'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm capitalize ${
                            activeTab === tab
                                ? 'text-white border-b-2 border-navy-400 bg-navy-800/50'
                                : 'text-navy-400 hover:text-white'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="px-6 py-4">
                {loading ? (
                    <div className="text-center py-12 text-navy-400">Loading...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-navy-400">No logs found</div>
                ) : (
                    <div className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-navy-800 text-navy-300 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                    <th className="px-4 py-3 text-left">Method</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Duration</th>
                                    <th className="px-4 py-3 text-right">Memory</th>
                                    <th className="px-4 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-800">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-navy-800/30">
                                        <td className="px-4 py-3">
                                            {getTypeBadge(log.type)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-white max-w-md truncate">
                                            {log.action}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.method ? getMethodBadge(log.method) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.status_code ? (
                                                <span className={`text-xs ${
                                                    log.status_code < 400 ? 'text-green-400' :
                                                    log.status_code < 500 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                    {log.status_code}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            <span className={log.duration_ms && log.duration_ms > 1000 ? 'text-red-400' : 'text-navy-300'}>
                                                {formatTime(log.duration_ms)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-navy-400">
                                            {log.memory_mb ? `${log.memory_mb.toFixed(2)} MB` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-navy-400">
                                            {formatDate(log.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
