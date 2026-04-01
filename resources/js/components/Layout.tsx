import Sidebar from './Navbar';
import GodViewToolbar from './GodView/Toolbar';

interface LayoutProps {
    children: React.ReactNode;
    auth?: {
        id: number;
        name: string;
        email: string;
        is_god?: boolean;
    } | null;
}

export default function Layout({ children, auth }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar auth={auth} />
            <div className="ml-64">
                <main className="p-6">{children}</main>
            </div>
            <GodViewToolbar isGod={auth?.is_god ?? false} />
        </div>
    );
}
