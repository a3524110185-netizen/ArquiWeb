import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ControlHorarioRegistro } from '@/lib/services/rh';

// Nota: no se registra una fuente externa (Font.register vía URL) para evitar
// depender de una descarga de red durante la generación del PDF; Helvetica
// (fuente base incluida en @react-pdf/renderer) cubre acentos y ñ sin problema.

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 2,
  },
  filtros: {
    fontSize: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1A237E',
    minHeight: 24,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 20,
  },
  rowAlt: {
    backgroundColor: '#f9fafb',
  },
  cell: {
    padding: 4,
    fontSize: 8,
    textAlign: 'center',
  },
  cellLeft: {
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  headerCell: {
    padding: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerCellLeft: {
    padding: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'left',
  },
  colUsuario: { flex: 2 },
  colFecha: { flex: 1.2 },
  colHora: { flex: 1 },
  colHoras: { flex: 0.8 },
  colEstado: { flex: 1.1 },
  estadoCompleto: { color: '#2E7D32', fontFamily: 'Helvetica-Bold' },
  estadoIncompleto: { color: '#F57F17', fontFamily: 'Helvetica-Bold' },
  estadoFalta: { color: '#C62828', fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 4,
  },
});

function formatFechaCorta(dateStr: string): string {
  if (!dateStr) return '-';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

const estadoStyle = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'completo': return styles.estadoCompleto;
    case 'incompleto': return styles.estadoIncompleto;
    case 'falta': return styles.estadoFalta;
    default: return undefined;
  }
};

const estadoLabel = (estado: string) => {
  if (!estado) return '—';
  return estado.charAt(0).toUpperCase() + estado.slice(1);
};

interface ControlHorarioPDFProps {
  registros: ControlHorarioRegistro[];
  empresa: string;
  rangoFechas: { desde: string; hasta: string };
  usuarioFiltro?: string;
  proyectoFiltro?: string;
  estadoFiltro?: string;
}

export function ControlHorarioPDF({
  registros,
  empresa,
  rangoFechas,
  usuarioFiltro,
  proyectoFiltro,
  estadoFiltro,
}: ControlHorarioPDFProps) {
  const filtrosAplicados = [
    usuarioFiltro && `Usuario: ${usuarioFiltro}`,
    proyectoFiltro && `Proyecto: ${proyectoFiltro}`,
    estadoFiltro && `Estado: ${estadoFiltro}`,
  ].filter(Boolean).join('   ·   ');

  const generadoEl = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{empresa}</Text>
          <Text style={styles.subtitle}>
            Control Horario · {formatFechaCorta(rangoFechas.desde)} al {formatFechaCorta(rangoFechas.hasta)}
          </Text>
          {filtrosAplicados && <Text style={styles.filtros}>{filtrosAplicados}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.headerRow} fixed>
            <Text style={[styles.headerCellLeft, styles.colUsuario]}>Usuario</Text>
            <Text style={[styles.headerCell, styles.colFecha]}>Fecha</Text>
            <Text style={[styles.headerCell, styles.colHora]}>Entrada</Text>
            <Text style={[styles.headerCell, styles.colHora]}>Inicio Comida</Text>
            <Text style={[styles.headerCell, styles.colHora]}>Fin Comida</Text>
            <Text style={[styles.headerCell, styles.colHora]}>Salida</Text>
            <Text style={[styles.headerCell, styles.colHoras]}>Horas</Text>
            <Text style={[styles.headerCell, styles.colEstado]}>Estado</Text>
          </View>

          {registros.map((r, i) => (
            <View key={r.id} style={[styles.row, ...(i % 2 === 1 ? [styles.rowAlt] : [])]} wrap={false}>
              <Text style={[styles.cellLeft, styles.colUsuario]}>{r.usuario?.nombre || `Usuario ${r.usuario_id}`}</Text>
              <Text style={[styles.cell, styles.colFecha]}>{formatFechaCorta(r.fecha)}</Text>
              <Text style={[styles.cell, styles.colHora]}>{r.entrada || '—'}</Text>
              <Text style={[styles.cell, styles.colHora]}>{r.comida_inicio || '—'}</Text>
              <Text style={[styles.cell, styles.colHora]}>{r.comida_fin || '—'}</Text>
              <Text style={[styles.cell, styles.colHora]}>{r.salida || '—'}</Text>
              <Text style={[styles.cell, styles.colHoras]}>{r.horas != null ? `${r.horas}h` : '—'}</Text>
              <Text style={[styles.cell, styles.colEstado, estadoStyle(r.estado)]}>{estadoLabel(r.estado)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>{registros.length} registro{registros.length !== 1 ? 's' : ''} · Exportado el {generadoEl}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
