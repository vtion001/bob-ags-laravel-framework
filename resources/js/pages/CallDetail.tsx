import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import { PhoneIcon } from 'lucide-react';

export default function CallDetail({ auth, callId }: PageProps & { callId?: string }) {
    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">Call Details</h1>
                    <p className="text-navy-500 mt-1">View detailed analysis of a specific call</p>
                </div>
                {callId ? (
                    <Card className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                            <PhoneIcon className="w-8 h-8 text-navy-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-700 mb-1">Call ID: {callId}</h3>
                        <p className="text-navy-500 text-sm">Detailed call analysis will appear here</p>
                    </Card>
                ) : (
                    <Card className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                            <PhoneIcon className="w-8 h-8 text-navy-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-700 mb-1">No call selected</h3>
                        <p className="text-navy-500 text-sm">Select a call from history to view details</p>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
