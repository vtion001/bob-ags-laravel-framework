@extends('layouts.dashboard')

@section('title', 'Call Detail - BOB')

@section('main-content')
<div class="p-6 lg:p-8">
    <livewire:dashboard.call-show :callId="$callId" />
</div>
@endsection
