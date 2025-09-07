/**
 * Configuration constants for the Wistia Zapier integration
 */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// API Configuration
export const WISTIA_API_BASE_URL = process.env.WISTIA_API_BASE_URL || 'https://api.wistia.com/v1';
export const WISTIA_API_TOKEN = process.env.WISTIA_API_TOKEN;

// API Endpoints
export const WISTIA_ENDPOINTS = {
  MEDIAS: `${WISTIA_API_BASE_URL}/medias.json`,
  PROJECTS: `${WISTIA_API_BASE_URL}/projects.json`,
  ACCOUNT: `${WISTIA_API_BASE_URL}/account.json`,
} as const;
