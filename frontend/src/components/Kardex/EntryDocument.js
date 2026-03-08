import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ← Importación correcta del plugin

export const generateEntryPDF = (entryData) => {
  const doc = new jsPDF();
  
  // === Encabezado ===
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('SISTEMA DE INVENTARIO', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Documento de Entrada de Mercancía', 105, 30, { align: 'center' });
  
  // === Información del documento ===
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Número de Entrada: ${entryData.movementNumber}`, 14, 55);
  doc.text(`Fecha: ${new Date(entryData.date).toLocaleDateString()}`, 14, 65);
  doc.text(`Contrato: ${entryData.contractNumber || 'N/A'}`, 14, 75);
  
  // === Información del proveedor ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL PROVEEDOR', 14, 90);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  
  const supplier = entryData.Supplier || {};
  doc.text(`Nombre: ${supplier.name || 'N/A'}`, 14, 100);
  doc.text(`NIT: ${supplier.nit || 'N/A'}`, 14, 107);
  doc.text(`Email: ${supplier.email || 'N/A'}`, 14, 114);
  doc.text(`Teléfono: ${supplier.phone || 'N/A'}`, 14, 121);
  
  // === Preparar datos para la tabla ===
  const tableData = (entryData.KardexItems || []).map((item, index) => [
    index + 1,
    item.Product?.sku || 'N/A',
    item.Product?.name || 'N/A',
    item.quantity,
    `$${parseFloat(item.unitPrice).toFixed(2)}`,
    `$${parseFloat(item.totalPrice).toFixed(2)}`,
    `${item.previousStock} → ${item.newStock}`
  ]);

  // === Generar tabla con autoTable (USANDO LA FUNCIÓN IMPORTADA) ===
  autoTable(doc, {
    startY: 135,
    head: [['#', 'SKU', 'Producto', 'Cant.', 'Precio Unit.', 'Total', 'Stock']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 64, 175],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 30, halign: 'center' }
    }
  });

  // === Totales ===
  const totalItems = (entryData.KardexItems || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalValue = (entryData.KardexItems || []).reduce((acc, item) => {
    return acc + (parseFloat(item.totalPrice) || 0);
  }, 0);
  
  const finalY = doc.lastAutoTable?.finalY || 135;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Items: ${totalItems}`, 14, finalY + 15);
  doc.text(`Valor Total: $${totalValue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 140, finalY + 15);
  
  // === Firmas ===
  const signatureY = finalY + 45;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  
  // Línea de firma - Jefe de Almacén
  doc.line(14, signatureY, 90, signatureY);
  doc.text('Jefe de Almacén', 52, signatureY + 5, { align: 'center' });
  doc.text('Firma Digital', 52, signatureY + 10, { align: 'center' });
  doc.setTextColor(16, 185, 129);
  doc.text('✓ Verificado', 52, signatureY + 15, { align: 'center' });
  
  // Línea de firma - Responsable
  doc.setTextColor(0, 0, 0);
  doc.line(120, signatureY, 196, signatureY);
  doc.text('Responsable', 158, signatureY + 5, { align: 'center' });
  doc.text(entryData.responsible || '________________', 158, signatureY + 10, { align: 'center' });
  
  // === Pie de página ===
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Documento generado automáticamente por el Sistema de Inventario', 105, 280, { align: 'center' });
  doc.text(`Fecha de impresión: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
  
  // === Guardar PDF ===
  doc.save(`Entrada_${entryData.movementNumber}.pdf`);
  
  return doc;
};

export default generateEntryPDF;