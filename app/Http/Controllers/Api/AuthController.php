<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    /**
     * Handle login - API version returns JSON
     */
    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');

        // Try local authentication via Sanctum
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();
            $token = $user->createToken('bob-api');

            return response()->json([
                'access_token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'user' => [
                    'email' => $user->email,
                    'name' => $user->name,
                    'role' => $user->role ?? 'viewer',
                ],
            ]);
        }

        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    /**
     * Handle logout - API version
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()?->currentAccessToken()?->delete();

        // Logout locally
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    /**
     * Get current session data - API version
     */
    public function session(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        return response()->json([
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role ?? 'viewer',
        ]);
    }
}