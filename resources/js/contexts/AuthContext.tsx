import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    email: string | null;
    name: string | null;
    role: string;
    agents: any[];
    userGroups: any[];
    isAdmin: boolean;
    isLoading: boolean;
    isReady: boolean;
}

const defaultContext: AuthContextType = {
    email: null,
    name: null,
    role: 'viewer',
    agents: [],
    userGroups: [],
    isAdmin: false,
    isLoading: true,
    isReady: false,
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthContextType>(defaultContext);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [userRes, agentsRes, groupsRes] = await Promise.all([
                    fetch('/api/user', { credentials: 'include' }),
                    fetch('/api/ctm/agents', { credentials: 'include' }),
                    fetch('/api/ctm/agents/groups', { credentials: 'include' }),
                ]);

                if (cancelled) return;

                const user = userRes.ok ? await userRes.json() : null;
                const agentsData = agentsRes.ok ? await agentsRes.json() : null;
                const groupsData = groupsRes.ok ? await groupsRes.json() : null;

                if (cancelled) return;

                const agents = agentsData?.data?.agents ?? agentsData?.agents ?? [];
                const userGroups = groupsData?.data?.groups ?? groupsData?.groups ?? [];
                const role = user?.role ?? 'viewer';

                setState({
                    email: user?.email ?? null,
                    name: user?.name ?? null,
                    role,
                    agents,
                    userGroups,
                    isAdmin: role === 'admin' || user?.is_god === true,
                    isLoading: false,
                    isReady: true,
                });
            } catch {
                if (!cancelled) {
                    setState(prev => ({ ...prev, isLoading: false, isReady: true }));
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <AuthContext.Provider value={state}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
