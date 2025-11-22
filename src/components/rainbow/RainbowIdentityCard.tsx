"use client";

import { RAINBOW_COLORS } from "@/config/rainbow-entities";
import type { EntityConfig } from "@/types/rainbow-types";

export const RainbowIdentityCard = ({ entity }: { entity: EntityConfig }) => {
  const shade = entity.shadeId;
  const shadeColor = RAINBOW_COLORS[shade];
  const Icon = entity.icon;

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
      {/* ID Card */}
      <div
        className="relative rounded-2xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl"
        style={{
          borderColor: shadeColor.fill,
          boxShadow: `0 20px 60px ${shadeColor.fill}40, 0 0 0 4px ${shadeColor.fill}20`,
        }}
      >
        {/* Card Header - Color Stripe */}
        <div
          className="h-3"
          style={{
            background: `linear-gradient(90deg, ${shadeColor.fill}, ${shadeColor.hoverFill})`,
          }}
        />

        {/* Card Body */}
        <div className="p-8 bg-black/60">
          {/* Top Section - Icon and Name */}
          <div className="flex items-center gap-6 mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${shadeColor.fill}20`,
                border: `3px solid ${shadeColor.fill}`,
              }}
            >
              <div style={{ color: shadeColor.fill }}>
                <Icon className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{entity.name}</h3>
              <div className="text-sm tracking-wider text-white/60 mb-1">Type: {entity.id}</div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px my-6"
            style={{
              background: `linear-gradient(90deg, transparent, ${shadeColor.fill}60, transparent)`,
            }}
          />

          {/* Info Sections */}
          {entity.info.description && (
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-white/60 mb-2">About</div>
              <p className="text-white/90 leading-relaxed">{entity.info.description}</p>
            </div>
          )}

          {/* Iterate over schema fields with example data from first row */}
          {Object.entries(entity.info.schema).map(([fieldName, fieldType], index) => {
            const firstRow = entity.info.rows[0];
            const value = firstRow?.[index];
            if (value === null || value === undefined) return null;

            return (
              <div key={fieldName} className="mb-6">
                <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{fieldName}</div>
                <p className="text-white/90 leading-relaxed">{value}</p>
              </div>
            );
          })}
        </div>

        {/* Card Footer - Gradient Bar */}
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${shadeColor.hoverFill}, ${shadeColor.fill})`,
          }}
        />
      </div>
    </div>
  );
};
