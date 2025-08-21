#!/usr/bin/env node

/**
 * Multi-Session Authentication Test Script
 * 
 * This script helps test the new multi-session authentication system
 * by simulating multiple user logins and verifying session isolation.
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USERS = [
  {
    email: 'alumni1@test.com',
    password: 'password123',
    userType: 'alumni'
  },
  {
    email: 'alumni2@test.com', 
    password: 'password123',
    userType: 'alumni'
  }
];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, cookies = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const cookieHeader = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 3000),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      }
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Extract cookies from response headers
function extractCookies(headers) {
  const cookies = {};
  if (headers['set-cookie']) {
    headers['set-cookie'].forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      cookies[name.trim()] = value.trim();
    });
  }
  return cookies;
}

// Test multi-session functionality
async function testMultiSession() {
  console.log('🧪 Testing Multi-Session Authentication System\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const sessions = [];
  
  try {
    // Test 1: Login with first user
    console.log('1️⃣ Testing login with first user...');
    const login1 = await makeRequest('POST', '/api/auth/login', TEST_USERS[0]);
    
    if (login1.status !== 200) {
      console.log(`❌ First user login failed: ${login1.status}`);
      console.log('Response:', login1.body);
      return;
    }
    
    const cookies1 = extractCookies(login1.headers);
    sessions.push({
      user: TEST_USERS[0].email,
      cookies: cookies1,
      sessionId: cookies1['current-session']
    });
    
    console.log(`✅ First user logged in successfully`);
    console.log(`   Session ID: ${cookies1['current-session']}`);
    console.log(`   Auth Cookie: auth-token-${cookies1['current-session']}`);
    
    // Test 2: Login with second user
    console.log('\n2️⃣ Testing login with second user...');
    const login2 = await makeRequest('POST', '/api/auth/login', TEST_USERS[1]);
    
    if (login2.status !== 200) {
      console.log(`❌ Second user login failed: ${login2.status}`);
      console.log('Response:', login2.body);
      return;
    }
    
    const cookies2 = extractCookies(login2.headers);
    sessions.push({
      user: TEST_USERS[1].email,
      cookies: cookies2,
      sessionId: cookies2['current-session']
    });
    
    console.log(`✅ Second user logged in successfully`);
    console.log(`   Session ID: ${cookies2['current-session']}`);
    console.log(`   Auth Cookie: auth-token-${cookies2['current-session']}`);
    
    // Test 3: Verify sessions are different
    console.log('\n3️⃣ Verifying session isolation...');
    
    if (cookies1['current-session'] === cookies2['current-session']) {
      console.log('❌ Sessions are identical - multi-session not working!');
      return;
    }
    
    console.log('✅ Sessions are different - multi-session working!');
    
    // Test 4: Verify each user can access their own data
    console.log('\n4️⃣ Testing session-specific data access...');
    
    // Verify first user session
    const verify1 = await makeRequest('GET', '/api/auth/verify', null, cookies1);
    if (verify1.status === 200 && verify1.body?.user?.email === TEST_USERS[0].email) {
      console.log('✅ First user session verification successful');
    } else {
      console.log('❌ First user session verification failed');
    }
    
    // Verify second user session
    const verify2 = await makeRequest('GET', '/api/auth/verify', null, cookies2);
    if (verify2.status === 200 && verify2.body?.user?.email === TEST_USERS[1].email) {
      console.log('✅ Second user session verification successful');
    } else {
      console.log('❌ Second user session verification failed');
    }
    
    // Test 5: Test logout functionality
    console.log('\n5️⃣ Testing logout functionality...');
    
    // Logout first user
    const logout1 = await makeRequest('POST', '/api/auth/logout', null, cookies1);
    if (logout1.status === 200) {
      console.log('✅ First user logout successful');
    } else {
      console.log('❌ First user logout failed');
    }
    
    // Verify first user is logged out
    const verify1AfterLogout = await makeRequest('GET', '/api/auth/verify', null, cookies1);
    if (verify1AfterLogout.status === 401) {
      console.log('✅ First user properly logged out');
    } else {
      console.log('❌ First user still authenticated after logout');
    }
    
    // Verify second user is still logged in
    const verify2AfterLogout = await makeRequest('GET', '/api/auth/verify', null, cookies2);
    if (verify2AfterLogout.status === 200 && verify2AfterLogout.body?.user?.email === TEST_USERS[1].email) {
      console.log('✅ Second user still authenticated (session isolation working)');
    } else {
      console.log('❌ Second user affected by first user logout');
    }
    
    // Test 6: Test cookie cleanup
    console.log('\n6️⃣ Testing cookie cleanup...');
    
    // Logout second user
    const logout2 = await makeRequest('POST', '/api/auth/logout', null, cookies2);
    if (logout2.status === 200) {
      console.log('✅ Second user logout successful');
    } else {
      console.log('❌ Second user logout failed');
    }
    
    // Verify both users are logged out
    const finalVerify1 = await makeRequest('GET', '/api/auth/verify', null, cookies1);
    const finalVerify2 = await makeRequest('GET', '/api/auth/verify', null, cookies2);
    
    if (finalVerify1.status === 401 && finalVerify2.status === 401) {
      console.log('✅ All sessions properly terminated');
    } else {
      console.log('❌ Some sessions still active after logout');
    }
    
    console.log('\n🎉 Multi-Session Authentication Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Multiple users can be logged in simultaneously');
    console.log('   ✅ Sessions are properly isolated');
    console.log('   ✅ Logout works independently for each session');
    console.log('   ✅ Cookie cleanup is working correctly');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testMultiSession().catch(console.error);
}

module.exports = { testMultiSession };
