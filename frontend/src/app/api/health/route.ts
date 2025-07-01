import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'basic';

    // Try backend health check
    try {
      let endpoint = '/api/health/';
      
      switch (type) {
        case 'pooler':
          endpoint = '/api/health/pooler';
          break;
        case 'database':
          endpoint = '/api/health/database';
          break;
        case 'performance':
          endpoint = '/api/health/performance';
          break;
        case 'detailed':
          endpoint = '/api/health/detailed';
          break;
        default:
          endpoint = '/api/health/';
      }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.warn('Backend health check failed:', backendError);
    }

    // Fallback: Return basic health status
    return NextResponse.json({
      status: 'degraded',
      service: 'VCE Career Guidance Frontend',
      version: '1.0.0',
      backend: 'unavailable',
      timestamp: new Date().toISOString(),
      fallback: true
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 