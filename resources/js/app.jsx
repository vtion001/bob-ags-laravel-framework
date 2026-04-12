import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        return pages[`./pages/${name}.tsx`]();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <AuthProvider>
                <App {...props} />
            </AuthProvider>
        );
    },
});
