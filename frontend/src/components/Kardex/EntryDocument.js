import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateEntryPDF = (entryData) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('SISTEMA DE INVENTARIO', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Documento de Entrada de Mercancía', 105, 30, { align: 'center' });
  
  // Información del documento
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Número de Entrada: ${entryData.movementNumber}`, 14, 55);
  doc.text(`Fecha: ${new Date(entryData.date).toLocaleDateString()}`, 14, 65);
  doc.text(`Contrato: ${entryData.contractNumber || 'N/A'}`, 14, 75);
  
  // Información del proveedor
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL PROVEEDOR', 14, 90);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text(`Nombre: ${entryData.Supplier?.name || 'N/A'}`, 14, 100);
  doc.text(`NIT: ${entryData.Supplier?.nit || 'N/A'}`, 14, 107);
  doc.text(`Email: ${entryData.Supplier?.email || 'N/A'}`, 14, 114);
  doc.text(`Teléfono: ${entryData.Supplier?.phone || 'N/A'}`, 14, 121);
  
  // Tabla de productos
  const tableData = entryData.KardexItems.map((item, index) => [
    index + 1,
    item.Product?.sku || 'N/A',
    item.Product?.name || 'N/A',
    item.quantity,
    `$${parseFloat(item.unitPrice).toFixed(2)}`,
    `$${parseFloat(item.totalPrice).toFixed(2)}`,
    `${item.previousStock} → ${item.newStock}`
  ]);

  doc.autoTable({
    startY: 135,
    head: [['#', 'SKU', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Stock']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 9 },
  });

  // Totales
  const totalItems = entryData.KardexItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = entryData.KardexItems.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0);
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Items: ${totalItems}`, 14, finalY);
  doc.text(`Valor Total: $${totalValue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`, 140, finalY);
  
  // Firmas
  const signatureY = finalY + 40;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // Línea de firma Jefe de Almacén
  doc.line(14, signatureY, 80, signatureY);
  doc.text('Jefe de Almacén', 47, signatureY + 5, { align: 'center' });
  doc.text('Firma Digital', 47, signatureY + 10, { align: 'center' });
  doc.text(entryData.warehouseChiefSignature || '✓ Verificado', 47, signatureY + 15, { align: 'center' });
  
  // Línea de firma Responsable
  doc.line(130, signatureY, 196, signatureY);
  doc.text('Responsable', 163, signatureY + 5, { align: 'center' });
  doc.text(entryData.responsible || '________________', 163, signatureY + 10, { align: 'center' });
  
  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Documento generado automáticamente por el Sistema de Inventario', 105, 280, { align: 'center' });
  doc.text(`Fecha de impresión: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
  
  // Guardar PDF
  doc.save(`Entrada_${entryData.movementNumber}.pdf`);
};

export default generateEntryPDF;