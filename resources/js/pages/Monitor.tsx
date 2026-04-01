import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  RadioIcon,
  PhoneIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
  UserIcon,
  ClockIcon,
  MicIcon,
  StopCircleIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { useMonitorPage } from '../hooks/monitor/useMonitorPage';
import { useEffect, useState } from 'react';

interface MonitorProps extends PageProps {
  auth?: {
    id: number;
    name: string;
    email: string;
    is_god?: boolean;
    role?: string;
  } | null;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Monitor({ auth }: MonitorProps) {
  const {
    activeCalls,
    selectedCallId,
    selectedCallData,
    callsError,
    selectedGroup,
    setSelectedGroup,
    groups,
    filteredCalls,
    isMonitoring,
    isRecording,
    liveState,
    error,
    handleSelectCall,
    handleStartMonitoring,
    handleStopMonitoring,
    isViewerWithAssignment,
    hasAgentAssignment,
    gracePeriodRemaining,
    isInGracePeriod,
  } = useMonitorPage();

  const [showTranscript, setShowTranscript] = useState(true);

  const isAdmin = auth?.is_god === true || auth?.role === 'admin' || auth?.role === 'god';

  return (
    <Layout auth={auth}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Live Monitor</h1>
            <p className="text-navy-500 mt-1">
              Monitor active calls with real-time AI transcription
              {isViewerWithAssignment && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Auto-monitoring enabled
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isMonitoring && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-medium">Live</span>
                {isRecording && (
                  <span className="flex items-center gap-1 text-sm">
                    <MicIcon className="w-3 h-3" />
                    Recording
                  </span>
                )}
              </div>
            )}
            {isInGracePeriod && (
              <div className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                Call ended. Monitoring for {gracePeriodRemaining}s...
              </div>
            )}
          </div>
        </div>

        {callsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
            {callsError}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Calls List */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 bg-navy-50 border-b border-navy-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-navy-900">Active Calls</h2>
                  <span className="text-xs text-navy-500">{filteredCalls.length} calls</span>
                </div>
                {groups.length > 1 && (
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="mt-2 w-full text-sm border border-navy-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    <option value="All">All Groups</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="divide-y divide-navy-100 max-h-[calc(100vh-320px)] overflow-y-auto">
                {filteredCalls.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy-100 mb-3">
                      <PhoneIcon className="w-6 h-6 text-navy-400" />
                    </div>
                    <p className="text-sm text-navy-500">No active calls</p>
                  </div>
                ) : (
                  filteredCalls.map((call) => (
                    <button
                      key={call.id}
                      onClick={() => handleSelectCall(call)}
                      className={`w-full px-4 py-3 text-left hover:bg-navy-50 transition-colors ${
                        selectedCallId === call.id ? 'bg-navy-100' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {call.direction === 'inbound' ? (
                              <PhoneIncomingIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <PhoneOutgoingIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                            <span className="font-medium text-navy-900 truncate">
                              {(call.agent as any)?.name || (call.agent as any)?.id || 'Unknown Agent'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-navy-500 flex items-center gap-2">
                            <span className="truncate">{call.from || call.phone_number || 'Unknown'}</span>
                          </div>
                          {call.created_at && (
                            <div className="mt-1 text-xs text-navy-400 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatTime(call.created_at)}
                            </div>
                          )}
                        </div>
                        {selectedCallId === call.id && isMonitoring && (
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Monitor Panel */}
          <div className="lg:col-span-2">
            {selectedCallData ? (
              <Card className="overflow-hidden">
                <div className="px-4 py-3 bg-navy-50 border-b border-navy-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-navy-900">
                        {(selectedCallData.agent as any)?.name || 'Selected Call'}
                      </h2>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {selectedCallData.from || selectedCallData.phone_number || 'Unknown caller'}
                        {selectedCallData.direction && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            {selectedCallData.direction === 'inbound' ? (
                              <PhoneIncomingIcon className="w-3 h-3" />
                            ) : (
                              <PhoneOutgoingIcon className="w-3 h-3" />
                            )}
                            {selectedCallData.direction}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMonitoring && liveState.duration !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-navy-600">
                          <ClockIcon className="w-4 h-4" />
                          {formatDuration(liveState.duration)}
                        </div>
                      )}
                      <Button
                        variant={isMonitoring ? 'danger' : 'primary'}
                        size="sm"
                        onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                        disabled={!selectedCallId}
                      >
                        {isMonitoring ? (
                          <>
                            <StopCircleIcon className="w-4 h-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <RadioIcon className="w-4 h-4" />
                            Monitor
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Live Stats */}
                {isMonitoring && (
                  <div className="px-4 py-3 border-b border-navy-100 bg-navy-50/50">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-navy-900">
                          {liveState.sentiment || 'neutral'}
                        </div>
                        <div className="text-xs text-navy-500">Sentiment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-navy-900">
                          {liveState.sentimentScore ?? 50}%
                        </div>
                        <div className="text-xs text-navy-500">Sentiment Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-navy-900">
                          {(liveState.transcript || []).length}
                        </div>
                        <div className="text-xs text-navy-500">Transcript Lines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-navy-900">
                          {liveState.score ?? '--'}
                        </div>
                        <div className="text-xs text-navy-500">QA Score</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Navigation */}
                <div className="px-4 border-b border-navy-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowTranscript(true)}
                      className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                        showTranscript
                          ? 'border-navy-900 text-navy-900'
                          : 'border-transparent text-navy-500 hover:text-navy-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquareIcon className="w-4 h-4" />
                        Transcript
                      </div>
                    </button>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                        !showTranscript
                          ? 'border-navy-900 text-navy-900'
                          : 'border-transparent text-navy-500 hover:text-navy-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4" />
                        Insights
                      </div>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="h-[400px] overflow-y-auto">
                  {showTranscript ? (
                    <div className="p-4 space-y-3">
                      {!isMonitoring ? (
                        <div className="text-center py-12">
                          <MicIcon className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                          <p className="text-navy-500">Click "Monitor" to start live transcription</p>
                        </div>
                      ) : (liveState.transcript || []).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="animate-pulse flex items-center justify-center gap-2 text-navy-400">
                            <MicIcon className="w-5 h-5" />
                            <span>Listening...</span>
                          </div>
                        </div>
                      ) : (
                        (liveState.transcript || []).map((entry: any, index: number) => (
                          <div
                            key={entry.id || index}
                            className={`flex ${
                              entry.speaker === 'agent' || entry.role === 'agent'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                entry.speaker === 'agent' || entry.role === 'agent'
                                  ? 'bg-navy-900 text-white'
                                  : 'bg-navy-100 text-navy-900'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="w-3 h-3 opacity-70" />
                                <span className="text-xs opacity-70">
                                  {entry.speaker || entry.role || 'Unknown'}
                                </span>
                                {entry.confidence !== undefined && (
                                  <span className="text-xs opacity-50">
                                    {Math.round(entry.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                              <p>{entry.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {!isMonitoring ? (
                        <div className="text-center py-12">
                          <ActivityIcon className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                          <p className="text-navy-500">Start monitoring to see AI insights</p>
                        </div>
                      ) : (liveState.insights || []).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="animate-pulse text-navy-400">
                            Analyzing conversation...
                          </div>
                        </div>
                      ) : (
                        (liveState.insights || []).map((insight: any, index: number) => (
                          <div
                            key={insight.id || index}
                            className={`p-3 rounded-lg border ${
                              insight.type === 'warning' || insight.priority === 'high'
                                ? 'bg-red-50 border-red-200'
                                : insight.type === 'success' || insight.type === 'pass'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-navy-50 border-navy-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {insight.type === 'warning' || insight.priority === 'high' ? (
                                <AlertTriangleIcon className="w-4 h-4 text-red-600 mt-0.5" />
                              ) : insight.type === 'success' || insight.type === 'pass' ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5" />
                              ) : (
                                <ActivityIcon className="w-4 h-4 text-navy-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-navy-900">
                                  {insight.text || insight.title}
                                </p>
                                {insight.confidence !== undefined && (
                                  <p className="text-xs text-navy-500 mt-1">
                                    Confidence: {Math.round(insight.confidence * 100)}%
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                  <RadioIcon className="w-8 h-8 text-navy-400" />
                </div>
                <h3 className="text-lg font-semibold text-navy-700 mb-1">No call selected</h3>
                <p className="text-navy-500 text-sm">Select an active call from the list to start monitoring</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}