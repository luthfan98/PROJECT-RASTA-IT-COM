import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useTheme } from '../../context/ThemeContext';
import { X, Printer, Download, Copy, Check, QrCode as QrIcon, ShieldCheck } from 'lucide-react';

export interface RealQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  title: string;
  subtitle: string;
  assetType?: 'SENSOR' | 'PUMP' | 'STATION';
  additionalInfo?: { label: string; value: string }[];
}

export const RealQRCodeModal: React.FC<RealQRCodeModalProps> = ({
  isOpen,
  onClose,
  value,
  title,
  subtitle,
  assetType = 'SENSOR',
  additionalInfo = []
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !value) return;

    // Generate real ISO/IEC 18004 scannable QR code
    QRCode.toDataURL(
      value,
      {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0B132B',
          light: '#FFFFFF'
        }
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );

    // Also draw on canvas for ultra-crisp resolution
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: 220,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#0B132B',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR Canvas generation error:', error);
        }
      );
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${value.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in print:bg-white print:p-0">
      <div 
        className={`w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl relative transition-all print:border-none print:shadow-none print:w-full print:max-w-none print:p-0 ${
          theme === 'dark' ? 'bg-[#0E1726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors print:hidden"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Asset Type */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-black tracking-wider uppercase mb-2">
          <QrIcon className="w-3.5 h-3.5" />
          <span>Label QR Terverifikasi • {assetType}</span>
        </div>

        <h2 className="text-lg font-black tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{subtitle}</p>

        {/* Real Scannable QR Code Canvas Box */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto mb-4 border-2 border-slate-300 dark:border-slate-700 relative group">
          <div className="relative flex items-center justify-center">
            {/* Real QR Code Canvas */}
            <canvas 
              ref={canvasRef} 
              className="w-48 h-48 rounded-lg select-none block"
            />

            {/* Subtle Scanning Crosshairs Overlay */}
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-500/40 rounded-lg" />
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ISO/IEC 18004 Standard • Dapat Discan Kamera</span>
          </div>
        </div>

        {/* Encoded Payload Box */}
        <div className="bg-slate-100 dark:bg-slate-900/80 rounded-xl p-3 mb-4 border border-slate-200 dark:border-slate-800/80 text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payload Terenkode</span>
            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1 text-[11px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400 break-all select-all">
            {value}
          </p>
        </div>

        {/* Additional Info Tags if provided */}
        {additionalInfo.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-5 text-left text-xs">
            {additionalInfo.map((info, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">{info.label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{info.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons (Hidden on Print) */}
        <div className="grid grid-cols-2 gap-2.5 print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-500" />
            <span>Unduh PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 font-bold text-xs text-white shadow-md shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Label Fisik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
