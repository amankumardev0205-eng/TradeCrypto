import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-panel p-5 rounded-2xl animate-pulse flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-24 h-4 bg-white/10 rounded"></div>
      <div className="w-10 h-10 bg-white/10 rounded-full"></div>
    </div>
    <div className="w-36 h-8 bg-white/10 rounded mt-2"></div>
    <div className="w-20 h-4 bg-white/10 rounded"></div>
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="animate-pulse border-b border-white/5">
    <td className="p-4"><div className="w-24 h-4 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="w-20 h-4 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="w-20 h-4 bg-white/10 rounded"></div></td>
    <td className="p-4"><div className="w-12 h-6 bg-white/10 rounded-full"></div></td>
  </tr>
);

export const SkeletonChart = () => (
  <div className="w-full h-64 glass-panel rounded-2xl animate-pulse p-4 flex items-end gap-2">
    {[40, 65, 30, 80, 55, 90, 70, 45, 85, 60, 95].map((h, idx) => (
      <div
        key={idx}
        style={{ height: `${h}%` }}
        className="flex-1 bg-white/10 rounded-t-sm"
      ></div>
    ))}
  </div>
);

export default { SkeletonCard, SkeletonTableRow, SkeletonChart };
