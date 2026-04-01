<?php

namespace App\Providers;

use App\Services\GodView\GodViewService;
use Illuminate\Support\ServiceProvider;

class GodViewServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GodViewService::class, function ($app) {
            return new GodViewService();
        });
    }

    public function boot(): void
    {
        //
    }
}
