import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
    auth?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

export default function Layout({ children, auth }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar auth={auth} />
            <main>{children}</main>
        </div>
    );
}
