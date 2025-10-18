/**
 * Utilidades profesionales para exportación de datos
 * Soporta CSV, Excel y PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Type for exportable data records
 */
type ExportableData = Record<string, string | number | boolean | null | undefined>;

/**
 * Exporta datos a archivo Excel (.xlsx)
 */
export const exportToExcel = (data: ExportableData[], filename: string, sheetName = 'Datos') => {
  try {
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Convertir datos a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);

    return { success: true, message: 'Archivo Excel generado exitosamente' };
  } catch (error: unknown) {
    console.error('Error al exportar a Excel:', error);
    return { success: false, message: 'Error al generar archivo Excel' };
  }
};

/**
 * Exporta datos a archivo CSV
 */
export const exportToCSV = (data: ExportableData[], filename: string) => {
  try {
    // Convertir a worksheet y luego a CSV
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'Archivo CSV generado exitosamente' };
  } catch (error: unknown) {
    console.error('Error al exportar a CSV:', error);
    return { success: false, message: 'Error al generar archivo CSV' };
  }
};

/**
 * Exporta datos a PDF con tabla
 */
export const exportToPDF = (
  data: ExportableData[],
  filename: string,
  title: string,
  columns: { header: string; dataKey: string }[]
) => {
  try {
    const doc = new jsPDF();

    // Agregar título
    doc.setFontSize(18);
    doc.setTextColor(42, 26, 94); // Color #2a1a5e
    doc.text(title, 14, 20);

    // Agregar fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 14, 28);

    // Agregar tabla
    autoTable(doc, {
      startY: 35,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
      theme: 'grid',
      headStyles: {
        fillColor: [255, 107, 53], // Color #ff6b35
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [255, 249, 230] // Color #fff9e6
      },
      margin: { top: 35 }
    });

    // Guardar PDF
    doc.save(`${filename}.pdf`);

    return { success: true, message: 'Archivo PDF generado exitosamente' };
  } catch (error: unknown) {
    console.error('Error al exportar a PDF:', error);
    return { success: false, message: 'Error al generar archivo PDF' };
  }
};

/**
 * Exporta gráfico a imagen PNG
 */
export const exportChartToPNG = (chartElement: HTMLElement, filename: string) => {
  try {
    // Usar html2canvas para capturar el gráfico
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(chartElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });

    return { success: true, message: 'Imagen generada exitosamente' };
  } catch (error: unknown) {
    console.error('Error al exportar gráfico:', error);
    return { success: false, message: 'Error al generar imagen' };
  }
};

/**
 * Formatea datos de usuarios para exportación
 */
export const formatUsersForExport = (users: Record<string, unknown>[]) => {
  return users.map((user) => ({
    'ID': user.id,
    'Nombre': `${user.nombre} ${user.apellido}`,
    'Email': user.email,
    'Rol': user.role,
    'Fecha de Registro': new Date(user.createdAt).toLocaleDateString('es-ES'),
    'Estado': user.activo ? 'Activo' : 'Inactivo'
  }));
};

/**
 * Formatea datos de clases para exportación
 */
export const formatClassesForExport = (classes: Record<string, unknown>[]) => {
  return classes.map((clase) => ({
    'ID': clase.id,
    'Ruta Curricular': clase.ruta_curricular?.nombre || '-',
    'Docente': `${clase.docente?.user?.nombre || ''} ${clase.docente?.user?.apellido || ''}`.trim() || '-',
    'Fecha': new Date(clase.fecha_hora_inicio).toLocaleDateString('es-ES'),
    'Hora': new Date(clase.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    'Duración (min)': clase.duracion_minutos,
    'Cupos Ocupados': clase.cupo_maximo - clase.cupo_disponible,
    'Cupos Máximos': clase.cupo_maximo,
    'Estado': clase.estado
  }));
};

/**
 * Formatea datos de productos para exportación
 */
export const formatProductsForExport = (products: ExportableData[]) => {
  return products.map(product => ({
    'ID': product.id,
    'Nombre': product.nombre,
    'Tipo': product.tipo,
    'Precio': `$${(product.precio || 0).toLocaleString()}`,
    'Descripción': product.descripcion || '-',
    'Estado': product.activo ? 'Activo' : 'Inactivo',
    'Fecha Inicio': product.fecha_inicio ? new Date(String(product.fecha_inicio)).toLocaleDateString('es-ES') : '-',
    'Fecha Fin': product.fecha_fin ? new Date(String(product.fecha_fin)).toLocaleDateString('es-ES') : '-',
    'Cupo Máximo': product.cupo_maximo || '-',
    'Duración (meses)': product.duracion_meses || '-'
  }));
};

interface SystemReportStats {
  totalUsers?: number;
  totalClasses?: number;
  totalProducts?: number;
  [key: string]: string | number | undefined;
}

/**
 * Genera reporte completo del sistema en PDF
 */
export const generateSystemReport = (data: {
  users: ExportableData[];
  classes: ExportableData[];
  products: ExportableData[];
  stats: SystemReportStats;
}) => {
  try {
    const doc = new jsPDF();
    let yPosition = 20;

    // Portada
    doc.setFontSize(24);
    doc.setTextColor(255, 107, 53);
    doc.text('Reporte del Sistema', 105, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(16);
    doc.setTextColor(42, 26, 94);
    doc.text('Mateatletas - Admin Panel', 105, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Resumen Ejecutivo
    doc.setFontSize(14);
    doc.setTextColor(42, 26, 94);
    doc.text('Resumen Ejecutivo', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total de Usuarios: ${data.users.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total de Clases: ${data.classes.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total de Productos: ${data.products.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Clases Activas: ${data.classes.filter((c) => c.estado === 'Programada').length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Productos Activos: ${data.products.filter((p) => p.activo).length}`, 20, yPosition);
    yPosition += 15;

    // Nueva página para usuarios
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(42, 26, 94);
    doc.text('Usuarios del Sistema', 14, yPosition);
    yPosition += 10;

    // Tabla de usuarios (primeros 50)
    const usersData = formatUsersForExport(data.users.slice(0, 50));
    autoTable(doc, {
      startY: yPosition,
      head: [['Nombre', 'Email', 'Rol', 'Registro']],
      body: usersData.map(u => [u.Nombre, u.Email, u.Rol, u['Fecha de Registro']]),
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 53] },
    });

    // Nueva página para clases
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(42, 26, 94);
    doc.text('Clases Programadas', 14, yPosition);
    yPosition += 10;

    const classesData = formatClassesForExport(data.classes.slice(0, 50));
    autoTable(doc, {
      startY: yPosition,
      head: [['Ruta', 'Docente', 'Fecha', 'Cupos', 'Estado']],
      body: classesData.map(c => [
        c['Ruta Curricular'],
        c.Docente,
        c.Fecha,
        `${c['Cupos Ocupados']}/${c['Cupos Máximos']}`,
        c.Estado
      ]),
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 53] },
    });

    // Guardar
    doc.save(`reporte-sistema-${new Date().getTime()}.pdf`);

    return { success: true, message: 'Reporte completo generado exitosamente' };
  } catch (error: unknown) {
    console.error('Error al generar reporte:', error);
    return { success: false, message: 'Error al generar reporte' };
  }
};
