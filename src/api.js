import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend URL
});

// Interceptor to add auth token to every request
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const token = JSON.parse(userInfo).token;
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
