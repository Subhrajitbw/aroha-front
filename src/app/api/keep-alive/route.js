import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request) {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL && !process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes('127.0.0.1') && !process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    : 'https://api.arohahouse.com';

  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  const results = {};

  // 1. Health check (keeps Render web service awake)
  try {
    const healthRes = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Aroha-KeepAlive/1.0',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    results.health = {
      status: healthRes.status,
      ok: healthRes.ok,
    };
  } catch (err) {
    results.health = {
      error: err.message,
    };
  }

  // 2. Store products query (warms up Postgres database connection pool)
  try {
    const headers = {
      'User-Agent': 'Aroha-KeepAlive/1.0',
    };
    if (publishableKey) {
      headers['x-publishable-api-key'] = publishableKey;
    }

    const dbWarmRes = await fetch(`${backendUrl}/store/products?limit=1`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    results.dbWarm = {
      status: dbWarmRes.status,
      ok: dbWarmRes.ok,
    };
  } catch (err) {
    results.dbWarm = {
      error: err.message,
    };
  }

  const isHealthy = results.health?.ok || results.dbWarm?.ok;

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      target: backendUrl,
      results,
      status: isHealthy ? 'healthy' : 'degraded',
    },
    { status: isHealthy ? 200 : 500 }
  );
}
