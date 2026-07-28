import React from 'react';
import { PAVEMENT_MATERIALS, CONDITION_COEFFICIENTS } from '../utils/pavementCalculations';
import { Scissors, Wrench, Layers, Plus, Trash2 } from 'lucide-react';

export default function MaintenanceEditor({
  cutDepth,
  setCutDepth,
  existingLayers,
  setExistingLayers,
  overlayLayers,
  setOverlayLayers,
  existTaPrime,
  overlayTaPrime
}) {
  // 既設層の属性変更
  const handleExistChange = (index, field, value) => {
    const updated = [...existingLayers];
    updated[index] = { ...updated[index], [field]: value };
    setExistingLayers(updated);
  };

  // オーバーレイ層の属性変更
  const handleOverlayChange = (index, field, value) => {
    const updated = [...overlayLayers];
    updated[index] = { ...updated[index], [field]: value };
    setOverlayLayers(updated);
  };

  // オーバーレイ層の追加
  const handleAddOverlayLayer = () => {
    const defaultMat = PAVEMENT_MATERIALS[0];
    const newLayer = {
      id: `ov-${Date.now()}`,
      name: 'オーバーレイ層',
      materialId: defaultMat.id,
      thickness: 5,
      a: defaultMat.a
    };
    setOverlayLayers([...overlayLayers, newLayer]);
  };

  // オーバーレイ層の削除
  const handleDeleteOverlayLayer = (index) => {
    if (overlayLayers.length <= 1) {
      alert('オーバーレイ・打換え層は少なくとも1層必要です。');
      return;
    }
    setOverlayLayers(overlayLayers.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* 1. 切削工の設定カード */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Scissors size={20} style={{ color: 'var(--accent-rose)' }} />
            <span>切削工 (舗装面の削り取り) の設定</span>
          </h2>
          <span className="badge badge-danger" style={{ fontFamily: 'var(--font-mono)' }}>
            切削深さ D = {cutDepth} cm
          </span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">切削深さ D (cm)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                className="form-control"
                value={cutDepth}
                onChange={(e) => setCutDepth(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                min="0"
                max="50"
                className="form-control"
                style={{ width: '80px', textAlign: 'center' }}
                value={cutDepth}
                onChange={(e) => setCutDepth(Math.max(0, Number(e.target.value)))}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>cm</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCutDepth(0)}>切削なし (0cm)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCutDepth(5)}>切削 5cm (表層打換)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCutDepth(10)}>切削 10cm (表+基層)</button>
          </div>
        </div>
      </div>

      {/* 2. 既設舗装構造 ＆ 健全度評価カード */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Wrench size={20} />
            <span>既設舗装構造 ＆ 健全度評価 ($C_i$)</span>
          </h2>
          <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)' }}>
            残存既設換算厚 T_A,exist' = {existTaPrime.toFixed(2)} cm
          </span>
        </div>

        <div className="layer-table-wrapper">
          <table className="layer-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>層名</th>
                <th>既設材料</th>
                <th style={{ width: '90px' }}>既設厚 (cm)</th>
                <th style={{ width: '220px' }}>健全度評価 ($C_i$)</th>
                <th style={{ width: '90px' }}>切削厚 (cm)</th>
                <th style={{ width: '90px' }}>残存厚 (cm)</th>
                <th style={{ width: '100px', textAlign: 'right' }}>残存換算厚</th>
              </tr>
            </thead>
            <tbody>
              {existingLayers.map((layer, idx) => {
                const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
                return (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={layer.name}
                        onChange={(e) => handleExistChange(idx, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={layer.materialId}
                        onChange={(e) => {
                          const m = PAVEMENT_MATERIALS.find(pm => pm.id === e.target.value);
                          handleExistChange(idx, 'materialId', e.target.value);
                          if (m) handleExistChange(idx, 'a', m.a);
                        }}
                      >
                        {PAVEMENT_MATERIALS.map(m => (
                          <option key={m.id} value={m.id}>
                            [{m.category}] {m.name} (a={m.a})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="table-input table-input-number"
                        value={layer.thickness}
                        onChange={(e) => handleExistChange(idx, 'thickness', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={layer.c}
                        onChange={(e) => handleExistChange(idx, 'c', Number(e.target.value))}
                      >
                        {CONDITION_COEFFICIENTS.map(cc => (
                          <option key={cc.value} value={cc.value}>
                            {cc.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center', color: layer.cutThick > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      {layer.cutThick > 0 ? `-${layer.cutThick} cm` : '0 cm'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {layer.remainingThick} cm
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                      {layer.layerExistTa ? layer.layerExistTa.toFixed(2) : '0.00'} cm
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 新設オーバーレイ・打換え層の編集カード */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Layers size={20} style={{ color: 'var(--accent-emerald)' }} />
            <span>新設オーバーレイ / 切削打換え層の設定</span>
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={handleAddOverlayLayer}>
            <Plus size={16} />
            <span>オーバーレイ層を追加</span>
          </button>
        </div>

        <div className="layer-table-wrapper">
          <table className="layer-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>層名</th>
                <th>新設材料</th>
                <th style={{ width: '100px' }}>係数 $a_i$</th>
                <th style={{ width: '120px' }}>新設厚 $h$ (cm)</th>
                <th style={{ width: '110px', textAlign: 'right' }}>新設換算厚</th>
                <th style={{ width: '50px', textAlign: 'center' }}>削除</th>
              </tr>
            </thead>
            <tbody>
              {overlayLayers.map((layer, idx) => {
                const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
                const currentA = layer.a !== undefined ? layer.a : mat.a;
                const subtotal = Math.round(currentA * layer.thickness * 100) / 100;

                return (
                  <tr key={layer.id || idx}>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={layer.name || 'オーバーレイ層'}
                        onChange={(e) => handleOverlayChange(idx, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={layer.materialId}
                        onChange={(e) => {
                          const m = PAVEMENT_MATERIALS.find(pm => pm.id === e.target.value);
                          handleOverlayChange(idx, 'materialId', e.target.value);
                          if (m) handleOverlayChange(idx, 'a', m.a);
                        }}
                      >
                        {PAVEMENT_MATERIALS.map(m => (
                          <option key={m.id} value={m.id}>
                            [{m.category}] {m.name} (a={m.a})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        className="table-input table-input-number"
                        value={currentA}
                        onChange={(e) => handleOverlayChange(idx, 'a', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="table-input table-input-number"
                        value={layer.thickness}
                        onChange={(e) => handleOverlayChange(idx, 'thickness', Number(e.target.value))}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {subtotal.toFixed(2)} cm
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.4rem', color: 'var(--accent-rose)' }}
                        onClick={() => handleDeleteOverlayLayer(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
