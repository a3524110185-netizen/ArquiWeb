'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Search, Image as ImageIcon, Filter } from 'lucide-react';

export default function GaleriaEvidenciasPage() {
  const { reportes, proyectos, incidencias } = useStore();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos'); // 'todos', 'reportes', 'incidencias'
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  // Extraer todas las fotos de reportes e incidencias
  const fotosReportes = reportes.flatMap(r => 
    r.fotos.map(f => ({ url: f, tipo: 'Reporte', origenId: r.id, proyectoId: r.proyectoId, proyectoNombre: r.proyecto, fecha: r.fecha, descripcion: r.descripcion }))
  );
  const fotosIncidencias = incidencias.flatMap(i => 
    i.fotos.map(f => ({ url: f, tipo: 'Incidencia', origenId: i.id, proyectoId: i.proyectoId, proyectoNombre: i.proyecto, fecha: i.fechaCreacion.split('T')[0], descripcion: i.titulo }))
  );

  const todasLasFotos = [...fotosReportes, ...fotosIncidencias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const filtered = todasLasFotos.filter(f => {
    const q = search.toLowerCase();
    const matchQ = f.proyectoNombre.toLowerCase().includes(q) || f.descripcion.toLowerCase().includes(q);
    const matchP = !filterProyecto || f.proyectoId === filterProyecto;
    const matchT = filterTipo === 'todos' || (filterTipo === 'reportes' && f.tipo === 'Reporte') || (filterTipo === 'incidencias' && f.tipo === 'Incidencia');
    return matchQ && matchP && matchT;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Galería de Evidencias Fotográficas</CardTitle></CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por proyecto o descripción..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-base sm:w-52" value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select className="input-base sm:w-40" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
            <option value="todos">Todas las fotos</option>
            <option value="reportes">Solo Reportes</option>
            <option value="incidencias">Solo Incidencias</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((foto, idx) => (
              <div key={idx} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800" onClick={() => setFotoModal(foto.url)}>
                <img src={foto.url} alt="Evidencia" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <Badge variant={foto.tipo === 'Reporte' ? 'info' : 'danger'} size="sm" className="w-fit mb-2">{foto.tipo}</Badge>
                  <p className="text-white text-xs font-semibold truncate">{foto.proyectoNombre}</p>
                  <p className="text-white/80 text-[10px] mt-1 line-clamp-2">{foto.descripcion}</p>
                  <p className="text-white/60 text-[10px] mt-2">{formatDate(foto.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted flex flex-col items-center">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No se encontraron fotografías con los filtros actuales</p>
          </div>
        )}
      </Card>

      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto ampliada" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}
