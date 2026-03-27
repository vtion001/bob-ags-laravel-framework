@extends('layouts.app')

@section('title', 'Login - BOB')

@section('content')
<div class="min-h-screen bg-white flex">
    <!-- Left side - Brand -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-white">
        <div class="max-w-md text-center">
            <div class="mb-8">
                <div class="w-44 h-44 mx-auto bg-navy-900 rounded-2xl flex items-center justify-center">
                    <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
            <h1 class="text-3xl font-bold text-navy-900 mb-4">BOB Agent</h1>
            <p class="text-navy-500 leading-relaxed">
                AI-powered business operations assistant. Automate workflows, analyze data, and streamline your business.
            </p>
        </div>
    </div>

    <!-- Right side - Login Form -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div class="w-full max-w-md">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-navy-900 mb-2">Welcome Back</h2>
                <p class="text-navy-500">Enter your credentials to continue</p>
            </div>

            @if ($errors->any())
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {{ $errors->first() }}
                </div>
            @endif

            @if (session('status'))
                <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                    {{ session('status') }}
                </div>
            @endif

            <form method="POST" action="{{ route('login.post') }}" class="space-y-4">
                @csrf

                <div>
                    <label for="email" class="block text-sm font-medium text-navy-700 mb-1">Email</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required
                           class="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none transition-colors"
                           placeholder="you@example.com" autocomplete="email">
                </div>

                <div class="relative">
                    <label for="password" class="block text-sm font-medium text-navy-700 mb-1">Password</label>
                    <input type="password" id="password" name="password" required
                           class="w-full px-3 py-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none transition-colors"
                           placeholder="Enter your password" autocomplete="current-password">
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" name="remember" class="rounded border-navy-300 text-navy-600 focus:ring-navy-500">
                        <span class="ml-2 text-sm text-navy-600">Remember me</span>
                    </label>
                </div>

                <button type="submit"
                        class="w-full bg-navy-900 text-white py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors cursor-pointer">
                    Sign In
                </button>
            </form>
        </div>
    </div>
</div>
@endsection
