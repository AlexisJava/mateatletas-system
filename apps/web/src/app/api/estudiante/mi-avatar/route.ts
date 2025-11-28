import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 [FRONTEND API] GET /api/estudiante/mi-avatar');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    console.log('🔑 Token presente?', !!token);

    if (!token) {
      console.error('❌ No hay token');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/estudiantes/mi-avatar`;
    console.log('🎯 Backend URL:', backendUrl);

    console.log('📤 Solicitando avatar al backend...');
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: 'http://localhost:3000',
        Referer: request.headers.get('referer') || 'http://localhost:3000',
      },
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Error del backend:', response.status);
      throw new Error('Error al obtener avatar');
    }

    const data = await response.json();
    console.log('✅ Data recibida:', data);
    console.log('✅ Avatar URL:', data.avatar_url);
    console.log('✅ Tiene avatar?', data.tiene_avatar);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener avatar';
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [FRONTEND API] ERROR:', message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
