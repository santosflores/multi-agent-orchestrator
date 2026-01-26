import { config } from 'dotenv';

config();

export const AGENT_MODEL = process.env.FLASH_MODEL || 'gemini-3-flash-preview';