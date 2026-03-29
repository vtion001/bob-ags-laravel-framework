import { createContext, useContext } from 'react';

interface AuthContextType {
    email: string | null;
    agents: any[];
    userGroups: any[];
    isAdmin: boolean;
    isLoading: boolean;
    isReady: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    email: null,
    agents: [],
    userGroups: [],
    isAdmin: false,
    isLoading: false,
    isReady: false,
});

export function useAuth() {
    return useContext(AuthContext);
}
