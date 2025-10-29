import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { avatar_url } = await request.json()

    // Obtener token JWT de la cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value // Corregido: buscar 'auth-token' en lugar de 'access_token'

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Llamar al backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estudiantes/avatar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3000', // Frontend origin para CORS
        'Referer': request.headers.get('referer') || 'http://localhost:3000'
      },
      body: JSON.stringify({ avatar_url })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al guardar avatar')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Error al guardar avatar:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar avatar' },
      { status: 500 }
    )
  }
}
