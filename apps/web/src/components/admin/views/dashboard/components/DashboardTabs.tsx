'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { DashboardTabId } from '../DashboardView';

interface TabConfig {
  id: DashboardTabId;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardTabsProps {
  tabs: TabConfig[];
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
}

export function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex-shrink-0 px-4 py-3">
      <div className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive ? '#fff' : 'var(--admin-text-muted)',
              }}
            >
              {/* Active background indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${tab.color}90 0%, ${tab.color}50 100%)`,
                    boxShadow: `0 4px 20px ${tab.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Hover effect for inactive tabs */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              )}

              {/* Icon and label */}
              <span className="relative z-10 flex items-center gap-2">
                <Icon
                  className="w-4 h-4 transition-transform duration-200"
                  style={{
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    filter: isActive ? `drop-shadow(0 0 8px ${tab.color})` : 'none',
                  }}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>

              {/* Active glow effect */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(ellipse at center, ${tab.color}20 0%, transparent 70%)`,
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 50%)',
          }}
        />
      </div>
    </div>
  );
}
