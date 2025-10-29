import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value // Corregido: buscar 'auth-token' en lugar de 'access_token'

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estudiantes/mi-avatar`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3000', // Frontend origin para CORS
        'Referer': request.headers.get('referer') || 'http://localhost:3000'
      }
    })

    if (!response.ok) {
      throw new Error('Error al obtener avatar')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error al obtener avatar:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
