interface Call {
    id: string;
    agent_name: string;
    duration: number;
    score: number;
    date: string;
}

interface CallTableProps {
    calls?: Call[];
}

export default function CallTable({ calls = [] }: CallTableProps) {
    if (calls.length === 0) {
        return <div className="text-center py-8 text-gray-500">No calls found</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call) => (
                        <tr key={call.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{call.agent_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{call.duration}s</td>
                            <td className="px-6 py-4 whitespace-nowrap">{call.score}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{call.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
