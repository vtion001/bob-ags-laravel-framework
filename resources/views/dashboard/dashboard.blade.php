@extends('layouts.dashboard')

@section('title', 'Dashboard - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-navy-900 mb-1">Dashboard</h1>
        <p class="text-navy-500">Welcome back, {{ auth()->user()->name ?? auth()->user()->email }}</p>
    </div>
</div>
@endsection
