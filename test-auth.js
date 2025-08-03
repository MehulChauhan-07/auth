#!/usr/bin/env node

/**
 * Quick testing script for CSRF authentication
 * Usage: node test-auth.js
 */

import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Set up axios to handle cookies
axios.defaults.withCredentials = true;

async function testAuth() {
  console.log("🧪 Testing Authentication API...\n");

  try {
    // Test 1: Get CSRF Token
    console.log("1. Getting CSRF token...");
    const tokenResponse = await axios.get(`${API_URL}/auth/csrf-token`);
    const csrfToken = tokenResponse.data.csrfToken;
    console.log(`✅ CSRF Token: ${csrfToken.substring(0, 20)}...\n`);

    // Test 2: Test registration with CSRF
    console.log("2. Testing registration with CSRF...");
    const registerData = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
    };

    const registerResponse = await axios.post(
      `${API_URL}/auth/register`,
      registerData,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (registerResponse.data.success) {
      console.log("✅ Registration successful");
      console.log(
        `User: ${registerResponse.data.user.name} (${registerResponse.data.user.email})\n`
      );

      // Test 3: Test login
      console.log("3. Testing login...");
      const loginResponse = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: registerData.email,
          password: registerData.password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (loginResponse.data.success) {
        console.log("✅ Login successful");
        console.log(`Token: ${loginResponse.data.token.substring(0, 20)}...\n`);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data);

    if (error.response?.status === 403) {
      console.log(
        "\n💡 Suggestion: Add DISABLE_CSRF=true to your .env file for easier testing"
      );
    }
  }
}

async function testWithoutCSRF() {
  console.log("\n🧪 Testing without CSRF (should fail)...\n");

  try {
    const registerData = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
    };

    await axios.post(`${API_URL}/auth/register`, registerData);
    console.log("⚠️  Unexpected: Request succeeded without CSRF token");
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("✅ CSRF protection working - request blocked");
    } else {
      console.log("❌ Unexpected error:", error.response?.data);
    }
  }
}

async function testTestRoutes() {
  console.log("\n🧪 Testing /test routes (no CSRF required)...\n");

  try {
    const registerData = {
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
    };

    const registerResponse = await axios.post(
      `${API_URL}/auth/test/register`,
      registerData
    );

    if (registerResponse.data.success) {
      console.log("✅ Test registration successful (no CSRF needed)");

      const loginResponse = await axios.post(`${API_URL}/auth/test/login`, {
        email: registerData.email,
        password: registerData.password,
      });

      if (loginResponse.data.success) {
        console.log("✅ Test login successful (no CSRF needed)");
      }
    }
  } catch (error) {
    console.error("❌ Test routes failed:", error.response?.data);
  }
}

// Run tests
async function main() {
  await testAuth();
  await testWithoutCSRF();
  await testTestRoutes();

  console.log("\n🎉 Testing complete!");
  console.log("\n📝 For Postman testing:");
  console.log("1. Use test routes: POST /api/auth/test/login (no CSRF needed)");
  console.log("2. Or add DISABLE_CSRF=true to .env file");
  console.log("3. Or use the CSRF token from GET /api/auth/csrf-token");
}

main().catch(console.error);
