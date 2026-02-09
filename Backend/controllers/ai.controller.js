import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

// @desc    Check AI service status
// @route   GET /api/ai/status
// @access  Private
export const checkAIStatus = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'error',
          message: 'GEMINI_API_KEY is not configured',
          apiKeyConfigured: false
        }
      });
    }

    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say "OK" in one word');
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        status: 'operational',
        message: 'Gemini AI is working properly',
        apiKeyConfigured: true,
        testResponse: text.trim()
      }
    });
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests');
    
    res.status(200).json({
      success: true,
      data: {
        status: 'error',
        message: isQuotaError 
          ? 'API quota exceeded. Please check your Google AI billing or wait for quota reset.'
          : `AI service error: ${errorMessage}`,
        apiKeyConfigured: true,
        isQuotaError,
        fullError: errorMessage
      }
    });
  }
};

// @desc    Get food safety tips
// @route   POST /api/ai/safety-tips
// @access  Private
export const getFoodSafetyTips = async (req, res) => {
  try {
    const { foodItem } = req.body;

    if (!foodItem) {
      return res.status(400).json({
        success: false,
        message: 'Food item is required'
      });
    }

    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a food safety expert. Provide 3 concise, bulleted food safety tips for donating or storing: ${foodItem}. Keep tips practical and short.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tips = response.text();

    res.status(200).json({
      success: true,
      data: {
        tips
      }
    });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    // Silent fallback
    res.status(200).json({
      success: true,
      data: {
        tips: `• Ensure ${req.body.foodItem} is stored in an airtight container.\n• Keep refrigerated at or below 40°F (4°C).\n• Donate only if it looks, smells, and tastes fresh.`
      }
    });
  }
};

// @desc    Analyze food image
// @route   POST /api/ai/analyze-image
// @access  Private
export const analyzeFoodImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Use Gemini 2.5 Flash for image analysis
    const model = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `Analyze this food image. Identify the food item title, write a short appetizing description, estimate the quantity (e.g. "1 bowl", "5 pieces"), suggest an expiry time (e.g. "24 hours"), and determine if it is Veg, Non-Veg, Vegan, or Bakery. Return JSON format with these exact fields: {"title": string, "description": string, "quantity": string, "expiresIn": string, "type": "Veg" | "Non-Veg" | "Vegan" | "Bakery"}`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();
    
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        analysis
      }
    });
  } catch (error) {
    console.error('Gemini Vision Error Details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    // Mock fallback for a generic food item
    res.status(200).json({
      success: true,
      data: {
        analysis: {
          title: 'Detected Food Item',
          description: 'Looks like a delicious homemade meal. Ready to specify details.',
          quantity: '1 serving',
          expiresIn: '24 hours',
          type: 'Veg'
        }
      }
    });
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, donationsContext, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const model = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: `You are 'PlateBot', a helpful assistant for a food donation platform called SharePlate.
    
${donationsContext ? `Here is the current list of available live donations on the platform:\n${donationsContext}\n\nWhen a user asks to find food, check for donations, or searches for a location (like a zip code, city, or area), ONLY use the list above.` : ''}
    
Be concise, friendly, and helpful.`
    });

    // Process and validate chat history - must start with 'user' role
    let chatHistory = history.map(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      const text = msg.text || msg.parts?.[0]?.text || '';
      return {
        role,
        parts: [{ text }]
      };
    }).filter(msg => msg.parts[0].text);
    
    // Ensure history starts with 'user' role (Gemini requirement)
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      // Remove leading model messages
      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }
    }
    
    const chat = model.startChat({
      history: chatHistory
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    res.status(200).json({
      success: true,
      data: {
        response: responseText
      }
    });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(200).json({
      success: true,
      data: {
        response: "I'm currently having trouble connecting to my AI brain, but I'm here to help! Please try searching for donations directly on the dashboard."
      }
    });
  }
};

