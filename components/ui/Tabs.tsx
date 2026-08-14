'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, variant = 'underline', className }: TabsProps) {
  return (
    <div className={cn(
      variant === 'underline' ? 'border-b border-default' : 'bg-app p-1 rounded-xl inline-flex',
      className
    )}>
      <div className={cn('flex', variant === 'underline' ? 'gap-0' : 'gap-1')}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 font-medium transition-all duration-200 text-sm',
              variant === 'underline'
                ? cn(
                  'px-4 py-2.5 border-b-2 -mb-px',
                  tab.id === activeTab
                    ? 'border-sigo-primary text-sigo-primary'
                    : 'border-transparent text-secondary hover:text-primary hover:border-slate-300'
                )
                : cn(
                  'px-3 py-1.5 rounded-lg',
                  tab.id === activeTab
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-secondary hover:text-primary'
                )
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                tab.id === activeTab ? 'bg-sigo-primary text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return { activeTab, setActiveTab };
}
