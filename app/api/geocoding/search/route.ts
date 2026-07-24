import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  console.log('Buscando:', query);
  
  if (!query || query.trim() === '') {
    return NextResponse.json({ error: 'Falta parámetro q' }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=es`;
    
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SIGO-App/1.0' },
    });
    
    if (!res.ok) throw new Error('Nominatim error');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al buscar dirección' }, { status: 500 });
  }
}
