import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import { PhoneIcon, ArrowLeftIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useCallDetail } from '../hooks/calls/useCallDetail';
import CallerInfoCard from '../components/call-detail/CallerInfoCard';
import CallScoreCard from '../components/call-detail/CallScoreCard';
import TranscriptCard from '../components/call-detail/TranscriptCard';
import QAAnalysisCard from '../components/call-detail/QAAnalysisCard';
import ActionButtonsCard from '../components/call-detail/ActionButtonsCard';
import AudioPlayerCard from '../components/call-detail/AudioPlayerCard';

interface CallDetailPageProps extends PageProps {
    callId?: string | null;
    auth?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        is_god?: boolean;
    } | null;
}

function CallDetailContent({ callId }: { callId: string }) {
    const {
        call,
        transcript,
        transcriptError,
        isTranscribing,
        analysis,
        isAnalyzing,
        isLoading,
        error,
        handleTranscribe,
        handleAnalyze,
        setAnalysis,
        updateCallNotes,
    } = useCallDetail(callId);

    if (isLoading) {
        return (
            <Card className="text-center py-16">
                <p className="text-navy-500 text-sm">Loading call details...</p>
            </Card>
        );
    }

    if (error || !call) {
        return (
            <Card className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <PhoneIcon className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-navy-700 mb-1">Call not found</h3>
                <p className="text-navy-500 text-sm">{error ?? 'This call could not be loaded.'}</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-6">
                <CallerInfoCard call={call} />
                {analysis && (
                    <CallScoreCard score={analysis.score} sentiment={analysis.sentiment} />
                )}
                <ActionButtonsCard
                    call={call}
                    onTranscribe={handleTranscribe}
                    onAnalyze={handleAnalyze}
                    isTranscribing={isTranscribing}
                    isAnalyzing={isAnalyzing}
                />
            </div>

            {/* Middle column */}
            <div className="lg:col-span-2 space-y-6">
                {call.recordingUrl && (
                    <AudioPlayerCard recordingUrl={call.recordingUrl} />
                )}
                <TranscriptCard
                    transcript={transcript}
                    transcriptError={transcriptError}
                    isTranscribing={isTranscribing}
                    onTranscribe={handleTranscribe}
                />
                {analysis && (
                    <QAAnalysisCard
                        analysis={analysis}
                        onUpdate={setAnalysis}
                    />
                )}
            </div>
        </div>
    );
}

export default function CallDetail({ auth, callId }: CallDetailPageProps) {
    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Link href="/history" className="text-navy-400 hover:text-navy-700">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Call Details</h1>
                        <p className="text-navy-500 mt-1">
                            {callId ? `Call #${callId}` : 'Select a call from history to view details'}
                        </p>
                    </div>
                </div>

                {callId ? (
                    <CallDetailContent callId={callId} />
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
