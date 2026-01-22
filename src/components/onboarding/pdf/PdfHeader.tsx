"use client";

import Image from "next/image";
import Link from "next/link";
import { Printer, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { PDF_DESCRIPTION_TEXT_CLASS, PDF_DESCRIPTION_LABEL_WIDTH } from "@/src/app/onboarding/pdf/page";

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
        <h1 className="text-4xl font-semibold text-primary tracking-wide">
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
          text: 'Adrenalink: Administration Guide for Schools looking to get started',
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
    <div className="flex items-center justify-between my-8 w-full px-[10mm]">
      <Link href="https://adrenalink.tech/onboarding" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        <AdrenalinkBranding />
      </Link>

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

export function PdfDescription() {
  return (
    <div className="border-t-2 border-border py-6 px-[10mm]">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <span className={`text-primary font-bold uppercase text-sm tracking-wide ${PDF_DESCRIPTION_LABEL_WIDTH}`}>Who:</span>
          <p className={`${PDF_DESCRIPTION_TEXT_CLASS} flex-1`}>
            An operating system designed specifically for <em className="text-black">Adrenaline Activity</em>.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <span className={`text-primary font-bold uppercase text-sm tracking-wide ${PDF_DESCRIPTION_LABEL_WIDTH}`}>What:</span>
          <p className={`${PDF_DESCRIPTION_TEXT_CLASS} flex-1`}>
            Where conditions never stand still, we synchronize lesson planning between administrations, students and teachers.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <span className={`text-primary font-bold uppercase text-sm tracking-wide ${PDF_DESCRIPTION_LABEL_WIDTH}`}>Why:</span>
          <p className={`${PDF_DESCRIPTION_TEXT_CLASS} flex-1`}>
            This platform empowers you to focus on what matters most: <span className="text-black">the student experience</span>.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <span className={`text-primary font-bold uppercase text-sm tracking-wide ${PDF_DESCRIPTION_LABEL_WIDTH}`}>Mission:</span>
          <p className={`${PDF_DESCRIPTION_TEXT_CLASS} flex-1`}>
            To eliminate heavy directorial tasks through automation, bringing clarity and transparency to the entire school.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FindOutMoreFooter() {
  return (
    <div className="py-6 px-[10mm] bg-muted/60">
      <p className="text-base text-muted-foreground text-center">
        Visit <Link href="https://adrenalink.tech/onboarding" className="text-foreground font-medium hover:underline" target="_blank" rel="noopener noreferrer">adrenalink.tech/onboarding</Link> to find out more, or <Link href="https://adrenalink.tech/welcome" className="text-foreground font-medium hover:underline" target="_blank" rel="noopener noreferrer">adrenalink.tech/welcome</Link> to register your school.
      </p>
    </div>
  );
}
