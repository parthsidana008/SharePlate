import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testBothEndpoints() {
  // Test v1 endpoint
  console.log('=== Testing v1 endpoint ===');
  let url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{
      parts: [{
        text: "Say hello"
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ v1 endpoint SUCCESS!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ v1 endpoint FAILED');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ v1 request failed:', error.message);
  }

  // Test v1beta endpoint
  console.log('\n=== Testing v1beta endpoint ===');
  url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ v1beta endpoint SUCCESS!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ v1beta endpoint FAILED');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ v1beta request failed:', error.message);
  }
}

testBothEndpoints();
