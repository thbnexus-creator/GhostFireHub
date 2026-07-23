import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'table-row' | 'chart';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1
}) => {
  const baseClass = 'bg-slate-900/80 animate-pulse rounded-xl border border-slate-800/40';

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'h-48 w-full';
      case 'avatar':
        return 'h-10 w-10 rounded-full shrink-0';
      case 'table-row':
        return 'h-12 w-full my-1';
      case 'chart':
        return 'h-64 w-full';
      case 'text':
      default:
        return 'h-4 w-full my-1';
    }
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`${baseClass} ${getVariantStyles()} ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeletonGrid: React.FC<{ cards?: number; columns?: string }> = ({
  cards = 4,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
}) => (
  <div className={`grid ${columns} gap-4`}>
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl space-y-3 animate-pulse">
        <Skeleton variant="card" className="h-32 rounded-xl" />
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton variant="text" className="w-16 h-8 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
