'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { Sparkline } from './sparkline';

export function KpiCard({
  label,
  value,
  hint,
  delta,
  series,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: number;
  series?: number[];
  icon: ReactNode;
}) {
  const reduce = useReducedMotion();
  const up = (delta || 0) >= 0;
  return (
    <motion.article
      className="kpi-card"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={reduce ? undefined : { y: -2 }}
    >
      <div className="kpi-card-top">
        <span className="kpi-icon">{icon}</span>
        {typeof delta === 'number' ? (
          <span className={up ? 'kpi-delta up' : 'kpi-delta down'}>
            {up ? '+' : ''}
            {delta}%
          </span>
        ) : null}
      </div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      <div className="kpi-foot">
        <span className="ws-hint">{hint}</span>
        {series && series.length > 1 ? <Sparkline values={series} /> : null}
      </div>
    </motion.article>
  );
}
