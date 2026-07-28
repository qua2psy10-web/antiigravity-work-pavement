/**
 * 舗装設計施工指針に基づく TA法計算エンジン & データベース
 */

// 大型車交通量区分の定義
export const TRAFFIC_CLASSES = [
  { id: 'N1', name: 'N1 交通 (100台未満/日・方向)', repN: 50, desc: '軽交通・宅地内道路等' },
  { id: 'N2', name: 'N2 交通 (100〜250台未満/日・方向)', repN: 175, desc: '市町村道・小規模地方道等' },
  { id: 'N3', name: 'N3 交通 (250〜1,000台未満/日・方向)', repN: 625, desc: '主要地方道・一般国道等' },
  { id: 'N4', name: 'N4 交通 (1,000〜3,000台未満/日・方向)', repN: 2000, desc: '幹線道路・重交通路線' },
  { id: 'N5', name: 'N5 交通 (3,000台以上/日・方向)', repN: 4000, desc: '極めて重交通な幹線道路' },
];

// 標準CBRリスト
export const STANDARD_CBR_VALUES = [2, 3, 4, 6, 8, 12, 20];

// 指針の目標TA (cm) 標準参照テーブル [TrafficClassId][CBR]
export const STANDARD_TA_TABLE = {
  N1: { 2: 21, 3: 17, 4: 15, 6: 13, 8: 11, 12: 9, 20: 7 },
  N2: { 2: 25, 3: 21, 4: 19, 6: 16, 8: 14, 12: 11, 20: 9 },
  N3: { 2: 31, 3: 26, 4: 23, 6: 20, 8: 17, 12: 14, 20: 11 },
  N4: { 2: 39, 3: 32, 4: 29, 6: 24, 8: 21, 12: 17, 20: 14 },
  N5: { 2: 47, 3: 39, 4: 35, 6: 29, 8: 26, 12: 21, 20: 17 },
};

// 舗装材料マスタ（相対強度係数 a_i とカラー/テクスチャ定義）
export const PAVEMENT_MATERIALS = [
  { id: 'dense_asphalt', category: '表層', name: '密粒度アスファルトコンクリート', a: 1.00, minThick: 3, defaultThick: 5, color: '#2c2d30', pattern: 'asphalt_dense' },
  { id: 'gap_asphalt', category: '表層', name: 'ギャップアスファルトコンクリート', a: 1.00, minThick: 3, defaultThick: 4, color: '#35373b', pattern: 'asphalt_dense' },
  { id: 'porous_asphalt', category: '表層', name: '高機能舗装（排水性アスファルト）', a: 1.00, minThick: 4, defaultThick: 5, color: '#252932', pattern: 'asphalt_porous' },
  { id: 'coarse_asphalt', category: '基層', name: '粗粒度アスファルトコンクリート', a: 1.00, minThick: 5, defaultThick: 5, color: '#3d4046', pattern: 'asphalt_coarse' },
  { id: 'asphalt_base', category: '基層', name: '加熱アスファルト安定処理材(基層用)', a: 1.00, minThick: 5, defaultThick: 5, color: '#44474e', pattern: 'asphalt_coarse' },
  { id: 'hot_asphalt_stabilized', category: '上層路盤', name: '加熱アスファルト安定処理材', a: 0.80, minThick: 5, defaultThick: 8, color: '#555861', pattern: 'asphalt_light' },
  { id: 'cement_stabilized_high', category: '上層路盤', name: 'セメント安定処理材 (一軸圧縮強度高)', a: 0.70, minThick: 10, defaultThick: 15, color: '#7e838f', pattern: 'cement' },
  { id: 'cement_stabilized_mid', category: '上層路盤', name: 'セメント安定処理材 (標準)', a: 0.55, minThick: 10, defaultThick: 15, color: '#9095a3', pattern: 'cement' },
  { id: 'slag_stabilized', category: '上層路盤', name: '水硬性高炉スラグ', a: 0.55, minThick: 10, defaultThick: 15, color: '#889196', pattern: 'slag' },
  { id: 'graded_crushed_stone', category: '上層路盤', name: '粒度調整砕石 (RM-40 / RM-30)', a: 0.35, minThick: 10, defaultThick: 15, color: '#b0b8c2', pattern: 'gravel_dense' },
  { id: 'recycled_crushed_stone', category: '下層路盤', name: '再生クラッシャーラン (RC-40)', a: 0.25, minThick: 10, defaultThick: 20, color: '#c4cbcd', pattern: 'gravel_coarse' },
  { id: 'crushed_stone', category: '下層路盤', name: 'クラッシャーラン (C-40)', a: 0.25, minThick: 10, defaultThick: 20, color: '#cfd6d8', pattern: 'gravel_coarse' },
  { id: 'pit_gravel', category: '下層路盤', name: '切込砂利 / 切込砕石', a: 0.20, minThick: 10, defaultThick: 20, color: '#dbe0df', pattern: 'sand_gravel' },
  { id: 'sand', category: '下層路盤', name: '砂', a: 0.15, minThick: 10, defaultThick: 15, color: '#e5e8db', pattern: 'sand' },
];

/**
 * 目標TA (cm) の計算
 * @param {string} trafficClass - 'N1'〜'N5'
 * @param {number} cbr - 設計CBR (数値)
 * @param {string} mode - 'formula' (公式算定) | 'table' (標準表参照)
 * @param {number} [customN] - 任意指定の大型車台数 (台/日・方向)
 */
export function calculateTargetTA(trafficClass, cbr, mode = 'formula', customN = null) {
  const validCBR = Math.max(1, Number(cbr) || 3);
  
  if (mode === 'table') {
    // テーブル参照モード
    const tableForClass = STANDARD_TA_TABLE[trafficClass] || STANDARD_TA_TABLE['N3'];
    // 最も近いCBRキーを探す
    const keys = Object.keys(tableForClass).map(Number).sort((a, b) => a - b);
    let closestCBR = keys[0];
    for (const k of keys) {
      if (Math.abs(k - validCBR) < Math.abs(closestCBR - validCBR)) {
        closestCBR = k;
      }
    }
    return tableForClass[closestCBR];
  } else {
    // 公式算定モード: TA = (20.8 * N^0.6) / (CBR^0.6)
    let N = customN;
    if (!N) {
      const clsObj = TRAFFIC_CLASSES.find(c => c.id === trafficClass);
      N = clsObj ? clsObj.repN : 625;
    }
    const numerator = 20.8 * Math.pow(N, 0.6);
    const denominator = Math.pow(validCBR, 0.6);
    const ta = numerator / denominator;
    return Math.round(ta * 10) / 10; // 小数点第1位に四捨五入
  }
}

/**
 * 設計換算厚 TA' (cm) と全厚 H (cm) の算出
 */
export function calculatePavementStructure(layers = []) {
  let taPrime = 0;
  let totalThickness = 0;

  const evaluatedLayers = layers.map((layer, index) => {
    const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
    const thickness = Number(layer.thickness) || 0;
    const a = layer.a !== undefined ? Number(layer.a) : mat.a;
    const layerTa = Math.round(a * thickness * 100) / 100;
    
    taPrime += layerTa;
    totalThickness += thickness;

    return {
      ...layer,
      id: layer.id || `layer-${index}-${Date.now()}`,
      materialName: mat.name,
      category: mat.category,
      a: a,
      layerTa: layerTa,
      color: mat.color,
      pattern: mat.pattern
    };
  });

  return {
    evaluatedLayers,
    taPrime: Math.round(taPrime * 100) / 100,
    totalThickness: Math.round(totalThickness * 10) / 10
  };
}

/**
 * CBRと交通量区分に応じた自動推奨層構造を生成
 */
export function getRecommendedLayers(trafficClass, cbr) {
  const taTarget = calculateTargetTA(trafficClass, cbr, 'formula');

  // 交通量および目標TAに応じたパターン振り分け
  if (trafficClass === 'N1') {
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 10, a: 0.35 },
      { id: 'rec-3', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: Math.max(15, Math.ceil((taTarget - 5 - 3.5) / 0.25 / 5) * 5), a: 0.25 }
    ];
  } else if (trafficClass === 'N2') {
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 15, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: Math.max(15, Math.ceil((taTarget - 10 - 5.25) / 0.25 / 5) * 5), a: 0.25 }
    ];
  } else if (trafficClass === 'N3') {
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 15, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: Math.max(20, Math.ceil((taTarget - 10 - 5.25) / 0.25 / 5) * 5), a: 0.25 }
    ];
  } else if (trafficClass === 'N4') {
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: 7, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 15, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: Math.max(25, Math.ceil((taTarget - 12 - 5.25) / 0.25 / 5) * 5), a: 0.25 }
    ];
  } else {
    // N5
    return [
      { id: 'rec-1', name: '表層', materialId: 'porous_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: 10, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'hot_asphalt_stabilized', thickness: 10, a: 0.80 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: Math.max(25, Math.ceil((taTarget - 15 - 8.0) / 0.25 / 5) * 5), a: 0.25 }
    ];
  }
}
