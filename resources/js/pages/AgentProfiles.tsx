import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import { useAgentProfiles } from '../hooks/dashboard/useAgentProfiles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useState } from 'react';
import { UsersIcon, PlusIcon, TrashIcon, EditIcon, RefreshCwIcon } from 'lucide-react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    is_god?: boolean;
    role?: string;
}

export default function AgentProfiles({ auth }: PageProps) {
    const typedAuth = auth as AuthUser | undefined;
    const isGodOrAdmin = typedAuth?.is_god === true || typedAuth?.role === 'admin' || typedAuth?.role === 'god';

    const {
        agents,
        ctmAgents,
        isLoading,
        isFetchingCTM,
        error,
        showForm,
        setShowForm,
        showCTMFetch,
        setShowCTMFetch,
        editingAgent,
        setEditingAgent,
        formData,
        setFormData,
        fetchAgents,
        fetchCTMAgents,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleAddCTMAgent,
        handleAddAllCTMAgents,
        resetForm,
    } = useAgentProfiles();

    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Agent Profiles</h1>
                        <p className="text-navy-500 mt-1">Manage agent profiles synced from CTM</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={fetchCTMAgents}
                            isLoading={isFetchingCTM}
                        >
                            <RefreshCwIcon className="w-4 h-4" />
                            Fetch from CTM
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Agent
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Agent Profiles Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-navy-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">CTM Agent ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-navy-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-navy-500">
                                            Loading agent profiles...
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mb-4">
                                                    <UsersIcon className="w-8 h-8 text-navy-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-navy-700 mb-1">No agent profiles</h3>
                                                <p className="text-navy-500 text-sm mb-4">Add agent profiles manually or fetch from CTM</p>
                                                <div className="flex gap-3">
                                                    <Button variant="secondary" size="sm" onClick={fetchCTMAgents}>
                                                        Fetch from CTM
                                                    </Button>
                                                    <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                                                        <PlusIcon className="w-4 h-4" />
                                                        Add Manually
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent.id} className="hover:bg-navy-50/50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-navy-900">{agent.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="text-sm text-navy-600 bg-navy-100 px-2 py-1 rounded">
                                                    {agent.agent_id || 'N/A'}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-navy-600">
                                                {agent.email || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    agent.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {agent.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(agent)}
                                                        className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-navy-100 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    {isGodOrAdmin && (
                                                        deleteConfirm === agent.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleDelete(agent.id)}
                                                                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                                                                    title="Confirm Delete"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(agent.id)}
                                                                className="p-1.5 text-navy-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Add/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                            <div className="px-6 py-4 border-b border-navy-200">
                                <h2 className="text-xl font-bold text-navy-900">
                                    {editingAgent ? 'Edit Agent Profile' : 'Add Agent Profile'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <Input
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter agent's full name"
                                    required
                                />
                                <Input
                                    label="CTM Agent ID"
                                    value={formData.agentId}
                                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                                    placeholder="e.g., 12345 or agent-uuid"
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="agent@example.com"
                                />
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                                <Input
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any additional notes..."
                                />
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="secondary" type="button" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        {editingAgent ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* CTM Fetch Modal */}
                {showCTMFetch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowCTMFetch(false)} />
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                            <div className="px-6 py-4 border-b border-navy-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-navy-900">CTM Agents</h2>
                                    <p className="text-navy-500 text-sm mt-1">
                                        {ctmAgents.length} agents found in CallTrackingMetrics
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCTMFetch(false)}
                                    className="text-navy-400 hover:text-navy-600 text-2xl leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {ctmAgents.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-navy-500">No agents found in CTM. Check your CTM credentials.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {ctmAgents.map((agent) => (
                                            <div
                                                key={agent.id}
                                                className="flex items-center justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-navy-900">{agent.name}</p>
                                                    <p className="text-sm text-navy-500">{agent.email || 'No email'}</p>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleAddCTMAgent(agent)}
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {ctmAgents.length > 0 && (
                                <div className="px-6 py-4 border-t border-navy-200">
                                    <Button
                                        variant="primary"
                                        size="md"
                                        className="w-full"
                                        onClick={handleAddAllCTMAgents}
                                    >
                                        Add All {ctmAgents.length} Agents
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
