import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lon = request.nextUrl.searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Faltan parámetros lat y lon' }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
    
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SIGO-App/1.0' },
    });
    
    if (!res.ok) throw new Error('Nominatim error');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error en geocoding inverso' }, { status: 500 });
  }
}
