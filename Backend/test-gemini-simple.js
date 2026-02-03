import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length);
console.log('API Key preview:', apiKey?.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    console.log('\n--- Testing gemini-2.0-flash-exp ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ SUCCESS:', response.text());
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }

  try {
    console.log('\n--- Testing gemini-1.5-flash ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ SUCCESS:', response.text());
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }

  try {
    console.log('\n--- Testing gemini-pro ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ SUCCESS:', response.text());
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
}

testGemini();
