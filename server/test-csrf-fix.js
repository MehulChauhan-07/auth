#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testCSRFFix() {
    console.log('🔒 Testing CSRF Configuration...\n');

    try {
        // Test 1: Check server status
        console.log('1️⃣  Testing server connectivity...');
        const statusResponse = await axios.get(`${BASE_URL}/status`);
        console.log('✅ Server is running');
        console.log(`   Environment: ${statusResponse.data.config.environment}`);

        // Test 2: Try direct registration without CSRF token
        console.log('\n2️⃣  Testing registration without CSRF token...');
        
        const testUser = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            console.log('✅ Registration successful without CSRF token!');
            console.log('   CSRF protection is properly disabled for testing');
            console.log(`   User created: ${registerResponse.data.user?.name}`);
            
        } catch (registerError) {
            if (registerError.response?.data?.message?.code === 'SEC_002' || 
                registerError.response?.data?.message?.message?.includes('CSRF')) {
                
                console.log('❌ CSRF protection is still active');
                console.log('   Error:', registerError.response.data.message);
                console.log('\n🔧 Fix: Add DISABLE_CSRF=true to your .env file');
                
                // Test 3: Try with proper CSRF flow
                console.log('\n3️⃣  Testing proper CSRF flow...');
                await testWithCSRFToken();
                
            } else {
                console.log('⚠️  Different error occurred:', registerError.response?.data || registerError.message);
            }
        }

    } catch (error) {
        console.error('❌ Server connection failed:', error.message);
        console.log('\n🔧 Make sure your server is running:');
        console.log('   cd server && npm run dev');
    }
}

async function testWithCSRFToken() {
    try {
        // Get CSRF token
        console.log('   Getting CSRF token...');
        const tokenResponse = await axios.get(`${BASE_URL}/csrf-token`, {
            withCredentials: true
        });
        
        const csrfToken = tokenResponse.data.csrfToken;
        console.log(`   ✅ CSRF token obtained: ${csrfToken.substring(0, 20)}...`);

        // Try registration with CSRF token
        console.log('   Attempting registration with CSRF token...');
        const testUser = {
            name: 'Test User with CSRF',
            email: `testcsrf${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            withCredentials: true
        });

        console.log('   ✅ Registration with CSRF token successful!');
        console.log(`   User created: ${registerResponse.data.user?.name}`);
        
    } catch (csrfError) {
        console.log('   ❌ CSRF flow failed:', csrfError.response?.data?.message || csrfError.message);
    }
}

// Run the test
testCSRFFix();
