import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { BACKEND_URL } from './config/api';
import './index.css';

// Global fetch proxy: Automatically redirects any hardcoded 'http://localhost:5000' to configured BACKEND_URL
const originalFetch = window.fetch;
window.fetch = function(resource, init) {
    if (typeof resource === 'string' && resource.includes('localhost:5000')) {
        resource = resource.replace(/https?:\/\/localhost:5000/g, BACKEND_URL);
    } else if (resource instanceof Request && resource.url.includes('localhost:5000')) {
        const newUrl = resource.url.replace(/https?:\/\/localhost:5000/g, BACKEND_URL);
        resource = new Request(newUrl, resource);
    }
    return originalFetch.call(this, resource, init);
};

window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global Error:', msg, 'at', url, ':', lineNo, ':', columnNo, error);
    return false;
};

console.log('Main.jsx loaded. API Backend:', BACKEND_URL);


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

try {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <LanguageProvider>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </LanguageProvider>
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>
    )
    console.log('React render called.');
} catch (err) {
    console.error('Render crash:', err);
}
