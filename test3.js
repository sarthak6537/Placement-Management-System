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
        const loginData = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_seed', password: 'password123' })
        }).then(r => r.json());
        
        const token = loginData.accessToken;
        
        const getRes = await request(`/job-applications`, 'GET', null, token);
        const apps = JSON.parse(getRes.text);
        
        const harishApps = apps.filter(a => a.student && a.student.firstName === 'harish');
        console.log(`Harish has ${harishApps.length} applications.`);
        console.log(JSON.stringify(harishApps, null, 2));
        
    } catch(err) {
        console.error('Error:', err.message);
    }
}

run();
