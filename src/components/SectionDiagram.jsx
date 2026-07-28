import React from 'react';
import { Eye } from 'lucide-react';

export default function SectionDiagram({ evaluatedLayers, totalThickness, targetTA, taPrime, cbr }) {
  const svgWidth = 460;
  const diagramMaxHeight = 320;
  const roadbedHeight = 50;
  
  // 描画スケールの決定（最低全高200px、最高320pxに収める）
  const usableHeight = Math.max(180, Math.min(diagramMaxHeight, totalThickness * 6));
  const scale = totalThickness > 0 ? usableHeight / totalThickness : 5;

  let currentY = 30; // トップ余白

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h2 className="card-title">
          <Eye size={20} />
          <span>舗装構造 断面図プレビュー (リアルタイム描画)</span>
        </h2>
        <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)' }}>
          全厚 H = {totalThickness} cm
        </span>
      </div>

      <div className="diagram-container" style={{ flex: 1 }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${svgWidth} ${usableHeight + roadbedHeight + 80}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* SVG パターン定義 */}
            {/* アスファルト密粒度 */}
            <pattern id="pat-asphalt-dense" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#2a2d34"/>
              <circle cx="3" cy="3" r="1.2" fill="#4b505c"/>
              <circle cx="9" cy="7" r="1" fill="#4b505c"/>
              <circle cx="5" cy="10" r="1.5" fill="#3a3f4b"/>
            </pattern>
            {/* アスファルト粗粒度 */}
            <pattern id="pat-asphalt-coarse" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#363942"/>
              <polygon points="2,2 6,4 4,8 1,6" fill="#525763"/>
              <polygon points="10,3 14,2 15,7 11,8" fill="#484d59"/>
              <polygon points="6,10 12,11 9,15 4,14" fill="#5a606d"/>
            </pattern>
            {/* 砕石・クラッシャーラン */}
            <pattern id="pat-gravel" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#a0a8b5"/>
              <circle cx="4" cy="4" r="2.5" fill="#788291"/>
              <circle cx="14" cy="6" r="3" fill="#66707f"/>
              <circle cx="9" cy="15" r="2" fill="#8892a1"/>
              <circle cx="17" cy="16" r="2.5" fill="#788291"/>
            </pattern>
            {/* 再生クラッシャーラン */}
            <pattern id="pat-recycled" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#b5bcbe"/>
              <rect x="2" y="3" width="5" height="4" fill="#8a9396" transform="rotate(15)"/>
              <rect x="14" y="10" width="6" height="4" fill="#757e82" transform="rotate(-20)"/>
              <circle cx="8" cy="18" r="2" fill="#9ba4a7"/>
            </pattern>
            {/* セメント安定処理 */}
            <pattern id="pat-cement" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#8c92a0"/>
              <line x1="0" y1="12" x2="12" y2="0" stroke="#717785" strokeWidth="1"/>
            </pattern>
            {/* 路床 (斜線) */}
            <pattern id="pat-roadbed" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#3f2e21"/>
              <line x1="0" y1="16" x2="16" y2="0" stroke="#5a4332" strokeWidth="1.5"/>
            </pattern>
          </defs>

          {/* 路面ライン */}
          <line x1="50" y1="20" x2="350" y2="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2"/>
          <text x="200" y="14" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">▽ 計画路面 (Road Surface)</text>

          {/* 各層の描画 */}
          {evaluatedLayers.map((layer, idx) => {
            const hPx = Math.max(18, layer.thickness * scale);
            const layerY = currentY;
            currentY += hPx;

            // パターンID判定
            let fillUrl = `url(#pat-gravel)`;
            if (layer.category === '表層') fillUrl = 'url(#pat-asphalt-dense)';
            else if (layer.category === '基層') fillUrl = 'url(#pat-asphalt-coarse)';
            else if (layer.materialId.includes('cement')) fillUrl = 'url(#pat-cement)';
            else if (layer.materialId.includes('recycled')) fillUrl = 'url(#pat-recycled)';

            return (
              <g key={layer.id || idx}>
                {/* 層本体の矩形 */}
                <rect
                  x="70"
                  y={layerY}
                  width="260"
                  height={hPx}
                  fill={fillUrl}
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />

                {/* 層境界線 */}
                <line 
                  x1="70" 
                  y1={layerY + hPx} 
                  x2="330" 
                  y2={layerY + hPx} 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="1" 
                />

                {/* 層名 & 材料ラベル */}
                <text 
                  x="200" 
                  y={layerY + hPx / 2 + 4} 
                  fill="#ffffff" 
                  fontSize="12" 
                  fontWeight="bold"
                  textAnchor="middle"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                >
                  {layer.name || layer.category} ({layer.materialName})
                </text>

                {/* 右側：厚さ寸法線 */}
                <line x1="340" y1={layerY} x2="340" y2={layerY + hPx} stroke="#94a3b8" strokeWidth="1"/>
                <line x1="335" y1={layerY} x2="345" y2={layerY} stroke="#94a3b8" strokeWidth="1"/>
                <line x1="335" y1={layerY + hPx} x2="345" y2={layerY + hPx} stroke="#94a3b8" strokeWidth="1"/>
                <text 
                  x="352" 
                  y={layerY + hPx / 2 + 4} 
                  fill="#f8fafc" 
                  fontSize="11" 
                  fontFamily="var(--font-mono)"
                  fontWeight="bold"
                >
                  {layer.thickness} cm (a={layer.a})
                </text>
              </g>
            );
          })}

          {/* 路床 (Subgrade) の描画 */}
          <rect
            x="70"
            y={currentY}
            width="260"
            height={roadbedHeight}
            fill="url(#pat-roadbed)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <text 
            x="200" 
            y={currentY + roadbedHeight / 2 + 4} 
            fill="#e2e8f0" 
            fontSize="12" 
            fontWeight="bold"
            textAnchor="middle"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            路 床 (Subgrade) - 設計CBR = {cbr}%
          </text>

          {/* 全厚括弧寸法線 (左側) */}
          <g>
            <line x1="50" y1="30" x2="50" y2={currentY} stroke="#38bdf8" strokeWidth="1.5"/>
            <line x1="45" y1="30" x2="55" y2="30" stroke="#38bdf8" strokeWidth="1.5"/>
            <line x1="45" y1={currentY} x2="55" y2={currentY} stroke="#38bdf8" strokeWidth="1.5"/>
            <text 
              x="42" 
              y={(30 + currentY) / 2} 
              fill="#38bdf8" 
              fontSize="12" 
              fontWeight="bold"
              fontFamily="var(--font-mono)"
              textAnchor="end"
              dominantBaseline="middle"
            >
              H={totalThickness}cm
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
