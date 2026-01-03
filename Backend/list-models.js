import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const errorModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There isn't a direct listModels method on the SDK client easily accessible in all versions, 
    // so we will rely on the fetch approach which is more reliable for raw listing.
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
        console.log("--- AVAILABLE GUIDED MODELS ---");
        data.models.forEach(m => {
            if (m.name.includes("gemini")) {
                console.log(`Name: ${m.name}`);
                console.log(`Supported Methods: ${m.supportedGenerationMethods.join(', ')}`);
                console.log("--------------------------------");
            }
        });
    } else {
        console.log("No models found:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
