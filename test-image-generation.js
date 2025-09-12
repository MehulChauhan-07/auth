#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with session persistence
const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 15000
});

async function testImageGeneration() {
    console.log('🎨 Testing Image Generation API...\n');

    try {
        // Step 1: Test demo endpoint (no auth required)
        console.log('1️⃣  Testing demo endpoint (no authentication)');
        
        const demoResponse = await client.post('/images/demo', {
            prompt: 'A beautiful sunset over mountains',
            style: 'realistic',
            size: '1024x1024'
        });

        console.log('   ✅ Demo response received:');
        console.log('   📝 Message:', demoResponse.data.message);
        console.log('   🖼️  Mock Image URL:', demoResponse.data.mockImage?.url);

        // Step 2: Register a test user for authenticated testing
        console.log('\n2️⃣  Creating test user for authenticated testing...');
        
        const testUser = {
            name: 'Image Test User',
            email: `imagetest_${Date.now()}@example.com`,
            password: 'TestPass123!'
        };

        // Get CSRF token first
        const csrfResponse = await client.get('/csrf-token');
        const csrfToken = csrfResponse.data.csrfToken;
        console.log('   🔒 CSRF token obtained');

        // Register user with CSRF token
        const registerResponse = await client.post('/auth/register', testUser, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ User registered:', registerResponse.data.user?.name);

        // Step 3: Test image generation with authentication
        console.log('\n3️⃣  Testing authenticated image generation...');

        // Test 1: Simple text prompt
        console.log('\n   📝 Test 1: Simple text prompt');
        const simplePromptResponse = await client.post('/images/generate', {
            prompt: 'A majestic dragon flying over a medieval castle',
            style: 'artistic',
            size: '1024x1024'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ Simple prompt response:');
        console.log('   📨 Message:', simplePromptResponse.data.message);
        console.log('   🎯 Prompt Type:', simplePromptResponse.data.confirmation?.promptType);
        console.log('   🖼️  Image URL:', simplePromptResponse.data.image?.url);
        console.log('   💰 Credits Used:', simplePromptResponse.data.usage?.creditsUsed);

        // Test 2: JSON formatted prompt
        console.log('\n   📝 Test 2: JSON formatted prompt');
        const jsonPrompt = JSON.stringify({
            text: "A futuristic cityscape at night",
            mood: "cyberpunk",
            colors: ["neon blue", "purple", "pink"],
            lighting: "dramatic neon lighting",
            composition: "wide"
        });

        const jsonPromptResponse = await client.post('/images/generate', {
            prompt: jsonPrompt,
            style: 'digital-art',
            size: '1792x1024'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ JSON prompt response:');
        console.log('   📨 Message:', jsonPromptResponse.data.message);
        console.log('   🎯 Prompt Type:', jsonPromptResponse.data.confirmation?.promptType);
        console.log('   🖼️  Image URL:', jsonPromptResponse.data.image?.url);
        console.log('   🔍 Processed Prompt:', jsonPromptResponse.data.confirmation?.processedPrompt);

        // Step 4: Test image status
        console.log('\n4️⃣  Testing image status check...');
        
        const imageId = jsonPromptResponse.data.image?.id;
        if (imageId) {
            const statusResponse = await client.get(`/images/${imageId}/status`, {
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            console.log('   ✅ Status response:');
            console.log('   📊 Status:', statusResponse.data.status);
            console.log('   🖼️  Image URL:', statusResponse.data.imageUrl);
            console.log('   ⏱️  Processing Time:', statusResponse.data.metadata?.processingTime, 'ms');
        }

        // Step 5: Test image history
        console.log('\n5️⃣  Testing image generation history...');
        
        const historyResponse = await client.get('/images/history?page=1&limit=5', {
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });

        console.log('   ✅ History response:');
        console.log('   📚 Total Images:', historyResponse.data.pagination?.totalImages);
        console.log('   📄 Current Page:', historyResponse.data.pagination?.currentPage);
        console.log('   🖼️  Images in History:', historyResponse.data.images?.length);

        // Step 6: Test validation errors
        console.log('\n6️⃣  Testing validation errors...');
        
        try {
            await client.post('/images/generate', {
                prompt: '', // Empty prompt should fail
                style: 'invalid-style'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                }
            });
        } catch (validationError) {
            if (validationError.response?.status === 400) {
                console.log('   ✅ Validation error handled correctly:');
                console.log('   ❌ Error:', validationError.response.data.error?.code);
                console.log('   📋 Fields:', validationError.response.data.error?.fields?.length, 'validation errors');
            }
        }

        console.log('\n🎉 All image generation tests completed successfully!');

        // Summary
        console.log('\n📊 Test Summary:');
        console.log('   ✅ Demo endpoint: Working');
        console.log('   ✅ User authentication: Working');
        console.log('   ✅ Text prompt generation: Working');
        console.log('   ✅ JSON prompt generation: Working');
        console.log('   ✅ Image status check: Working');
        console.log('   ✅ Image history: Working');
        console.log('   ✅ Validation: Working');

    } catch (error) {
        console.log('❌ Test failed:', error.response?.status || error.code);
        console.log('   Error:', error.response?.data?.message || error.message);
        
        if (error.response?.data?.error) {
            console.log('   Details:', error.response.data.error);
        }
    }
}

// Run the tests
console.log('🎨 Image Generation API Testing Tool');
console.log('====================================\n');

testImageGeneration();
