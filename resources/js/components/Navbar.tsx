import { Link, usePage } from '@inertiajs/react';

export default function Navbar({ auth }: { auth?: { id: number; name: string; email: string } | null }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', current: url === '/dashboard' },
        { name: 'History', href: '/history', current: url === '/history' },
        { name: 'Monitor', href: '/monitor', current: url === '/monitor' },
        { name: 'Settings', href: '/settings', current: url === '/settings' },
    ];

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                                BOB AGS
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                                        item.current
                                            ? 'text-gray-900 border-b-2 border-indigo-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {auth ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700">{auth.name}</span>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Log out
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
