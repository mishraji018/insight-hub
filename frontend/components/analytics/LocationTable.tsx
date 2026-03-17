"use client";

import { MapPin } from 'lucide-react';

interface LocationTableProps {
  locations: Array<{ country: string; count: number }>;
}

export function LocationTable({ locations }: LocationTableProps) {
  return (
    <div className="bg-surface border border-surface2 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-accent" />
        <h3 className="text-lg font-semibold text-text">User Distribution</h3>
      </div>
      <div className="space-y-4">
        {locations.length > 0 ? (
          locations.map((loc, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-xs font-bold text-muted">
                  {loc.country.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text">{loc.country}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-text">{loc.count.toLocaleString()}</span>
                <span className="text-[10px] text-muted uppercase">Users</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No location data available.</p>
        )}
      </div>
    </div>
  );
}
