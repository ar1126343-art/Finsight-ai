import React, { useState } from 'react';
import { FileText, Download, X, Printer, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({ isOpen, onClose }) => {
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGeneratePDF = () => {
    setGenerating(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Header styling
        doc.setFillColor(15, 23, 42); // Dark slate header
        doc.rect(0, 0, 210, 297, 'F');
        
        // Brand Header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FinSight AI — Executive Financial Report', 14, 22);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Confidential Decision Analysis`, 14, 30);
        
        // Divider line
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(14, 34, 196, 34);

        // Section 1: Executive Portfolio Summary
        doc.setTextColor(248, 250, 252);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('1. Personal Finance & Portfolio Executive Summary', 14, 45);

        doc.setFillColor(30, 41, 59);
        doc.rect(14, 50, 182, 35, 'F');
        doc.setDrawColor(71, 85, 105);
        doc.rect(14, 50, 182, 35, 'S');

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text('Total Portfolio Value:', 20, 60);
        doc.text('Monthly Savings Rate:', 20, 68);
        doc.text('Institutional Risk Index:', 20, 76);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('$245,850.00', 80, 60);
        doc.text('64.2%', 80, 68);
        doc.text('65 / 100 (Moderate Growth)', 80, 76);

        // Section 2: Equities & AI Thesis
        doc.setTextColor(248, 250, 252);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Gemini AI Equity Decision Thesis', 14, 98);

        doc.setFillColor(30, 41, 59);
        doc.rect(14, 103, 182, 50, 'F');

        doc.setFontSize(10);
        doc.setTextColor(129, 140, 248);
        doc.text('Target Ticker: NVDA (NVIDIA Corporation) — STRONG BUY', 20, 113);

        doc.setTextColor(226, 232, 240);
        doc.setFont('helvetica', 'normal');
        const thesisText = "NVIDIA Corp exhibits dominant market share in data center AI accelerators with revenue growth exceeding 122% YoY. Debt to Equity ratio of 0.41 indicates strong leverage management with solid Free Cash Flow conversion.";
        const splitText = doc.splitTextToSize(thesisText, 170);
        doc.text(splitText, 20, 122);

        // Section 3: DCF Valuation
        doc.setTextColor(248, 250, 252);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. DCF Valuation & Monte Carlo Trajectories', 14, 165);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('DCF Intrinsic Stock Value:', 14, 176);
        doc.text('Total Enterprise Value:', 14, 184);
        doc.text('Monte Carlo Median (1-Yr):', 14, 192);

        doc.setTextColor(52, 211, 153);
        doc.setFont('helvetica', 'bold');
        doc.text('$185.50 per share', 75, 176);
        doc.text('$3.02 Trillion', 75, 184);
        doc.text('$278,400.00', 75, 192);

        // Footer Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'italic');
        doc.text('FinSight AI Model Output. Generated for research purposes. Not regulatory financial advice.', 14, 280);

        // Save PDF file directly to user device!
        doc.save('FinSight_AI_Executive_Financial_Report.pdf');
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setGenerating(false);
      }
    }, 600);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Ticker,Category,Amount,Type\n2026-07-24,AAPL,Investments,1999.00,expense\n2026-07-20,NVDA,Dividend,145.80,income\n2026-07-18,MSFT,Technology,380.00,expense";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "FinSight_AI_Financial_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-300 shadow-2xl space-y-6 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Export Executive Financial Report</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-slate-900 font-extrabold text-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-bold text-slate-900">
          <p className="text-slate-800 leading-relaxed font-semibold">
            FinSight AI will generate and download an executive <strong>PDF Report document</strong> directly to your computer containing:
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold">
              <CheckCircle className="w-4 h-4 text-indigo-600" /> Report Section Breakdown:
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-800 font-bold">
              <li>Personal Monthly Cash Flow & Expense Summary</li>
              <li>Portfolio Sector Concentration & Risk Score</li>
              <li>Stock Technical Indicators & Gemini AI Investment Thesis</li>
              <li>DCF Intrinsic Valuation & Monte Carlo Trajectories</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export Raw CSV</span>
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Printer className="w-4 h-4 text-amber-400" />
            )}
            <span>{generating ? 'Compiling PDF...' : 'Download Executive PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
