"use client";

import Image from "next/image";
import { Printer, Share2 } from "lucide-react";
import toast from "react-hot-toast";

export function AdrenalinkBranding({ logoSize = "w-16 h-16", gap = "gap-2" }: { logoSize?: string; gap?: string }) {
  return (
    <div className={`flex items-center ${gap}`}>
      <div className={`relative ${logoSize} transition-transform duration-300`}>
        <Image 
          src="/ADR.webp" 
          alt="Adrenalink Logo" 
          fill 
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-4xl font-semibold text-foreground tracking-wide">
          Adrenalink
        </h1>
        <span className="text-sm text-muted-foreground font-mono tracking-wide uppercase">
          Connecting Students
        </span>
      </div>
    </div>
  );
}

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
      <AdrenalinkBranding />

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
