import { NextResponse } from 'next/server'

export async function POST(request) {
  // Minimal handler — adapt to your actual email logic
  return NextResponse.json({ ok: true })
}
