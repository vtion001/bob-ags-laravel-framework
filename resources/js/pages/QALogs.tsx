import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import { ClipboardListIcon, PhoneIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface QALog {
    id: string;
    callerNumber?: string;
    agent?: { name?: string };
    startTime?: string;
    duration?: number;
    score?: number;
    sentiment?: string;
    summary?: string;
    disposition?: string;
}

export default function QALogs({ auth }: PageProps) {
    const [logs, setLogs] = useState<QALog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/ctm/calls?per_page=50', { credentials: 'include' });
                if (!res.ok) throw new Error(`Failed to load calls: ${res.status}`);
                const data = await res.json();
                const calls: QALog[] = data.data ?? data.calls ?? [];
                // Only show calls that have been analyzed (have a score)
                setLogs(calls.filter((c: QALog) => c.score != null));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const getSentimentBadge = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return 'bg-green-100 text-green-700';
            case 'negative': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString();
    };

    const formatDuration = (secs?: number) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
    };

    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">QA Logs</h1>
                    <p className="text-navy-500 mt-1">Analyzed calls and quality assurance scores</p>
                </div>

                {isLoading && (
                    <Card className="text-center py-16">
                        <p className="text-navy-500 text-sm">Loading QA logs...</p>
                    </Card>
                )}

                {error && (
                    <Card className="text-center py-8">
                        <p className="text-red-600 text-sm">{error}</p>
                    </Card>
                )}

                {!isLoading && !error && logs.length === 0 && (
                    <Card className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                            <ClipboardListIcon className="w-8 h-8 text-navy-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-700 mb-1">No QA logs yet</h3>
                        <p className="text-navy-500 text-sm">
                            Analyzed calls will appear here. Go to{' '}
                            <Link href="/history" className="text-blue-600 underline">Call History</Link>
                            {' '}to analyze calls.
                        </p>
                    </Card>
                )}

                {!isLoading && logs.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Caller</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agent</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sentiment</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Summary</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(log.startTime)}</td>
                                        <td className="px-4 py-3 font-mono text-gray-900">{log.callerNumber ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-700">{log.agent?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDuration(log.duration)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-semibold ${(log.score ?? 0) >= 80 ? 'text-green-600' : (log.score ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {log.score ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.sentiment ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentBadge(log.sentiment)}`}>
                                                    {log.sentiment}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.summary ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/call-detail/${log.id}`}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}
