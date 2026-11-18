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
            body: JSON.stringify({ username: 'harish2', password: 'password123' })
        }).then(r => r.json());
        
        const token = loginData.accessToken;
        
        // Call fetchUserByUsername
        const getRes = await request(`/users/by-username/harish2`, 'GET', null, token);
        console.log(`GET /users/by-username/harish2 returned status: ${getRes.status}`);
        console.log(`Text: ${getRes.text}`);
        
    } catch(err) {
        console.error('Error:', err.message);
    }
}

run();
