import React from 'react';
import { Eye } from 'lucide-react';

export default function SectionDiagram({ 
  mode = 'new', 
  evaluatedLayers = [], 
  totalThickness = 0, 
  cbr = 3,
  // 補修モード用プロパティ
  cutDepth = 0,
  evaluatedExistingLayers = [],
  evaluatedOverlayLayers = []
}) {
  const svgWidth = 460;
  const diagramMaxHeight = 340;
  const roadbedHeight = 50;

  if (mode === 'maintenance') {
    // 補修設計モードのSVG描画
    const scale = totalThickness > 0 ? Math.max(160, Math.min(diagramMaxHeight, totalThickness * 5)) / totalThickness : 5;
    let currentY = 35; // トップ

    return (
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Eye size={20} />
            <span>補修・オーバーレイ 断面構造図</span>
          </h2>
          <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)' }}>
            全残厚 H = {totalThickness} cm
          </span>
        </div>

        <div className="diagram-container" style={{ flex: 1 }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgWidth} ${diagramMaxHeight + roadbedHeight + 80}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="pat-asphalt-dense" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#2a2d34"/>
                <circle cx="3" cy="3" r="1.2" fill="#4b505c"/>
                <circle cx="9" cy="7" r="1" fill="#4b505c"/>
              </pattern>
              <pattern id="pat-exist-asphalt" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#42454d"/>
                <line x1="0" y1="16" x2="16" y2="0" stroke="#2b2d33" strokeWidth="1"/>
              </pattern>
              <pattern id="pat-roadbed" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#3f2e21"/>
                <line x1="0" y1="16" x2="16" y2="0" stroke="#5a4332" strokeWidth="1.5"/>
              </pattern>
            </defs>

            {/* 新設計画路面 */}
            <line x1="60" y1="20" x2="350" y2="20" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2"/>
            <text x="205" y="14" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">▽ オーバーレイ路面 (Overlay Surface)</text>

            {/* 新設オーバーレイ層の描画 */}
            {evaluatedOverlayLayers.map((layer, idx) => {
              const hPx = Math.max(20, layer.thickness * scale);
              const layerY = currentY;
              currentY += hPx;

              return (
                <g key={`ov-svg-${idx}`}>
                  <rect
                    x="70"
                    y={layerY}
                    width="270"
                    height={hPx}
                    fill="url(#pat-asphalt-dense)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <text
                    x="205"
                    y={layerY + hPx / 2 + 4}
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    【新設】{layer.name} ({layer.thickness}cm)
                  </text>
                  <text
                    x="350"
                    y={layerY + hPx / 2 + 4}
                    fill="#10b981"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    +{layer.thickness}cm (a={layer.a})
                  </text>
                </g>
              );
            })}

            {/* 切削面指示ライン (Red Dashed Line) */}
            {cutDepth > 0 && (
              <g>
                <line x1="50" y1={currentY} x2="360" y2={currentY} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6 3"/>
                <text x="205" y={currentY - 4} fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle">
                  ✂️ 既設舗装 切削面 (D = {cutDepth} cm 除去)
                </text>
              </g>
            )}

            {/* 残存既設層の描画 */}
            {evaluatedExistingLayers.map((layer, idx) => {
              if (layer.remainingThick <= 0) return null;
              const hPx = Math.max(16, layer.remainingThick * scale);
              const layerY = currentY;
              currentY += hPx;

              return (
                <g key={`exist-svg-${idx}`}>
                  <rect
                    x="70"
                    y={layerY}
                    width="270"
                    height={hPx}
                    fill="url(#pat-exist-asphalt)"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <text
                    x="205"
                    y={layerY + hPx / 2 + 4}
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    【既設】{layer.name} (残{layer.remainingThick}cm / C={layer.c})
                  </text>
                  <text
                    x="350"
                    y={layerY + hPx / 2 + 4}
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                  >
                    {layer.remainingThick}cm (C={layer.c})
                  </text>
                </g>
              );
            })}

            {/* 路床 */}
            <rect
              x="70"
              y={currentY}
              width="270"
              height={roadbedHeight}
              fill="url(#pat-roadbed)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <text
              x="205"
              y={currentY + roadbedHeight / 2 + 4}
              fill="#e2e8f0"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              路 床 (設計CBR = {cbr}%)
            </text>
          </svg>
        </div>
      </div>
    );
  }

  // 通常（新設設計モード）の断面図
  const scale = totalThickness > 0 ? Math.max(180, Math.min(diagramMaxHeight, totalThickness * 6)) / totalThickness : 5;
  let currentY = 30;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h2 className="card-title">
          <Eye size={20} />
          <span>舗装構造 断面図プレビュー</span>
        </h2>
        <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)' }}>
          全厚 H = {totalThickness} cm
        </span>
      </div>

      <div className="diagram-container" style={{ flex: 1 }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${svgWidth} ${diagramMaxHeight + roadbedHeight + 60}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="pat-asphalt-dense" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#2a2d34"/>
              <circle cx="3" cy="3" r="1.2" fill="#4b505c"/>
            </pattern>
            <pattern id="pat-gravel" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#a0a8b5"/>
              <circle cx="4" cy="4" r="2.5" fill="#788291"/>
            </pattern>
            <pattern id="pat-roadbed" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#3f2e21"/>
              <line x1="0" y1="16" x2="16" y2="0" stroke="#5a4332" strokeWidth="1.5"/>
            </pattern>
          </defs>

          <line x1="50" y1="20" x2="350" y2="20" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2"/>
          <text x="200" y="14" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">▽ 計画路面 (Road Surface)</text>

          {evaluatedLayers.map((layer, idx) => {
            const hPx = Math.max(18, layer.thickness * scale);
            const layerY = currentY;
            currentY += hPx;

            return (
              <g key={layer.id || idx}>
                <rect
                  x="70"
                  y={layerY}
                  width="260"
                  height={hPx}
                  fill="url(#pat-asphalt-dense)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                <text 
                  x="200" 
                  y={layerY + hPx / 2 + 4} 
                  fill="#ffffff" 
                  fontSize="12" 
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {layer.name || layer.category} ({layer.materialName})
                </text>
                <text 
                  x="345" 
                  y={layerY + hPx / 2 + 4} 
                  fill="#f8fafc" 
                  fontSize="11" 
                  fontFamily="var(--font-mono)"
                >
                  {layer.thickness} cm (a={layer.a})
                </text>
              </g>
            );
          })}

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
          >
            路 床 (設計CBR = {cbr}%)
          </text>
        </svg>
      </div>
    </div>
  );
}
