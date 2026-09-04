import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 ${rounded} ${className}`}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3 w-1/3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5 w-full">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AttendanceSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Control Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
          <div className="md:col-span-8 space-y-1.5">
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-48 rounded-xl" />
              <Skeleton className="h-9 w-20 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-48 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={6} />
    </div>
  );
};

export const DashboardSkeleton = ({ isStudent = false }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols (Schedule or Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1 w-2/3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col (Notices, Calendar, Quick Actions) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
