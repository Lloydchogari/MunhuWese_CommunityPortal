// Frontend expects the API base to include the /api segment by convention
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
// ASSETS_BASE is the root backend URL (without /api) and is used for static assets like uploads
export const ASSETS_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default {
  API_BASE,
};
