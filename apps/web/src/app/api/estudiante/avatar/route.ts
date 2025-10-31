import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📡 [FRONTEND API] POST /api/estudiante/avatar')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const body = await request.json()
    console.log('📥 Body recibido:', body)
    console.log('🔗 Avatar URL:', body.avatar_url)

    // Obtener token JWT de la cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    console.log('🔑 Token presente?', !!token)
    if (token) {
      console.log('🔑 Token (primeros 20 chars):', token.substring(0, 20) + '...')
    }

    if (!token) {
      console.error('❌ No hay token de autenticación')
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/estudiantes/avatar`
    console.log('🎯 Backend URL:', backendUrl)

    // Llamar al backend
    console.log('📤 Enviando request al backend...')
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3000',
        'Referer': request.headers.get('referer') || 'http://localhost:3000'
      },
      body: JSON.stringify({ avatar_url: body.avatar_url })
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response ok?', response.ok)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error del backend:', error)
      throw new Error(error.message || 'Error al guardar avatar')
    }

    const data = await response.json()
    console.log('✅ Respuesta del backend:', data)
    console.log('✅ Avatar guardado:', data.avatar_url)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return NextResponse.json(data)

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar avatar'
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ [FRONTEND API] ERROR:', message)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
