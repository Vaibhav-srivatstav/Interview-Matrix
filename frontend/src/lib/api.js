import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api`, withCredentials: true });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
api.interceptors.request.use((config) => {
  return config; // no token needed
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { status, config } = err;
    const currentPath = window.location.pathname;

    if (status === 401 && !currentPath.startsWith('/login')) {

      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 401) {
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const loginUser = (data) => { return api.post('/auth/login', data); }
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const loginWithGoogle = (token) => api.post('/auth/google', { token });
export const logoutUser = () => api.post('/auth/logout');

// // ── Profile ────────────────────────────────────────────────────────────────
// export const getProfile    = ()     => api.get('/profile');
// export const updateProfile = (data) => api.put('/profile', data);

// ── Resume ─────────────────────────────────────────────────────────────────
export const uploadResume = (formData) => api.post('/resume/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getMyResumes = () => api.get('/resume/my');
export const getResume = (id) => api.get(`/resume/${id}`);

// ── Interview ──────────────────────────────────────────────────────────────
export const startInterview = (data) => api.post('/interview/start', data);
export const submitAnswer = (sessionId, data) => api.post(`/interview/${sessionId}/answer`, data);
export const completeInterview = (sessionId) => api.post(`/interview/${sessionId}/complete`);
export const getSessions = () => api.get('/interview/sessions');
export const getSession = (id) => api.get(`/interview/${id}`);

// ── Evaluation ─────────────────────────────────────────────────────────────
export const analyzeEmotion = (data) => api.post('/evaluation/emotion', data);
export const analyzeVoice = (data) => api.post('/evaluation/voice', data);
export const getSessionReport = (id) => api.get(`/evaluation/session/${id}/report`);

export default api;
