import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import { useState } from 'react';
import CTMIntegrationsCard from '../components/settings/CTMIntegrationsCard';
import PreferencesCard from '../components/settings/PreferencesCard';
import SyncSettingsCard from '../components/settings/SyncSettingsCard';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import Card from '../components/ui/Card';
import { DEFAULT_SETTINGS, UserSettings } from '../lib/settings/types';

export default function Settings({ auth }: PageProps) {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulated save - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Settings saved successfully!');
    };

    const handleClearCredentials = async () => {
        if (!confirm('Are you sure you want to clear all stored credentials? This cannot be undone.')) {
            return;
        }
        setSettings(DEFAULT_SETTINGS);
        alert('All credentials have been cleared.');
    };

    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">Settings</h1>
                    <p className="text-navy-500 mt-1">Manage your account and preferences</p>
                </div>

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
