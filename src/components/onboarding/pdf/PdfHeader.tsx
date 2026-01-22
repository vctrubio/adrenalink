"use client";

import Image from "next/image";
import { Printer, Share2 } from "lucide-react";
import toast from "react-hot-toast";

export function PdfHeader() {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Adrenalink Onboarding',
          text: 'Check out the Adrenalink school management overview.',
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex items-center justify-between mb-12 w-full pt-12 px-[10mm]">
      {/* Left side: Logo and Text side-by-side */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 transition-transform duration-300">
          <Image 
            src="/ADR.webp" 
            alt="Adrenalink Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">
            Adrenalink
          </h1>
          <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase mt-1">
            Focus on the water
          </span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full hover:bg-foreground/90 transition-all shadow-sm group"
        >
          <Printer size={16} className="group-active:scale-90 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Print</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-muted border border-border text-foreground rounded-full hover:bg-muted/80 transition-all shadow-sm group"
        >
          <Share2 size={16} className="group-active:scale-90 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Share</span>
        </button>
      </div>
    </div>
  );
}
