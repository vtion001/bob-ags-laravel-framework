import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import CTMIntegrationsCard from '../components/settings/CTMIntegrationsCard';
import PreferencesCard from '../components/settings/PreferencesCard';
import SyncSettingsCard from '../components/settings/SyncSettingsCard';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import Card from '../components/ui/Card';
import { useSettings } from '../hooks/settings/useSettings';

export default function Settings({ auth }: PageProps) {
    const {
        settings,
        setSettings,
        isSaving,
        saveMessage,
        error,
        handleSave,
        handleClearCredentials,
    } = useSettings();

    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">Settings</h1>
                    <p className="text-navy-500 mt-1">Manage your account and preferences</p>
                </div>

                {saveMessage && (
                    <div className="mb-4 px-4 py-3 rounded bg-green-50 text-green-800 text-sm">
                        {saveMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Profile Section */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-bold text-navy-900 mb-4">Profile</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white text-2xl font-bold">
                            {auth?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-navy-900 font-semibold text-lg">{auth?.name || 'User'}</p>
                            <p className="text-navy-500 text-sm">{auth?.email || 'No email'}</p>
                        </div>
                    </div>
                </Card>

                <CTMIntegrationsCard
                    settings={settings}
                    setSettings={setSettings}
                    isSaving={isSaving}
                    onSave={handleSave}
                />

                <SyncSettingsCard
                    settings={settings}
                    setSettings={setSettings}
                    isSaving={isSaving}
                    onSave={handleSave}
                />

                <PreferencesCard
                    settings={settings}
                    setSettings={setSettings}
                    isSaving={isSaving}
                    onSave={handleSave}
                />

                <DangerZoneCard onClearCredentials={handleClearCredentials} />
            </div>
        </Layout>
    );
}
