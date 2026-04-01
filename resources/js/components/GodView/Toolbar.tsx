import { useState, useEffect } from 'react';

interface LogEntry {
    id: number;
    type: 'request' | 'query' | 'error' | 'event';
    action: string;
    method?: string;
    url?: string;
    status_code?: number;
    duration_ms?: number;
    context?: any;
    created_at: string;
}

interface ToolbarProps {
    isGod?: boolean;
}

export default function GodViewToolbar({ isGod = false }: ToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState({ requests: 0, queries: 0, errors: 0, events: 0 });
    const [activeTab, setActiveTab] = useState<'all' | 'request' | 'query' | 'error' | 'event'>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/godview/data?limit=50', {
                credentials: 'include',
            });
            const data = await response.json();
            setLogs(data.logs || []);
            setStats(data.stats || { requests: 0, queries: 0, errors: 0, events: 0 });
        } catch (error) {
            console.error('Failed to fetch GodView data:', error);
        }
        setLoading(false);
    };

    const filteredLogs = logs.filter(log => {
        if (activeTab === 'all') return true;
        return log.type === activeTab;
    });

    const formatTime = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
    const formatDate = (date: string) => new Date(date).toLocaleTimeString();

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'request': return 'text-navy-400';
            case 'query': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'event': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getMethodColor = (method?: string) => {
        switch (method) {
            case 'GET': return 'bg-green-500/20 text-green-400';
            case 'POST': return 'bg-blue-500/20 text-blue-400';
            case 'PUT': return 'bg-yellow-500/20 text-yellow-400';
            case 'DELETE': return 'bg-red-500/20 text-red-400';
            case 'PATCH': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (!isGod) {
        return null;
    }

    return (
        <>
            {/* Collapsed Toolbar */}
            <div
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-navy-800 text-white px-3 py-2 rounded-full shadow-lg cursor-pointer hover:bg-navy-700 flex items-center gap-2 text-sm font-mono"
            >
                <span className="font-bold">GV</span>
                {stats.errors > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {stats.errors}
                    </span>
                )}
                <span className="text-navy-300 text-xs">
                    {stats.requests + stats.queries} ops
                </span>
            </div>

            {/* Expanded Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative bg-navy-900 border border-navy-700 rounded-tl-xl shadow-2xl w-full max-w-4xl max-h-[70vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700 bg-navy-800 rounded-tl-xl">
                            <div className="flex items-center gap-4">
                                <h2 className="text-white font-bold text-lg">GodView</h2>
                                <div className="flex gap-3 text-sm">
                                    <span className="text-navy-300">
                                        <span className="text-green-400">{stats.requests}</span> requests
                                    </span>
                                    <span className="text-navy-300">
                                        <span className="text-blue-400">{stats.queries}</span> queries
                                    </span>
                                    <span className="text-navy-300">
                                        <span className="text-red-400">{stats.errors}</span> errors
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchData}
                                    className="text-navy-400 hover:text-white text-sm px-2 py-1"
                                >
                                    Refresh
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-navy-400 hover:text-white text-xl leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-navy-700">
                            {(['all', 'request', 'query', 'error', 'event'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm capitalize ${
                                        activeTab === tab
                                            ? 'text-white border-b-2 border-navy-400 bg-navy-800'
                                            : 'text-navy-400 hover:text-white'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-32 text-navy-400">
                                    Loading...
                                </div>
                            ) : filteredLogs.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-navy-400">
                                    No logs available
                                </div>
                            ) : (
                                <div className="divide-y divide-navy-800">
                                    {filteredLogs.map(log => (
                                        <div key={log.id} className="px-4 py-2 hover:bg-navy-800/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs uppercase font-bold ${getTypeColor(log.type)}`}>
                                                        {log.type}
                                                    </span>
                                                    {log.method && (
                                                        <span className={`text-xs px-1.5 py-0.5 rounded ${getMethodColor(log.method)}`}>
                                                            {log.method}
                                                        </span>
                                                    )}
                                                    <span className="text-white text-sm font-mono truncate max-w-md">
                                                        {log.action}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-navy-400">
                                                    {log.duration_ms && (
                                                        <span className={log.duration_ms > 1000 ? 'text-red-400' : ''}>
                                                            {formatTime(log.duration_ms)}
                                                        </span>
                                                    )}
                                                    <span>{formatDate(log.created_at)}</span>
                                                </div>
                                            </div>
                                            {log.context && Object.keys(log.context).length > 0 && (
                                                <details className="mt-1">
                                                    <summary className="text-xs text-navy-500 cursor-pointer">
                                                        View context
                                                    </summary>
                                                    <pre className="mt-1 p-2 bg-navy-950 rounded text-xs text-navy-300 overflow-x-auto">
                                                        {JSON.stringify(log.context, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
