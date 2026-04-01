import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import { ClipboardListIcon } from 'lucide-react';

export default function QALogs({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">QA Logs</h1>
                    <p className="text-navy-500 mt-1">View quality assurance logs and analysis</p>
                </div>
                <Card className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                        <ClipboardListIcon className="w-8 h-8 text-navy-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-700 mb-1">No QA logs</h3>
                    <p className="text-navy-500 text-sm">Quality assurance logs will appear here</p>
                </Card>
            </div>
        </Layout>
    );
}
