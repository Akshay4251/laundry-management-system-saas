export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased print:bg-white print:p-0">
      {/* 
        We reset styles here to ensure external Dashboard CSS 
        doesn't bleed into the print view 
      */}
      <style>{`
        @media print {
          @page { margin: 0; }
          body { background: white; }
        }
      `}</style>
      {children}
    </div>
  );
}