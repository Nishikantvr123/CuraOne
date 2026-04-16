import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePrescriptionPDF = (prescription) => {
  try {
    console.log('🔧 Starting PDF generation with data:', {
      id: prescription.id,
      patientName: prescription.patientName,
      diagnosis: prescription.diagnosis,
      medicationsCount: prescription.medications?.length
    });
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header with logo and title
  doc.setFillColor(5, 150, 105); // Emerald color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CuraOne', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ayurvedic Therapy Center', pageWidth / 2, 28, { align: 'center' });
  doc.text('E-Prescription', pageWidth / 2, 35, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Prescription ID and Date
  let yPos = 50;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prescription ID: ${prescription.id}`, 15, yPos);
  doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth - 15, yPos, { align: 'right' });
  
  yPos += 10;
  
  // Patient and Practitioner Information
  doc.setFillColor(249, 250, 251);
  doc.rect(15, yPos, (pageWidth - 30) / 2 - 5, 30, 'F');
  doc.rect((pageWidth - 30) / 2 + 20, yPos, (pageWidth - 30) / 2 - 5, 30, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 20, yPos + 7);
  doc.text('Practitioner Information', (pageWidth - 30) / 2 + 25, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${prescription.patientName}`, 20, yPos + 14);
  doc.text(`Email: ${prescription.patientEmail}`, 20, yPos + 21);
  
  doc.text(`Name: ${prescription.practitionerName}`, (pageWidth - 30) / 2 + 25, yPos + 14);
  doc.text(`License: Certified Ayurvedic Practitioner`, (pageWidth - 30) / 2 + 25, yPos + 21);
  
  yPos += 40;
  
  // Diagnosis
  doc.setFillColor(240, 253, 244);
  doc.rect(15, yPos, pageWidth - 30, 20, 'F');
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('Diagnosis:', 20, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(prescription.diagnosis, 20, yPos + 14);
  
  yPos += 25;
  
  // Duration
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Treatment Duration: ${prescription.duration}`, 20, yPos);
  
  yPos += 10;
  
  // Medications Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('Prescribed Medications', 15, yPos);
  
  yPos += 5;
  
  const medicationData = prescription.medications.map((med, index) => [
    index + 1,
    med.name,
    med.dosage,
    med.frequency,
    med.instructions || '-'
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['#', 'Medicine Name', 'Dosage', 'Frequency', 'Instructions']],
    body: medicationData,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 60 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;
  
  // Special Instructions
  if (prescription.instructions) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(255, 251, 235);
    doc.rect(15, yPos, pageWidth - 30, 'auto', 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(2);
    doc.line(15, yPos, 15, yPos + 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('Special Instructions:', 20, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const instructionLines = doc.splitTextToSize(prescription.instructions, pageWidth - 40);
    doc.text(instructionLines, 20, yPos + 14);
    
    yPos += Math.max(30, instructionLines.length * 5 + 14);
  }
  
  // Notes (if any)
  if (prescription.notes) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 5;
    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPos, pageWidth - 30, 'auto', 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('Additional Notes:', 20, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(prescription.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPos + 14);
    
    yPos += Math.max(25, notesLines.length * 5 + 14);
  }
  
  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated prescription from CuraOne Ayurvedic Therapy Center.', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('For any queries, please contact your practitioner.', pageWidth / 2, footerY + 12, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 18, { align: 'center' });
  
  // Status badge
  const statusColors = {
    active: [34, 197, 94],
    completed: [59, 130, 246],
    cancelled: [239, 68, 68]
  };
  
  const statusColor = statusColors[prescription.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 45, 45, 30, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(prescription.status.toUpperCase(), pageWidth - 30, 50, { align: 'center' });
  
  console.log('✅ PDF generation completed successfully');
  return doc;
  } catch (error) {
    console.error('❌ Error in generatePrescriptionPDF:', error);
    console.error('Prescription data:', prescription);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

export const downloadPrescriptionPDF = (prescription) => {
  try {
    console.log('📄 Generating PDF for prescription:', prescription);
    
    // Validate required fields
    if (!prescription) {
      console.error('❌ No prescription data provided');
      alert('Error: No prescription data available');
      return;
    }
    
    if (!prescription.patientName) {
      console.error('❌ Missing patientName in prescription:', prescription);
      alert('Error: Prescription data is incomplete (missing patient name)');
      return;
    }
    
    const doc = generatePrescriptionPDF(prescription);
    const fileName = `Prescription_${prescription.patientName.replace(/\s+/g, '_')}_${new Date(prescription.createdAt).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    console.log('✅ PDF downloaded successfully:', fileName);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    alert(`Error generating PDF: ${error.message}`);
  }
};

export const viewPrescriptionPDF = (prescription) => {
  try {
    console.log('👁️ Viewing PDF for prescription:', prescription);
    
    // Validate required fields
    if (!prescription) {
      console.error('❌ No prescription data provided');
      alert('Error: No prescription data available');
      return;
    }
    
    if (!prescription.patientName) {
      console.error('❌ Missing patientName in prescription:', prescription);
      alert('Error: Prescription data is incomplete (missing patient name)');
      return;
    }
    
    const doc = generatePrescriptionPDF(prescription);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    console.log('✅ PDF opened in new tab');
  } catch (error) {
    console.error('❌ Error viewing PDF:', error);
    alert(`Error viewing PDF: ${error.message}`);
  }
};
