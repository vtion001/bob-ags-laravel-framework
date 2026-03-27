@extends('layouts.dashboard')

@section('title', 'Call History - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-1">Call History</h1>
        <p class="text-navy-500">Search and review past calls</p>
    </div>
    <livewire:dashboard.history-index />
</div>
@endsection
