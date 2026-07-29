/**
 * 舗装設計施工指針に基づく TA法計算エンジン & データベース
 * （新設設計 & 既設補修・切削オーバーレイ設計対応）
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

// 既設層の健全度評価係数 C_i マスター
export const CONDITION_COEFFICIENTS = [
  { value: 1.0, label: '1.0 (健全・目立つ損傷なし)', desc: 'ひび割れや変形がほとんどない状態' },
  { value: 0.8, label: '0.8 (軽微なひび割れ・すり減り)', desc: '部分的なひび割れ (ひび割れ率 < 20%)' },
  { value: 0.6, label: '0.6 (中程度のひび割れ・わだち掘れ)', desc: '亀裂や網状ひび割れが発生 (ひび割れ率 20〜40%)' },
  { value: 0.4, label: '0.4 (著しい破損・変形)', desc: '著しい網状ひび割れ・わだち掘れ (ひび割れ率 > 40%)' },
  { value: 0.2, label: '0.2 (破砕・機能喪失)', desc: '層としての評価が困難な破砕状態' }
];

// 指針の目標TA (cm) 標準参照テーブル [TrafficClassId][CBR]
export const STANDARD_TA_TABLE = {
  N1: { 2: 21, 3: 17, 4: 15, 6: 13, 8: 11, 12: 9, 20: 7 },
  N2: { 2: 25, 3: 21, 4: 19, 6: 16, 8: 14, 12: 11, 20: 9 },
  N3: { 2: 31, 3: 26, 4: 23, 6: 20, 8: 17, 12: 14, 20: 11 },
  N4: { 2: 39, 3: 32, 4: 29, 6: 24, 8: 21, 12: 17, 20: 14 },
  N5: { 2: 47, 3: 39, 4: 35, 6: 29, 8: 26, 12: 21, 20: 17 },
};

// 舗装材料マスタ
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
 */
export function calculateTargetTA(trafficClass, cbr, mode = 'formula', customN = null) {
  const validCBR = Math.max(1, Number(cbr) || 3);
  
  if (mode === 'table') {
    const tableForClass = STANDARD_TA_TABLE[trafficClass] || STANDARD_TA_TABLE['N3'];
    const keys = Object.keys(tableForClass).map(Number).sort((a, b) => a - b);
    let closestCBR = keys[0];
    for (const k of keys) {
      if (Math.abs(k - validCBR) < Math.abs(closestCBR - validCBR)) {
        closestCBR = k;
      }
    }
    return tableForClass[closestCBR];
  } else {
    let N = customN;
    if (!N) {
      const clsObj = TRAFFIC_CLASSES.find(c => c.id === trafficClass);
      N = clsObj ? clsObj.repN : 625;
    }
    // STANDARD_TA_TABLE の全35点に対する回帰フィット（べき乗近似、最大誤差 約1.5cm）
    // TA = 13.362 * N^0.1863 * CBR^-0.4523
    const ta = 13.362 * Math.pow(N, 0.1863) * Math.pow(validCBR, -0.4523);
    return Math.round(ta * 10) / 10;
  }
}

/**
 * 新設設計: 換算厚 TA' (cm) と全厚 H (cm) の算出
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
 * 補修・切削オーバーレイ設計: 既設残存換算厚とオーバーレイ層の合算計算
 */
export function calculateMaintenanceStructure(existingLayers = [], cutDepth = 5, overlayLayers = []) {
  let depthCounter = Number(cutDepth) || 0;
  let existTaPrime = 0;
  let remainingExistThickness = 0;

  const evaluatedExistingLayers = existingLayers.map((layer) => {
    const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
    const origThick = Number(layer.thickness) || 0;
    const conditionC = Number(layer.c) || 1.0;
    const a = layer.a !== undefined ? Number(layer.a) : mat.a;

    let remainingThick = origThick;
    let cutThick = 0;

    if (depthCounter > 0) {
      if (depthCounter >= origThick) {
        cutThick = origThick;
        remainingThick = 0;
        depthCounter -= origThick;
      } else {
        cutThick = depthCounter;
        remainingThick = origThick - depthCounter;
        depthCounter = 0;
      }
    }

    const layerExistTa = Math.round(a * conditionC * remainingThick * 100) / 100;
    existTaPrime += layerExistTa;
    remainingExistThickness += remainingThick;

    return {
      ...layer,
      materialName: mat.name,
      category: mat.category,
      a,
      c: conditionC,
      origThick,
      cutThick,
      remainingThick,
      layerExistTa,
      color: mat.color
    };
  });

  let overlayTaPrime = 0;
  let overlayThickness = 0;

  const evaluatedOverlayLayers = overlayLayers.map((layer, idx) => {
    const mat = PAVEMENT_MATERIALS.find(m => m.id === layer.materialId) || PAVEMENT_MATERIALS[0];
    const thickness = Number(layer.thickness) || 0;
    const a = layer.a !== undefined ? Number(layer.a) : mat.a;
    const layerTa = Math.round(a * thickness * 100) / 100;

    overlayTaPrime += layerTa;
    overlayThickness += thickness;

    return {
      ...layer,
      id: layer.id || `ov-${idx}`,
      materialName: mat.name,
      category: mat.category,
      a,
      layerTa,
      color: mat.color
    };
  });

  const totalTaPrime = Math.round((existTaPrime + overlayTaPrime) * 100) / 100;
  const totalThickness = Math.round((remainingExistThickness + overlayThickness) * 10) / 10;

  return {
    evaluatedExistingLayers,
    evaluatedOverlayLayers,
    existTaPrime: Math.round(existTaPrime * 100) / 100,
    overlayTaPrime: Math.round(overlayTaPrime * 100) / 100,
    totalTaPrime,
    totalThickness,
    remainingExistThickness
  };
}

/**
 * 舗装設計施工指針に基づく、現実的かつバランスのとれた標準推奨層構造の自動計算
 */
export function getRecommendedLayers(trafficClass, cbr) {
  const taTarget = calculateTargetTA(trafficClass, cbr, 'formula');

  // 下層路盤だけで過大に厚くならないよう、各層の役割に応じた多段階配分アルゴリズム
  if (trafficClass === 'N1') {
    // N1 (目標TA 9〜21): 表層5cm, 上層路盤10cm(a=0.35), 残りを下層路盤(a=0.25, 最小15cm)
    const subgradeThick = Math.max(15, Math.ceil((taTarget - 5 - 3.5) / 0.25 / 5) * 5);
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 10, a: 0.35 },
      { id: 'rec-3', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: subgradeThick, a: 0.25 }
    ];
  } else if (trafficClass === 'N2') {
    // N2 (目標TA 11〜25): 表層5cm, 基層5cm, 上層15cm, 下層路盤 最小15cm
    const subgradeThick = Math.max(15, Math.ceil((taTarget - 10 - 5.25) / 0.25 / 5) * 5);
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: 15, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: subgradeThick, a: 0.25 }
    ];
  } else if (trafficClass === 'N3') {
    // N3 (目標TA 14〜31):
    // 必要TAが高い場合、下層路盤(a=0.25)だけに頼ると過大な厚さになるため基層を7cmに厚くする
    let baseThick = 5;
    let upperRoadbedThick = 15;
    let remTa = taTarget - 10 - 5.25;

    if (remTa > 7.5) { // 下層路盤が過大に厚くなる場合は基層/上層を強化
      baseThick = 7;
      upperRoadbedThick = 15;
      remTa = taTarget - 12 - 5.25;
    }

    const subgradeThick = Math.max(20, Math.ceil(remTa / 0.25 / 5) * 5);
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: baseThick, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: upperRoadbedThick, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: subgradeThick, a: 0.25 }
    ];
  } else if (trafficClass === 'N4') {
    // N4 (目標TA 17〜39):
    let baseThick = 7;
    let upperRoadbedThick = 15;
    let remTa = taTarget - 12 - 5.25;

    if (remTa > 7.5) {
      baseThick = 10;
      remTa = taTarget - 15 - 5.25;
    }

    const subgradeThick = Math.max(25, Math.ceil(remTa / 0.25 / 5) * 5);
    return [
      { id: 'rec-1', name: '表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: baseThick, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: 'graded_crushed_stone', thickness: upperRoadbedThick, a: 0.35 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: subgradeThick, a: 0.25 }
    ];
  } else {
    // N5 (目標TA 21〜47): 高機能舗装＋加熱アス安定処理＋粒調砕石＋再生クラッシャーラン
    let baseThick = 10;
    let upperMatId = 'hot_asphalt_stabilized'; // 加熱アス安定処理 (a=0.80)
    let upperThick = 10;
    let remTa = taTarget - 15 - 8.0;

    if (remTa > 7.5) {
      upperThick = 15;
      remTa = taTarget - 15 - 12.0;
    }

    const subgradeThick = Math.max(25, Math.ceil(remTa / 0.25 / 5) * 5);
    return [
      { id: 'rec-1', name: '表層', materialId: 'porous_asphalt', thickness: 5, a: 1.00 },
      { id: 'rec-2', name: '基層', materialId: 'coarse_asphalt', thickness: baseThick, a: 1.00 },
      { id: 'rec-3', name: '上層路盤', materialId: upperMatId, thickness: upperThick, a: 0.80 },
      { id: 'rec-4', name: '下層路盤', materialId: 'recycled_crushed_stone', thickness: subgradeThick, a: 0.25 }
    ];
  }
}
