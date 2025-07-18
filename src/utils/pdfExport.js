import jsPDF from 'jspdf';

export const exportToPDF = async (data, metrics) => {
  try {
    console.log('PDF Export - Data length:', data.length);
    console.log('PDF Export - Metrics:', metrics);
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Use metrics directly from the passed object
    const totalTransactions = metrics.total;
    const successfulTransactions = metrics.successful;
    const failedTransactions = metrics.failed;
    const conversionRate = metrics.conversionRate.toFixed(1);
    const totalAmount = metrics.successfulRevenue;
    const avgAmount = metrics.averageAmount.toFixed(2);
    
    // Get data from the original data array
    const currencies = [...new Set(data.map(t => t['Initial Currency']).filter(c => c))];
    const methods = [...new Set(data.map(t => t.Method).filter(m => m))];

    // Function to add new page
    const addNewPage = () => {
      pdf.addPage();
      yPosition = margin;
    };

    // Function to check page space
    const checkPageSpace = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        addNewPage();
      }
    };

    // Function to add text with wrapping
    const addText = (text, x, y, options = {}) => {
      const fontSize = options.fontSize || 12;
      const maxWidth = options.maxWidth || pageWidth - 2 * margin;
      
      pdf.setFontSize(fontSize);
      if (options.color) {
        pdf.setTextColor(...options.color);
      }
      if (options.bold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y, options.align ? { align: options.align } : {});
      
      return lines.length * (fontSize * 0.35); // Return text height
    };

    // === TITLE PAGE ===
    // Header with gradient effect
    pdf.setFillColor(41, 128, 185);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    yPosition = 35;
    pdf.setFontSize(32);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FINANCIAL ANALYTICS', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setTextColor(240, 240, 240);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Transaction Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 25;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Decorative line
    yPosition += 30;
    pdf.setDrawColor(41, 128, 185);
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    
    // === KEY METRICS SECTION ===
    yPosition += 40;
    pdf.setFontSize(24);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KEY METRICS', margin, yPosition);
    yPosition += 30;
    
    // Metrics in a professional table format
    const metricsData = [
      ['Total Transactions', totalTransactions.toString()],
      ['Successful Transactions', successfulTransactions.toString()],
      ['Failed Transactions', failedTransactions.toString()],
      ['Conversion Rate', `${conversionRate}%`],
      ['Total Revenue', `${totalAmount.toLocaleString()} TRY`],
      ['Average Transaction', `${avgAmount} TRY`]
    ];
    
    // Create metrics table
    const tableStartY = yPosition;
    const rowHeight = 12;
    const colWidth = (pageWidth - 2 * margin) / 2;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, tableStartY - 8, colWidth, rowHeight, 'F');
    pdf.rect(margin + colWidth, tableStartY - 8, colWidth, rowHeight, 'F');
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('Metric', margin + 5, tableStartY);
    pdf.text('Value', margin + colWidth + 5, tableStartY);
    
    // Table rows
    metricsData.forEach(([label, value], index) => {
      const rowY = tableStartY + (index + 1) * rowHeight;
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      
      pdf.rect(margin, rowY - 8, colWidth, rowHeight, 'F');
      pdf.rect(margin + colWidth, rowY - 8, colWidth, rowHeight, 'F');
      
      // Border
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, rowY - 8, margin + colWidth * 2, rowY - 8);
      
      // Text
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(label, margin + 5, rowY);
      
      pdf.setFont('helvetica', 'bold');
      if (label.includes('Rate') || label.includes('Revenue')) {
        pdf.setTextColor(41, 128, 185);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.text(value, margin + colWidth + 5, rowY);
    });
    
    yPosition = tableStartY + (metricsData.length + 1) * rowHeight + 20;
    
    // === DATA ANALYSIS SECTION ===
    checkPageSpace(100);
    
    pdf.setFontSize(20);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATA ANALYSIS', margin, yPosition);
    yPosition += 25;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    // Status analysis
    const successPercentage = ((successfulTransactions / totalTransactions) * 100).toFixed(1);
    const failPercentage = ((failedTransactions / totalTransactions) * 100).toFixed(1);
    
    pdf.text(`✓ Successful operations: ${successfulTransactions} (${successPercentage}%)`, margin, yPosition);
    yPosition += 8;
    pdf.text(`✗ Failed operations: ${failedTransactions} (${failPercentage}%)`, margin, yPosition);
    yPosition += 15;
    
    // Currency and method analysis
    pdf.text(`Currencies: ${currencies.join(', ')}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Payment methods: ${methods.join(', ')}`, margin, yPosition);
    yPosition += 25;
    
    // === RECOMMENDATIONS SECTION ===
    checkPageSpace(120);
    
    pdf.setFontSize(18);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECOMMENDATIONS', margin, yPosition);
    yPosition += 20;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    const recommendations = [];
    
    if (parseFloat(conversionRate) < 50) {
      recommendations.push('• Low conversion rate - analyze failure patterns and optimize payment flow');
    } else if (parseFloat(conversionRate) > 80) {
      recommendations.push('• Excellent conversion rate - maintain current performance level');
    } else {
      recommendations.push('• Good conversion rate - potential for improvement through optimization');
    }
    
    if (parseFloat(avgAmount) < 500) {
      recommendations.push('• Low average transaction amount - consider strategies to increase ticket size');
    }
    
    recommendations.push('• Implement real-time transaction monitoring');
    recommendations.push('• Regular pattern analysis for optimization');
    recommendations.push('• Consider A/B testing for payment methods');
    recommendations.push('• Monitor currency conversion rates');
    
    recommendations.forEach(rec => {
      checkPageSpace(10);
      pdf.text(rec, margin, yPosition);
      yPosition += 8;
    });
    
    // === NEW PAGE FOR TRANSACTIONS ===
    addNewPage();
    
    pdf.setFontSize(20);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION DETAILS', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Showing first 60 records of ${data.length} total transactions`, margin, yPosition);
    yPosition += 20;
    
    // Table headers
    const headers = ['ID', 'Status', 'Amount', 'Currency', 'Method'];
    const colWidths = [35, 25, 30, 20, 25];
    let xPosition = margin;
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    
    // Header background
    pdf.setFillColor(41, 128, 185);
    pdf.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
    
    headers.forEach((header, index) => {
      pdf.text(header, xPosition + 3, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 15;
    
    // Table data
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    const transactionsToShow = data.slice(0, 60);
    
    transactionsToShow.forEach((transaction, index) => {
      if (yPosition > pageHeight - 40) {
        addNewPage();
        
        // Repeat headers on new page
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setFillColor(41, 128, 185);
        pdf.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
        
        xPosition = margin;
        headers.forEach((header, index) => {
          pdf.setTextColor(255, 255, 255);
          pdf.text(header, xPosition + 3, yPosition);
          xPosition += colWidths[index];
        });
        yPosition += 15;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
      }
      
      xPosition = margin;
      const status = transaction.Status;
      const amount = parseFloat(transaction['Charged Amount'] || transaction['Initial Amount'] || 0);
      
      const rowData = [
        (transaction['Reference ID']?.substring(0, 8) + '...') || 'N/A',
        status === 'success' ? 'SUCCESS' : 'FAIL',
        amount.toLocaleString(),
        transaction['Charged Currency'] || transaction['Initial Currency'] || 'TRY',
        transaction.Method || 'APM'
      ];
      
      // Row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, 10, 'F');
      
      rowData.forEach((cell, cellIndex) => {
        if (cellIndex === 1) {
          // Status color
          if (status === 'success') {
            pdf.setTextColor(39, 174, 96);
          } else {
            pdf.setTextColor(231, 76, 60);
          }
        } else {
          pdf.setTextColor(60, 60, 60);
        }
        
        pdf.text(cell.toString(), xPosition + 3, yPosition);
        xPosition += colWidths[cellIndex];
      });
      
      yPosition += 8;
      
      // Separator line every 10 rows
      if ((index + 1) % 10 === 0) {
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 3;
      }
    });
    
    // === FINAL STATISTICS ===
    yPosition += 25;
    checkPageSpace(80);
    
    pdf.setFontSize(16);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUMMARY STATISTICS', margin, yPosition);
    yPosition += 20;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    const maxAmount = Math.max(...data.map(t => parseFloat(t['Initial Amount']) || 0));
    const minAmount = Math.min(...data.map(t => parseFloat(t['Initial Amount']) || 0));
    
    const finalStats = [
      `Total operations: ${totalTransactions}`,
      `Successful: ${successfulTransactions} (${conversionRate}%)`,
      `Failed: ${failedTransactions} (${(100 - parseFloat(conversionRate)).toFixed(1)}%)`,
      `Total successful revenue: ${totalAmount.toLocaleString()} TRY`,
      `Average transaction: ${avgAmount} TRY`,
      `Maximum amount: ${maxAmount.toLocaleString()} TRY`,
      `Minimum amount: ${minAmount.toLocaleString()} TRY`
    ];
    
    finalStats.forEach(stat => {
      checkPageSpace(10);
      pdf.text(stat, margin, yPosition);
      yPosition += 8;
    });
    
    // === FOOTER ON ALL PAGES ===
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer line
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text('Financial Analytics Dashboard 2025', pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
    
    // Save PDF
    const fileName = `financial-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF successfully created:', fileName);
    return true;
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
};

export const exportChartsToImage = async (chartElement) => {
  try {
    // Simple export without html2canvas for compatibility
    if (chartElement && chartElement.toDataURL) {
      return chartElement.toDataURL('image/png');
    }
    
    // If html2canvas is available, use it
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: 'transparent',
        scale: 2
      });
      return canvas.toDataURL('image/png');
    }
    
    console.warn('Chart export not available');
    return null;
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
}; 