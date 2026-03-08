import type { APIRoute } from 'astro';
import { getBuildInfo } from '../lib/build-info';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(getBuildInfo()), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
