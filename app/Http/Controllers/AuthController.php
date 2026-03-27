<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\BobApiService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    public function __construct(
        protected BobApiService $bobApi
    ) {}

    /**
     * Show login form
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Handle login
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');

        // Attempt to authenticate via Sanctum (local users table)
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Get token for API access and store in session
            $user = Auth::user();
            $token = $user->createToken('bob-api');
            Session::put('bob_api_token_id', $token->accessToken->id);
            Session::put('bob_api_token', $token->plainTextToken);

            return redirect()->intended('/dashboard');
        }

        // Fallback: Try to login via bob-ags-api if local auth fails
        // This allows users still managed by Supabase backend to login
        try {
            $apiResponse = $this->bobApi->post('auth/login', [
                'email' => $request->email,
                'password' => $request->password,
            ]);

            if (isset($apiResponse['error'])) {
                return back()->withErrors([
                    'email' => 'Invalid credentials provided.',
                ])->onlyInput('email');
            }

            // Create or find local user from API response
            $user = $this->findOrCreateUserFromApi($apiResponse);

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            // Store API token in session
            $token = $apiResponse['access_token'] ?? null;
            if ($token) {
                Session::put('bob_api_token', $token);
            }

            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'Invalid credentials provided.',
            ])->onlyInput('email');
        }
    }

    /**
     * Handle logout
     */
    public function logout(Request $request): RedirectResponse
    {
        // Revoke API token on bob-ags-api
        try {
            $this->bobApi->post('auth/logout');
        } catch (\Exception $e) {
            // Ignore API logout errors
        }

        // Logout locally
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Find or create local user from API response
     */
    protected function findOrCreateUserFromApi(array $apiData): User
    {
        $userData = $apiData['user'] ?? [];
        $email = $userData['email'] ?? null;

        if (!$email) {
            throw new \Exception('Invalid API response: no user email');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $userData['name'] ?? explode('@', $email)[0],
                'email' => $email,
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'role' => $userData['role'] ?? 'viewer',
            ]);
        }

        return $user;
    }

    /**
     * Get current session data
     */
    public function session(Request $request)
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
