"use client";

import { useState } from "react";
import { Rainbow, RainbowShade, ColorMapping } from "@/components/rainbow";

const Index = () => {
  const [hoveredShade, setHoveredShade] = useState<RainbowShade | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-12">
        <Rainbow onShadeHover={setHoveredShade} hoveredShade={hoveredShade} />
        <ColorMapping hoveredShade={hoveredShade} onShadeHover={setHoveredShade} />
      </main>
    </div>
  );
};

export default Index;
