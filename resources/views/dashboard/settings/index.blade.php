@extends('layouts.dashboard')

@section('title', 'Settings - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-1">Settings</h1>
        <p class="text-navy-500">Configure system settings and preferences</p>
    </div>
    <livewire:dashboard.settings-index />
</div>
@endsection
