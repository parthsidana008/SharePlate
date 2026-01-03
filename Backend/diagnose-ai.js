import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log(`SUCCESS with ${modelName}:`, response.text());
    return true;
  } catch (error) {
    console.error(`FAILED with ${modelName}:`, error.message);
    // console.error(error); // unwanted verbosity
    return false;
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
  await testModel("gemini-pro");
  // Try one legacy one just in case
  await testModel("gemini-1.0-pro");
}

run();
