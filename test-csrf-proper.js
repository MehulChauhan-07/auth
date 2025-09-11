#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with session persistence
const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000
});

async function testProperCSRFFlow() {
    console.log('🔒 Testing Proper CSRF Flow with Session Management...\n');

    try {
        console.log('1️⃣  Step 1: Getting CSRF Token (creates session)');
        console.log('   GET /csrf-token');
        
        const tokenResponse = await client.get('/csrf-token');
        const csrfToken = tokenResponse.data.csrfToken;
        
        console.log('   ✅ CSRF token received:', csrfToken.substring(0, 20) + '...');
        console.log('   📝 Session cookies should be set automatically');
        
        // Check if we got session cookies
        const setCookieHeaders = tokenResponse.headers['set-cookie'];
        if (setCookieHeaders) {
            console.log('   🍪 Session cookies set:', setCookieHeaders.length, 'cookies');
        } else {
            console.log('   ⚠️  No session cookies found - this might cause issues');
        }

        console.log('\n2️⃣  Step 2: Using CSRF token for registration (same session)');
        console.log('   POST /auth/register with X-CSRF-Token header');
        
        const testUser = {
            name: 'CSRF Test User',
            email: `csrf_test_${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        const registerResponse = await client.post('/auth/register', testUser, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ Registration successful with CSRF!');
        console.log('   👤 User created:', registerResponse.data.user?.name);
        console.log('   🎉 CSRF flow is working correctly!');

        console.log('\n3️⃣  Step 3: Testing login with same session');
        const loginResponse = await client.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ Login successful with CSRF!');
        console.log('   🔑 Authentication token received');

    } catch (error) {
        if (error.response) {
            console.log('❌ Request failed:', error.response.status);
            console.log('   Error:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data.message?.code === 'SEC_002') {
                console.log('\n🔧 CSRF Issues Detected:');
                console.log('   1. Session cookies might not be persisting');
                console.log('   2. CSRF token and session secret mismatch');
                console.log('   3. Check server logs for detailed debugging');
                
                await debugCSRFIssues();
            }
        } else {
            console.log('❌ Network error:', error.message);
        }
    }
}

async function debugCSRFIssues() {
    console.log('\n🔍 Debugging CSRF Issues...');
    
    try {
        // Test with a fresh session each time
        console.log('   Testing token generation consistency...');
        
        const token1Response = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
        const token2Response = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
        
        console.log('   Token 1:', token1Response.data.csrfToken.substring(0, 15) + '...');
        console.log('   Token 2:', token2Response.data.csrfToken.substring(0, 15) + '...');
        
        if (token1Response.data.csrfToken !== token2Response.data.csrfToken) {
            console.log('   ⚠️  Tokens are different - session not persisting properly');
        } else {
            console.log('   ✅ Tokens match - session persistence works');
        }
        
    } catch (debugError) {
        console.log('   ❌ Debug failed:', debugError.message);
    }
}

// Alternative test using different axios instances (simulating separate requests)
async function testWithoutSessionPersistence() {
    console.log('\n🧪 Testing WITHOUT session persistence (should fail)');
    
    try {
        // Get token with one instance
        const tokenResponse = await axios.get(`${BASE_URL}/csrf-token`);
        const csrfToken = tokenResponse.data.csrfToken;
        
        // Try to use token with different instance (no cookies shared)
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Should Fail User',
            email: `shouldfail_${Date.now()}@example.com`,
            password: 'TestPass123!'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });
        
        console.log('   ❌ This should have failed but succeeded unexpectedly');
        
    } catch (error) {
        if (error.response?.data?.message?.code === 'SEC_002') {
            console.log('   ✅ Correctly failed due to session mismatch');
            console.log('   📝 This proves session persistence is required');
        }
    }
}

console.log('🔒 CSRF Flow Testing Tool');
console.log('========================\n');

await testProperCSRFFlow();
await testWithoutSessionPersistence();

console.log('\n📚 Key Takeaways:');
console.log('1. CSRF tokens are tied to browser sessions');
console.log('2. Same HTTP client must be used for token + request');
console.log('3. Session cookies must persist between requests');
console.log('4. In Postman: Enable cookies and use same tab/collection');
