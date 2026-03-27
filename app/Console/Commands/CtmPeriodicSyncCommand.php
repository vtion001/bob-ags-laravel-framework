<?php

namespace App\Console\Commands;

use App\Jobs\CtmPeriodicSync;
use Illuminate\Console\Command;

class CtmPeriodicSyncCommand extends Command
{
    protected $signature = 'ctm:periodic-sync {--sync : Run synchronously instead of queuing}';
    protected $description = 'Trigger periodic CTM sync (agents + calls cache refresh)';

    public function handle(): int
    {
        if ($this->option('sync')) {
            $this->info('Running sync synchronously...');
            $job = new CtmPeriodicSync();
            $job->handle(app(\App\Services\FastApiService::class));
            $this->info('Done.');
        } else {
            CtmPeriodicSync::dispatch();
            $this->info('Periodic sync job dispatched to queue.');
        }
        return Command::SUCCESS;
    }
}