#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with cookie jar
const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

async function quickCSRFTest() {
    console.log('🔥 Quick CSRF Fix Verification\n');

    try {
        console.log('1. Getting CSRF token...');
        const tokenResponse = await client.get('/csrf-token');
        const csrfToken = tokenResponse.data.csrfToken;
        console.log('   ✅ Token received:', csrfToken.substring(0, 15) + '...');

        console.log('\n2. Testing registration with CSRF token...');
        const testUser = {
            name: 'Fix Test User',
            email: `fix_test_${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        const registerResponse = await client.post('/auth/register', testUser, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        if (registerResponse.status === 200) {
            console.log('   ✅ SUCCESS! CSRF fix worked!');
            console.log('   👤 User created:', registerResponse.data.user?.name);
            console.log('   🎉 No more duplicate CSRF validation errors');
        }

    } catch (error) {
        if (error.response) {
            console.log('   ❌ Still failing:', error.response.status);
            console.log('   Error:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data.message?.code === 'SEC_002') {
                console.log('\n💡 Still getting CSRF errors. Check:');
                console.log('   1. Server restarted after the fix?');
                console.log('   2. Same session for both token + request?');
                console.log('   3. Headers are correctly set?');
            }
        } else {
            console.log('   ❌ Network error:', error.message);
        }
    }
}

await quickCSRFTest();
