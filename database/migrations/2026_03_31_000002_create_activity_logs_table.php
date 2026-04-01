<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // request, query, error, event
            $table->string('action'); // GET /dashboard, SELECT * FROM users, etc.
            $table->string('method')->nullable(); // GET, POST, etc. (for requests)
            $table->string('url')->nullable(); // request URL
            $table->integer('status_code')->nullable(); // response status code
            $table->integer('duration_ms')->nullable(); // execution time in ms
            $table->float('memory_mb')->nullable(); // memory used in MB
            $table->json('context')->nullable(); // full request/response data
            $table->text('stack_trace')->nullable(); // for errors
            $table->timestamp('created_at')->nullable();

            $table->index(['type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('url');
        });
    }

    public function down(): void
    {
        Schema::dropIfNull('activity_logs');
    }
};
