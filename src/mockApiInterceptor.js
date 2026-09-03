const originalFetch = window.fetch;

window.fetch = async (...args) => {
    let [resource, config] = args;
    
    // Convert Request object to string URL if needed
    let url = '';
    if (resource instanceof Request) {
        url = resource.url;
    } else {
        url = resource;
    }

    if (typeof url === 'string' && (url.includes('http://localhost:5000') || url.includes('/api/'))) {
        console.log('[Mock API Intercepted]', config?.method || 'GET', url);
        
        // Helper to return a mock response
        const mockResponse = (data, status = 200) => {
            return new Response(JSON.stringify(data), {
                status,
                headers: { 'Content-Type': 'application/json' }
            });
        };

        // Small delay to simulate network
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get local storage data safely
        const getLS = (key) => JSON.parse(localStorage.getItem(key) || '[]');

        const method = config?.method?.toUpperCase() || 'GET';

        try {
            // ---- Jobs API ----
            if (url.includes('/api/jobs')) {
                if (method === 'GET') {
                    const jobs = getLS('mock_jobs');
                    // Check if it's a specific job ID
                    const match = url.match(/\/api\/jobs\/(?!all)([a-zA-Z0-9_]+)/);
                    if (match) {
                        const job = jobs.find(j => j.id === match[1]);
                        return mockResponse(job || {});
                    }
                    return mockResponse(jobs); // Return array for list
                }
                if (method === 'POST') {
                    const body = JSON.parse(config.body || '{}');
                    const newJob = { id: 'job_' + Date.now(), ...body, status: 'open', createdAt: new Date().toISOString() };
                    const jobs = getLS('mock_jobs');
                    jobs.push(newJob);
                    localStorage.setItem('mock_jobs', JSON.stringify(jobs));
                    return mockResponse({ success: true, job: newJob, message: 'Job posted successfully!' });
                }
            }
            
            // ---- Applications API ----
            if (url.includes('/api/applications')) {
                const apps = getLS('mock_applications');
                if (method === 'GET') {
                    return mockResponse(apps);
                }
                if (method === 'POST') {
                    const body = JSON.parse(config.body || '{}');
                    const newApp = { id: 'app_' + Date.now(), ...body, status: 'pending', appliedAt: new Date().toISOString() };
                    apps.push(newApp);
                    localStorage.setItem('mock_applications', JSON.stringify(apps));
                    return mockResponse({ success: true, message: 'Applied successfully' });
                }
            }

            // ---- Other common APIs ----
            if (url.includes('/api/candidate/profile')) return mockResponse({ name: 'Candidate', email: 'candidate@test.com' });
            if (url.includes('/api/settings')) return mockResponse({ success: true, language: 'en' });
            if (url.includes('/api/subscriptions')) return mockResponse([]);
            if (url.includes('/api/plans')) return mockResponse([]);
            if (url.includes('/api/admin/users')) return mockResponse(getLS('mock_users'));
            if (url.includes('/api/admin/companies')) return mockResponse(getLS('mock_companies'));
            if (url.includes('/api/admin')) return mockResponse([]);
            if (url.includes('/api/employer')) return mockResponse([]);
            if (url.includes('/api/auth/login')) {
                // Return 401 so AuthContext falls back to mock logic
                return mockResponse({ success: false, message: 'Backend unreachable' }, 401);
            }

            // Generic fallback
            if (method === 'GET') {
                return mockResponse([]); 
            } else {
                return mockResponse({ success: true, message: 'Mock action successful' });
            }
        } catch (error) {
            console.error('[Mock API Error]', error);
            return mockResponse({ success: false, message: 'Mock API error' }, 500);
        }
    }

    // Pass through non-backend requests
    return originalFetch(...args);
};
