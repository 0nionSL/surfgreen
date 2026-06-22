import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://surfgreen.onrender.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});