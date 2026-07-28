import React from 'react';
import { PAVEMENT_MATERIALS } from '../utils/pavementCalculations';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function LayerEditor({ layers, setLayers }) {

  // 材料変更時
  const handleMaterialChange = (index, materialId) => {
    const mat = PAVEMENT_MATERIALS.find(m => m.id === materialId);
    if (!mat) return;
    
    const newLayers = [...layers];
    newLayers[index] = {
      ...newLayers[index],
      materialId: mat.id,
      name: newLayers[index].name || mat.category,
      a: mat.a,
      thickness: newLayers[index].thickness || mat.defaultThick
    };
    setLayers(newLayers);
  };

  // 厚さ変更時
  const handleThicknessChange = (index, val) => {
    const thick = Math.max(0, Number(val) || 0);
    const newLayers = [...layers];
    newLayers[index].thickness = thick;
    setLayers(newLayers);
  };

  // 相対強度係数 a_i 変更時
  const handleAChange = (index, val) => {
    const aVal = Math.max(0, Number(val) || 0);
    const newLayers = [...layers];
    newLayers[index].a = aVal;
    setLayers(newLayers);
  };

  // 層の追加
  const handleAddLayer = () => {
    const defaultMat = PAVEMENT_MATERIALS[9]; // 粒調砕石
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: '追加路盤層',
      materialId: defaultMat.id,
      thickness: 15,
      a: defaultMat.a
    };
    setLayers([...layers, newLayer]);
  };

  // 層の削除
  const handleDeleteLayer = (index) => {
    if (layers.length <= 1) {
      alert('最低1つの層が必要です。');
      return;
    }
    const newLayers = layers.filter((_, i) => i !== index);
    setLayers(newLayers);
  };

  // 層の移動
  const handleMoveLayer = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layers.length) return;
    const newLayers = [...layers];
    const temp = newLayers[index];
    newLayers[index] = newLayers[targetIndex];
    newLayers[targetIndex] = temp;
    setLayers(newLayers);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Layers size={20} />
          <span>舗装層構成の編集 (厚さ $h_i$ &amp; 係数 $a_i$)</span>
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={handleAddLayer}>
          <Plus size={16} />
          <span>層の追加</span>
        </button>
      </div>

      <div className="layer-table-wrapper">
        <table className="layer-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>移動</th>
              <th style={{ width: '110px' }}>区分・層名</th>
              <th>使用材料 (ドロップダウン選択)</th>
              <th style={{ width: '110px' }}>係数 $a_i$</th>
              <th style={{ width: '130px' }}>厚さ $h_i$ (cm)</th>
              <th style={{ width: '100px', textAlign: 'right' }}>換算厚 $a_i h_i$</th>
              <th style={{ width: '50px', textAlign: 'center' }}>削除</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((layer, index) => {
              const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
              const currentA = layer.a !== undefined ? layer.a : mat.a;
              const subtotalTA = Math.round((currentA * layer.thickness) * 100) / 100;

              return (
                <tr key={layer.id || index}>
                  <td>
                    <div className="action-btn-group">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.15rem 0.25rem' }} 
                        disabled={index === 0}
                        onClick={() => handleMoveLayer(index, -1)}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '0.15rem 0.25rem' }} 
                        disabled={index === layers.length - 1}
                        onClick={() => handleMoveLayer(index, 1)}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="table-input" 
                      value={layer.name || mat.category} 
                      onChange={(e) => {
                        const nl = [...layers];
                        nl[index].name = e.target.value;
                        setLayers(nl);
                      }}
                    />
                  </td>
                  <td>
                    <select 
                      className="table-input" 
                      value={layer.materialId}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
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
                      max="2"
                      className="table-input table-input-number" 
                      value={currentA} 
                      onChange={(e) => handleAChange(index, e.target.value)}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input 
                        type="number" 
                        step="1" 
                        min="0" 
                        max="100"
                        className="table-input table-input-number" 
                        value={layer.thickness} 
                        onChange={(e) => handleThicknessChange(index, e.target.value)}
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>cm</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {subtotalTA.toFixed(2)} cm
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '0.25rem 0.4rem', color: 'var(--accent-rose)' }}
                      onClick={() => handleDeleteLayer(index)}
                      title="層を削除"
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
  );
}
