import React from 'react';

export interface StatTileItem {
  label: string;
  value: string | number;
  subValue?: string;
  onClick?: () => void;
  accent?: 'normal' | 'overdue' | 'due' | 'paid';
}

interface StatTileStripProps {
  tiles: StatTileItem[];
}

export const StatTileStrip: React.FC<StatTileStripProps> = ({ tiles }) => {
  return (
    <div className="bg-surface border border-line rounded-[16px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden mb-6 shadow-sm">
      {tiles.map((tile, idx) => {
        const isClickable = Boolean(tile.onClick);
        return (
          <div
            key={idx}
            onClick={tile.onClick}
            className={`p-5 lg:p-6 border-b sm:border-b-0 border-r border-[#E2D5BF] last:border-r-0 ${
              isClickable ? 'cursor-pointer hover:bg-ground/50 transition-colors' : ''
            }`}
          >
            <div className="text-[12px] uppercase tracking-[0.08em] text-[#75634F] font-semibold mb-1.5 flex items-center justify-between">
              <span>{tile.label}</span>
              {isClickable && (
                <span className="text-[10px] text-terracotta normal-case font-normal">View &rarr;</span>
              )}
            </div>
            <div
              className={`font-serif text-[34px] lg:text-[38px] leading-tight tnum ${
                tile.accent === 'overdue'
                  ? 'text-overdue'
                  : tile.accent === 'due'
                  ? 'text-due'
                  : tile.accent === 'paid'
                  ? 'text-paid'
                  : 'text-ink'
              }`}
            >
              {tile.value}
            </div>
            {tile.subValue && (
              <div className="text-xs text-muted-text mt-1 tnum">{tile.subValue}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

