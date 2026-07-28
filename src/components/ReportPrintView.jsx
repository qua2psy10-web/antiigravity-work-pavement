import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ReportPrintView({
  projectInfo,
  trafficClass,
  customN,
  useCustomN,
  cbr,
  taMode,
  targetTA,
  taPrime,
  totalThickness,
  evaluatedLayers,
  isPass
}) {
  const dateStr = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="print-only-container">
      <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>アスファルト舗装設計計算書 (TA法)</h1>
        <p style={{ fontSize: '10pt', margin: 0 }}>公益社団法人 日本道路協会「舗装設計施工指針」に拠る</p>
      </div>

      {/* 基本情報 */}
      <table className="print-table" style={{ marginBottom: '20px' }}>
        <tbody>
          <tr>
            <th style={{ width: '18%' }}>工事名</th>
            <td style={{ width: '42%' }}>{projectInfo.name || '舗装新設工事'}</td>
            <th style={{ width: '15%' }}>作成日</th>
            <td style={{ width: '25%' }}>{dateStr}</td>
          </tr>
          <tr>
            <th>施工場所 / 路線</th>
            <td>{projectInfo.location || '一般道路'}</td>
            <th>設計方式</th>
            <td>TA法 (Target TA Method)</td>
          </tr>
        </tbody>
      </table>

      {/* 1. 設計条件 */}
      <h2 style={{ fontSize: '12pt', borderLeft: '4px solid #333', paddingLeft: '8px', margin: '15px 0 8px 0' }}>
        1. 設計条件
      </h2>
      <table className="print-table">
        <tbody>
          <tr>
            <th style={{ width: '30%' }}>路床の設計CBR (%)</th>
            <td style={{ fontSize: '11pt', fontWeight: 'bold' }}>CBR = {cbr} %</td>
          </tr>
          <tr>
            <th>大型車交通量区分</th>
            <td>
              {trafficClass} 交通
              {useCustomN && ` (指定大型車台数 N = ${customN} 台/日・方向)`}
            </td>
          </tr>
          <tr>
            <th>目標 TA 算定方式</th>
            <td>
              {taMode === 'formula' 
                ? `公式算定: T_A = (20.8 × N^0.6) / (CBR^0.6)` 
                : `舗装設計施工指針 標準表参照`}
            </td>
          </tr>
          <tr>
            <th style={{ backgroundColor: '#eef2f7' }}>必要目標換算厚 (目標 TA)</th>
            <td style={{ fontSize: '12pt', fontWeight: 'bold', backgroundColor: '#eef2f7' }}>
              T_A = {targetTA.toFixed(1)} cm
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. 舗装層構成および換算厚計算表 */}
      <h2 style={{ fontSize: '12pt', borderLeft: '4px solid #333', paddingLeft: '8px', margin: '20px 0 8px 0' }}>
        2. 舗装層構成および換算厚計算 (T_A' = ∑ a_i · h_i)
      </h2>
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>区分</th>
            <th style={{ width: '40%' }}>使用材料</th>
            <th style={{ width: '15%', textAlign: 'right' }}>相対強度係数 a_i</th>
            <th style={{ width: '15%', textAlign: 'right' }}>厚さ h_i (cm)</th>
            <th style={{ width: '15%', textAlign: 'right' }}>換算厚 a_i h_i (cm)</th>
          </tr>
        </thead>
        <tbody>
          {evaluatedLayers.map((layer, idx) => (
            <tr key={idx}>
              <td>{layer.name || layer.category}</td>
              <td>{layer.materialName}</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{layer.a.toFixed(2)}</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{layer.thickness} cm</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {layer.layerTa.toFixed(2)} cm
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <td colSpan="3" style={{ textAlign: 'right' }}>合計 (全舗装厚 H &amp; 設計換算厚 T_A')</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>H = {totalThickness} cm</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '11pt' }}>
              T_A' = {taPrime.toFixed(2)} cm
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 3. 総合判定 */}
      <h2 style={{ fontSize: '12pt', borderLeft: '4px solid #333', paddingLeft: '8px', margin: '20px 0 8px 0' }}>
        3. 構造設計 総合判定
      </h2>
      <div style={{
        border: isPass ? '2px solid #10b981' : '2px solid #f43f5e',
        padding: '12px 18px',
        borderRadius: '6px',
        backgroundColor: isPass ? '#f0fdf4' : '#fff1f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', color: isPass ? '#047857' : '#be123c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPass ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <span>判定結果: {isPass ? '適合 (OK) - 設計基準を満たしています' : '不適合 (NG) - 換算厚が不足しています'}</span>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '10pt', color: '#4b5563' }}>
            【条件式】 T_A' ({taPrime.toFixed(2)} cm) ≧ T_A ({targetTA.toFixed(1)} cm)
            &nbsp;｜&nbsp; 余剰厚: {(taPrime - targetTA).toFixed(2)} cm
          </p>
        </div>
      </div>

      {/* 4. 舗装構造断面図 */}
      <h2 style={{ fontSize: '12pt', borderLeft: '4px solid #333', paddingLeft: '8px', margin: '20px 0 8px 0' }}>
        4. 舗装構造 断面概略図
      </h2>
      <div style={{ textAlign: 'center', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <svg width="400" height="240" viewBox="0 0 400 240">
          {/* 白黒印刷用グラフィック */}
          <rect x="50" y="20" width="300" height="180" fill="none" stroke="#000" strokeWidth="2"/>
          {/* 各層ライン */}
          {(() => {
            let y = 20;
            const hScale = 180 / Math.max(1, totalThickness);
            return evaluatedLayers.map((l, i) => {
              const h = l.thickness * hScale;
              const curY = y;
              y += h;
              return (
                <g key={i}>
                  <rect x="50" y={curY} width="300" height={h} fill={i % 2 === 0 ? '#e0e0e0' : '#ffffff'} stroke="#000" strokeWidth="1"/>
                  <text x="200" y={curY + h/2 + 4} textAnchor="middle" fontSize="10" fontWeight="bold">{l.name} ({l.thickness}cm)</text>
                </g>
              );
            });
          })()}
          <text x="200" y="215" textAnchor="middle" fontSize="10" fontWeight="bold">路床 (設計CBR = {cbr}%)</text>
        </svg>
      </div>
    </div>
  );
}
