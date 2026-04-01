import Layout from '../components/Layout';
import { PageProps } from '@inertiajs/core';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CallTable from '../components/CallTable';
import { useCallHistory } from '../hooks/dashboard/useCallHistory';
import { PhoneIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';

export default function History({ auth }: PageProps) {
    const {
        filteredCalls,
        isLoading,
        isRefreshing,
        isSearching,
        error,
        searchQuery,
        setSearchQuery,
        handleRefresh,
        handleSearch,
    } = useCallHistory();

    const [localSearch, setLocalSearch] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(localSearch);
        if (localSearch.trim()) {
            handleSearch();
        }
    };

    return (
        <Layout auth={auth}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Call History</h1>
                        <p className="text-navy-500 mt-1">View all past calls and their analysis</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={handleRefresh}
                        isLoading={isRefreshing}
                    >
                        <RefreshCwIcon className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Search Bar */}
                <Card className="mb-6">
                    <form onSubmit={handleSearchSubmit} className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by phone number..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isSearching}
                        >
                            <SearchIcon className="w-4 h-4" />
                            Search
                        </Button>
                    </form>
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <Card className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
                            <PhoneIcon className="w-8 h-8 text-navy-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-700 mb-1">Loading call history...</h3>
                        <p className="text-navy-500 text-sm">Fetching calls from CTM</p>
                    </Card>
                ) : (
                    <CallTable
                        calls={filteredCalls}
                        pageSize={25}
                        showPagination={true}
                    />
                )}
            </div>
        </Layout>
    );
}
