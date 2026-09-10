import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medikiosk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('medikiosk_token', response.data.token);
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('medikiosk_token', response.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Case Structuring & Doctor Verification APIs
export const structureCaseSheet = async (payload) => {
  const response = await api.post('/case/structure', payload);
  return response.data;
};

export const getAllCases = async () => {
  const response = await api.get('/case/all');
  return response.data;
};

export const getCaseById = async (caseId) => {
  const response = await api.get(`/case/${caseId}`);
  return response.data;
};

export const verifyCaseSheet = async (caseId, payload) => {
  const response = await api.put(`/case/${caseId}/verify`, payload);
  return response.data;
};

export const uploadCaseAttachment = async (caseId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await api.post(`/case/${caseId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getCaseAttachmentUrl = (caseId, attachmentId) => {
  return `${API_BASE_URL}/case/${caseId}/attachments/${attachmentId}`;
};

export const downloadCaseAttachment = async (caseId, attachmentId, filename) => {
  const response = await api.get(getCaseAttachmentUrl(caseId, attachmentId), { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
};

export const getPDFDownloadUrl = (caseId) => {
  return `${API_BASE_URL}/case/${caseId}/pdf`;
};

// Existing Session compatibility APIs
export const startSession = async (abhaId, language, opdType) => {
  const response = await api.post('/sessions/start', { abhaId, language, opdType });
  return response.data;
};

export const updateSession = async (sessionId, data) => {
  const response = await api.post(`/sessions/${sessionId}/update`, data);
  return response.data;
};

export const uploadDocument = async (sessionId, formData) => {
  const response = await api.post(`/sessions/${sessionId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getSessionSummary = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}/summary`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
