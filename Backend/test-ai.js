import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
        const geminiModels = data.models
            .map(m => m.name)
            .filter(name => name.toLowerCase().includes('gemini'));
        console.log("Gemini Models:", geminiModels);
    } else {
        console.log("No models found:", data);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

run();
