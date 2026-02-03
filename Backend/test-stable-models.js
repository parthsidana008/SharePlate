import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testStableModels() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n--- Testing ${modelName} ---`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      const response = await result.response;
      console.log(`✅ SUCCESS with ${modelName}:`, response.text());
      return modelName; // Return first working model
    } catch (error) {
      console.error(`❌ FAILED with ${modelName}:`, error.message);
    }
  }
  
  console.log('\n⚠️  No working models found!');
  return null;
}

testStableModels();
