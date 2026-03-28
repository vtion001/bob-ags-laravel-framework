import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';

export default function Dashboard({ auth }: PageProps) {
    return (
        <Layout auth={auth}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </div>
        </Layout>
    );
}
