import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Catch-all proxy route to forward any unhandled /api requests to the backend.
 * This ensures feature parity while we migrate components to use apiClient.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return proxyRequest(req, await params);
}

async function proxyRequest(req: NextRequest, { slug }: { slug: string[] }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
  
  // Safety check: if backendUrl is relative or points to the same origin, 
  // we might be in a recursion loop. Force absolute backend URL for the proxy.
  const targetBase = backendUrl.startsWith('http') 
    ? backendUrl 
    : `http://localhost:4000/api`;

  const path = slug.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const fullUrl = `${targetBase}/${path}${searchParams ? '?' + searchParams : ''}`;

  console.log(`[Proxy] ${req.method} /api/${path} -> ${fullUrl}`);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'devsocial-nextauth-secret-2024-production-key' });
    
    const headers = new Headers(req.headers);
    // Remove host header to avoid SSL/cors issues on some setups
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');

    // Inject the token if it exists and wasn't already provided
    if (token && token.accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token.accessToken}`);
      console.log(`[Proxy] Injected Bearer token for user: ${token.username}`);
    } else if (!headers.has('Authorization')) {
       console.log('[Proxy] No token found to inject or Authorization header already present');
    }

    try {
    const options: RequestInit = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      cache: 'no-store',
    };

    const response = await fetch(fullUrl, options);
    
    // Create a new response with the backend data
    const data = await response.blob();
    return new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error(`[Proxy Error] ${req.method} /api/${path}:`, error);
    return NextResponse.json(
      { success: false, message: 'Backend proxy error' },
      { status: 502 }
    );
  }
}
