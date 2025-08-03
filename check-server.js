#!/usr/bin/env node

/**
 * Quick server check and testing script
 * Usage: node check-server.js
 */

import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function checkServer() {
  console.log("🔍 Checking server status...\n");

  try {
    // Test 1: Check if server is running
    console.log("1. Testing server connection...");
    const statusResponse = await axios.get(`${API_URL}/status`);
    console.log("✅ Server is running!");
    console.log(`Environment: ${statusResponse.data.config.environment}`);
    console.log(`Frontend URL: ${statusResponse.data.config.frontendUrl}\n`);

    // Test 2: Check CSRF token endpoint
    console.log("2. Testing CSRF token endpoint...");
    try {
      const csrfResponse = await axios.get(`${API_URL}/auth/csrf-token`, {
        withCredentials: true,
      });
      console.log("✅ CSRF endpoint working");
      console.log(
        `Token sample: ${csrfResponse.data.csrfToken.substring(0, 20)}...\n`
      );
    } catch (csrfError) {
      console.log("⚠️  CSRF endpoint failed:", csrfError.message);
      console.log("Will use test routes instead\n");
    }

    // Test 3: Test registration with test route
    console.log("3. Testing registration with test route...");
    const testEmail = `test${Date.now()}@example.com`;
    const registerData = {
      name: "Test User",
      email: testEmail,
      password: "password123",
    };

    try {
      const registerResponse = await axios.post(
        `${API_URL}/auth/test/register`,
        registerData,
        {
          withCredentials: true,
        }
      );

      if (registerResponse.data.success) {
        console.log("✅ Test registration successful");

        // Test 4: Test login with test route
        console.log("4. Testing login with test route...");
        const loginResponse = await axios.post(
          `${API_URL}/auth/test/login`,
          {
            email: testEmail,
            password: "password123",
          },
          {
            withCredentials: true,
          }
        );

        if (loginResponse.data.success) {
          console.log("✅ Test login successful");
          console.log("🎉 All tests passed! Your auth system is working.\n");

          console.log("📝 For frontend:");
          console.log(
            "- Your frontend should now work with automatic fallback to test routes"
          );
          console.log(
            '- Check browser console for "🧪 Using test route" messages'
          );
        }
      }
    } catch (testError) {
      console.log(
        "❌ Test routes failed:",
        testError.response?.data || testError.message
      );
    }
  } catch (error) {
    console.error("❌ Server check failed:");

    if (error.code === "ECONNREFUSED") {
      console.log("🚨 Server is not running!");
      console.log("💡 Start your server with: npm start or node server.js");
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Quick troubleshooting tips
function showTroubleshootingTips() {
  console.log("\n🔧 Troubleshooting Tips:");
  console.log("1. Make sure your server is running on port 5000");
  console.log("2. Check your .env file has the correct MongoDB URL");
  console.log("3. Try adding DISABLE_CSRF=true to .env for easier testing");
  console.log("4. Check network tab in browser for specific error details");
  console.log(
    "5. Frontend should automatically fall back to test routes if CSRF fails"
  );
}

async function main() {
  await checkServer();
  showTroubleshootingTips();
}

main().catch(console.error);
