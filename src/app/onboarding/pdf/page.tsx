import { Examples } from "@/src/components/onboarding/pdf/Examples";
import { PdfHeader, PdfDescription, FindOutMoreFooter } from "@/src/components/onboarding/pdf/PdfHeader";
import { Services } from "@/src/components/onboarding/pdf/Services";
import { WhoWeAre } from "@/src/components/onboarding/pdf/WhoWeAre";
import Link from "next/link";

export const PDF_DESCRIPTION_TEXT_CLASS = "text-base text-muted-foreground tracking-wider";
export const PDF_DESCRIPTION_LABEL_WIDTH = "min-w-[80px]";

export default function PdfPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12 print:bg-white print:p-0 print:m-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A3;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}} />
      <div 
        className="w-[297mm] min-h-[420mm] bg-white shadow-2xl relative border border-gray-200 print:shadow-none print:border-none print:w-full print:h-auto"
        style={{ contentVisibility: 'auto' }}
      >
        {/* <Link 
          href="https://adrenalink.tech" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-0 right-0 p-4 text-xs text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          Visit us adrenalink.tech
        </Link> */}
        <PdfHeader />
        <PdfDescription />
        
        <div className="px-[10mm] space-y-12 pointer-events-none">
          <Services />

          <Examples />
        </div>
        <FindOutMoreFooter />
        
      </div>
    </div>
  );
}
