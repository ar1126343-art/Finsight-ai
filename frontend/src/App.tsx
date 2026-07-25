import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { ExpenseTracker } from './components/ExpenseTracker';
import { StockAnalysis } from './components/StockAnalysis';
import { DCFAndMonteCarlo } from './components/DCFAndMonteCarlo';
import { PortfolioRisk } from './components/PortfolioRisk';
import { ScreenerAndCompare } from './components/ScreenerAndCompare';
import { AIAuditLog } from './components/AIAuditLog';
import { PDFExportModal } from './components/PDFExportModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('unified');
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const handleSearchTicker = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* RIVR Video Background Glassmorphism Hero */}
      <Hero
        onOpenPDF={() => setShowPDFModal(true)}
        onOpenHelp={() => setShowUserGuide(true)}
        onSelectTab={setActiveTab}
      />

      {/* Main RIVR Dashboard Content Container */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Personal Finance & Budget Hub */}
        <section id="personal-finance-section">
          <ExpenseTracker />
        </section>

        {/* Real-time Stock Analysis & AI Thesis */}
        <section id="stock-analysis-section">
          <StockAnalysis
            ticker={selectedTicker}
            onSelectTicker={handleSearchTicker}
          />
        </section>

        {/* Quantitative DCF & Monte Carlo Models */}
        <section id="quant-models-section">
          <DCFAndMonteCarlo ticker={selectedTicker} />
        </section>

        {/* Portfolio & Institutional Risk Score */}
        <section id="portfolio-risk-section">
          <PortfolioRisk />
        </section>

        {/* Equity Screener & Comparison Engine */}
        <section id="screener-compare-section">
          <ScreenerAndCompare onSelectTicker={handleSearchTicker} />
        </section>

        {/* SQLite AI Audit Logs */}
        <section id="audit-logs-section">
          <AIAuditLog />
        </section>
      </div>

      {/* Floating Back to Top Button */}
      <ScrollToTopButton />

      {/* Modals */}
      {showPDFModal && (
        <PDFExportModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
        />
      )}

      {showUserGuide && (
        <UserGuideModal
          isOpen={showUserGuide}
          onClose={() => setShowUserGuide(false)}
        />
      )}
    </main>
  );
};

export default App;
