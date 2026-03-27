<?php

namespace App\Console\Commands;

use App\Services\CTM\AgentProfileService;
use Illuminate\Console\Command;

class CtmSyncAgents extends Command
{
    protected $signature = 'ctm:sync-agents';
    protected $description = 'Sync agent profiles from CTM API';

    public function handle(): int
    {
        $this->info('Syncing agents from CTM...');

        try {
            $service = new AgentProfileService();
            $result = $service->syncFromCtm();

            $this->info("Synced: {$result['synced']} updated, {$result['created']} created.");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
