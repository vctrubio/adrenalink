import { Examples } from "@/src/components/onboarding/pdf/Examples";
import { PdfHeader } from "@/src/components/onboarding/pdf/PdfHeader";
import { PowerOfAdrenalink } from "@/src/components/onboarding/pdf/PowerOfAdrenalink";
import { Services } from "@/src/components/onboarding/pdf/Services";
import { WhoWeAre } from "@/src/components/onboarding/pdf/WhoWeAre";

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
        }
      `}} />
      <div 
        className="w-[297mm] min-h-[420mm] bg-white shadow-2xl relative border border-gray-200 print:shadow-none print:border-none print:w-full print:h-auto"
        style={{ contentVisibility: 'auto' }}
      >
        <PdfHeader />
        
        <div className="px-[10mm] pb-[20mm] space-y-12">
          <WhoWeAre />
          <Services />
          <Examples />
          <PowerOfAdrenalink />
        </div>
      </div>
    </div>
  );
}