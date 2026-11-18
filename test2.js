const API_URL = 'http://localhost:8080';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const status = res.status;
    const text = await res.text();
    return { status, text };
}

async function run() {
    try {
        // Register a new user
        await request('/auth/register', 'POST', {
            username: 'harish2',
            password: 'password123',
            email: 'harish2@campus.edu',
            role: 'ROLE_STUDENT'
        });

        // Log in
        const loginData = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'harish2', password: 'password123' })
        }).then(r => r.json());
        
        const token = loginData.accessToken;
        
        // Link student
        const userObj = await request('/auth/link-student', 'POST', null, token);
        const studentId = JSON.parse(userObj.text).student.id;
        console.log(`Student ID: ${studentId}`);
        
        // Try creating application for Job 1
        const postRes = await request('/job-applications', 'POST', {
            jobPosting: { id: 1 },
            student: { id: studentId },
            status: 'APPLIED',
            appliedOn: '2026-08-12'
        }, token);
        
        console.log(`POST /job-applications returned status: ${postRes.status}, text: ${postRes.text}`);
        
    } catch(err) {
        console.error('Error:', err.message);
    }
}

run();
