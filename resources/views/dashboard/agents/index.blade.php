@extends('layouts.dashboard')

@section('title', 'Agents - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-1">Agents</h1>
        <p class="text-navy-500">Manage and monitor agent performance</p>
    </div>
    <livewire:dashboard.agents-index />
</div>
@endsection
