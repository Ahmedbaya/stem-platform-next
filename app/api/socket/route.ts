import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ 
    success: true,
    message: 'WebSocket server is running on port 3001'
  })
} 