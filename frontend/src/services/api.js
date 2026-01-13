import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const generatePost = async (topic, template, customInstructions) => {
  try {
    const response = await api.post('/generate', {
      topic,
      template: template || null,
      custom_instructions: customInstructions || null
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to generate post. Please check if the backend is running.'
    );
  }
};

export const rewritePost = async (text, action, customInstructions) => {
  try {
    const response = await api.post('/rewrite', {
      text,
      action,
      custom_instructions: customInstructions || null
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to rewrite post. Please try again.'
    );
  }
};

export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    return response.data.templates;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return {};
  }
};

export const checkStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    return { success: false, providers: { ollama: false, gemini: false } };
  }
};

export default api;