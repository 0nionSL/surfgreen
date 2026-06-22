import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.0.142:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});