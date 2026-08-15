// Exporta datos tabulares a CSV (Excel lo abre nativamente) sin dependencias
// externas: la librería estándar para .xlsx en npm (xlsx/SheetJS) tiene CVEs
// altos sin parchear. Mismo enfoque usado en control-horario/page.tsx,
// generalizado aquí para reutilizarse en otras pantallas.

function escaparCsv(valor: string | number): string {
  const str = String(valor ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportToCsv(headers: string[], rows: (string | number)[][], filename: string): void {
  const csv = [headers, ...rows].map(fila => fila.map(escaparCsv).join(',')).join('\r\n');
  // BOM UTF-8 para que Excel detecte la codificación y muestre acentos/ñ correctamente.
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
