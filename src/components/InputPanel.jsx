import React from 'react';
import { TRAFFIC_CLASSES, STANDARD_CBR_VALUES } from '../utils/pavementCalculations';
import { Sliders, Sparkles, Building, Waypoints, Calculator } from 'lucide-react';

export default function InputPanel({
  projectInfo,
  setProjectInfo,
  trafficClass,
  setTrafficClass,
  customN,
  setCustomN,
  useCustomN,
  setUseCustomN,
  cbr,
  setCbr,
  taMode,
  setTaMode,
  onApplyRecommended
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Sliders size={20} />
          <span>設計条件の入力</span>
        </h2>
        <button 
          className="btn btn-accent btn-sm"
          onClick={onApplyRecommended}
          title="現在の条件に応じた標準的な層構造を自動設定します"
        >
          <Sparkles size={16} />
          <span>標準構成を自動セット</span>
        </button>
      </div>

      {/* 工事概要入力 */}
      <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">
            <span><Building size={14} style={{ marginRight: 4 }} /> 工事名</span>
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={projectInfo.name} 
            onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
            placeholder="例: ○○道路舗装新設工事"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span><Waypoints size={14} style={{ marginRight: 4 }} /> 路線名 / 施行場所</span>
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={projectInfo.location} 
            onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
            placeholder="例: 一般国道○○号 12.5km地点"
          />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }} />

      {/* 交通量 & CBR */}
      <div className="form-grid">
        {/* 大型車交通量区分 */}
        <div className="form-group">
          <label className="form-label">大型車交通量区分</label>
          <select 
            className="form-control" 
            value={trafficClass} 
            onChange={(e) => setTrafficClass(e.target.value)}
          >
            {TRAFFIC_CLASSES.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input 
                type="checkbox" 
                checked={useCustomN} 
                onChange={(e) => setUseCustomN(e.target.checked)} 
              />
              大型車台数を直接指定 (台/日・方向)
            </label>
          </div>
          {useCustomN && (
            <input 
              type="number" 
              className="form-control" 
              style={{ marginTop: '0.4rem' }}
              value={customN} 
              onChange={(e) => setCustomN(Math.max(1, Number(e.target.value)))} 
              placeholder="大型車台数 N (台/日・方向)"
            />
          )}
        </div>

        {/* 設計CBR */}
        <div className="form-group">
          <label className="form-label">
            <span>路床の設計CBR (%)</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>CBR = {cbr}%</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="1" 
              className="form-control" 
              value={cbr} 
              onChange={(e) => setCbr(Number(e.target.value))} 
              style={{ flex: 1 }}
            />
            <input 
              type="number" 
              className="form-control" 
              style={{ width: '70px', textAlign: 'center' }} 
              value={cbr} 
              onChange={(e) => setCbr(Math.max(1, Math.min(50, Number(e.target.value))))}
            />
          </div>
          {/* 定型CBRボタン */}
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {STANDARD_CBR_VALUES.map(val => (
              <button
                key={val}
                className={`btn btn-sm ${cbr === val ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                onClick={() => setCbr(val)}
              >
                CBR {val}%
              </button>
            ))}
          </div>
        </div>

        {/* 目標TA算定モード */}
        <div className="form-group">
          <label className="form-label">
            <span><Calculator size={14} style={{ marginRight: 4 }} /> 目標 $T_A$ 算定方式</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              className={`btn btn-sm ${taMode === 'formula' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setTaMode('formula')}
            >
              公式算定 (20.8·N^0.6/CBR^0.6)
            </button>
            <button
              className={`btn btn-sm ${taMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => setTaMode('table')}
            >
              指針標準表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
