import { Link, usePage } from '@inertiajs/react';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    is_god?: boolean;
    role?: string;
}

export default function Sidebar({ auth }: { auth?: AuthUser | null }) {
    const { url } = usePage();

    const isGodOrAdmin = auth?.is_god === true || auth?.role === 'admin' || auth?.role === 'god';

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', current: url === '/dashboard' },
        { name: 'History', href: '/history', current: url === '/history' },
        { name: 'Monitor', href: '/monitor', current: url === '/monitor' },
        { name: 'Agent Profiles', href: '/agents', current: url === '/agents' },
        { name: 'QA Logs', href: '/qa-logs', current: url === '/qa-logs' },
        { name: 'Settings', href: '/settings', current: url === '/settings' },
        ...(isGodOrAdmin ? [{ name: 'GodView', href: '/godview', current: url === '/godview' }] : []),
    ];

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-navy-900 flex flex-col">
            {/* Logo */}
            <div className="flex-shrink-0 p-6">
                <Link href="/dashboard">
                    <img
                        src="https://res.cloudinary.com/dbviya1rj/image/upload/v1773384037/gpnkwelbdcwfjmw5axtx.webp"
                        alt="BOB AGS Logo"
                        className="h-12 w-auto"
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            item.current
                                ? 'bg-navy-900 text-white'
                                : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="flex-shrink-0 p-4 border-t border-navy-800">
                {auth ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold">
                                {auth.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{auth.name}</p>
                                <p className="text-xs text-navy-400">{auth.email}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-navy-400 hover:text-white text-sm"
                        >
                            Log out
                        </Link>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="text-sm text-navy-300 hover:text-white"
                    >
                        Log in
                    </Link>
                )}
            </div>
        </div>
    );
}
