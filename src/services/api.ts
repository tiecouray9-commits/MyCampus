import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const api = axios.create({
baseURL: process.env.API_BASE_URL || 'https://api.example.com',
timeout: 10000,
});


api.interceptors.request.use(async config => {
const token = await SecureStore.getItemAsync('access_token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});


export default api;