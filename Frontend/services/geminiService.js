import api from '../utils/api';

export const getFoodSafetyTips = async (foodItem) => {
  try {
    const response = await api.post('/ai/safety-tips', { foodItem });
    return response.data.data.tips || "Always check for mold and strange smells.";
  } catch (error) {
    console.error("API Error:", error);
    return "Ensure food is stored properly.";
  }
};

export const generateLeftoverRecipes = async (ingredients) => {
  try {
    const response = await api.post('/ai/recipes', { ingredients });
    return response.data.data.recipes || [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const analyzeFoodImage = async (base64Image) => {
  try {
    const response = await api.post('/ai/analyze-image', { imageBase64: base64Image });
    return response.data.data.analysis || null;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export const chatWithAssistant = async (
    history, 
    message,
    donationsContext = ''
) => {
  try {
    const response = await api.post('/ai/chat', { 
      message, 
      donationsContext,
      history 
    });
    return response.data.data.response || "I didn't catch that.";
  } catch (error) {
    console.error("API Error:", error);
    return "Sorry, I'm having trouble connecting to the server.";
  }
}

