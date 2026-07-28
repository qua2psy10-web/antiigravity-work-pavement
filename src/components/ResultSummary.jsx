import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ResultSummary({ targetTA, taPrime, totalThickness }) {
  const isPass = taPrime >= targetTA;
  const diff = Math.round((taPrime - targetTA) * 100) / 100;
  const marginRatio = targetTA > 0 ? Math.round(((taPrime / targetTA) * 100)) : 100;

  return (
    <div className={`result-banner ${isPass ? 'is-ok' : 'is-ng'}`}>
      <div className="result-metric-group">
        <div className="metric-item">
          <span className="metric-label">目標 $T_A$ (必要換算厚)</span>
          <span className="metric-value">{targetTA.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span></span>
        </div>

        <div className="metric-item">
          <span className="metric-label">設計 $T_A'$ (層構造換算厚)</span>
          <span className={`metric-value ${isPass ? 'highlight-ok' : 'highlight-ng'}`}>
            {taPrime.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span>
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">全舗装厚 $H$</span>
          <span className="metric-value">{totalThickness.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span></span>
        </div>

        <div className="metric-item">
          <span className="metric-label">{diff >= 0 ? '判定余剰厚' : '判定不足厚'}</span>
          <span className={`metric-value ${diff >= 0 ? 'highlight-ok' : 'highlight-ng'}`}>
            {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
        <div className={`result-badge-large ${isPass ? 'badge-success' : 'badge-danger'}`}>
          {isPass ? (
            <>
              <CheckCircle2 size={28} />
              <span>適 合 (OK)</span>
            </>
          ) : (
            <>
              <XCircle size={28} />
              <span>不 適合 (NG)</span>
            </>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {isPass 
            ? `目標TAに対して 充足率 ${marginRatio}% (安全)` 
            : `目標TAに対して ${Math.abs(diff).toFixed(2)}cm 不足しています`}
        </span>
      </div>
    </div>
  );
}
