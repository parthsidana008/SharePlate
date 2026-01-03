import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("FOUND MODELS:");
      data.models.forEach(m => {
        if (m.name.includes("gemini")) {
          // just print the name part to keep it short and avoid truncation
          console.log(m.name.replace("models/", "")); 
        }
      });
    } else {
      console.log("ERROR:", data);
    }
  } catch (e) {
    console.log("NET ERROR");
  }
}

run();
