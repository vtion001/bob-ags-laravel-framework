@extends('layouts.dashboard')

@section('title', 'QA Logs - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-1">QA Logs</h1>
        <p class="text-navy-500">Review quality assurance score overrides</p>
    </div>
    <livewire:dashboard.qa-logs-index />
</div>
@endsection
