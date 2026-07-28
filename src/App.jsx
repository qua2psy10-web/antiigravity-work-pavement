import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import LayerEditor from './components/LayerEditor';
import MaintenanceEditor from './components/MaintenanceEditor';
import ResultSummary from './components/ResultSummary';
import SectionDiagram from './components/SectionDiagram';
import ReportPrintView from './components/ReportPrintView';
import StorageModal from './components/StorageModal';
import { 
  calculateTargetTA, 
  calculatePavementStructure, 
  calculateMaintenanceStructure,
  getRecommendedLayers 
} from './utils/pavementCalculations';
import { Wrench, Sparkles } from 'lucide-react';

export default function App() {
  // 設計モード: 'new' (新設設計) | 'maintenance' (補修・切削オーバーレイ設計)
  const [designMode, setDesignMode] = useState('new');

  // 基本情報
  const [projectInfo, setProjectInfo] = useState({
    name: '市道A号線 舗装補修工事',
    location: '東京都○○区1丁目'
  });

  // 設計条件
  const [trafficClass, setTrafficClass] = useState('N3');
  const [cbr, setCbr] = useState(3);
  const [useCustomN, setUseCustomN] = useState(false);
  const [customN, setCustomN] = useState(625);
  const [taMode, setTaMode] = useState('formula');

  // 【新設用】層構成
  const [newLayers, setNewLayers] = useState(() => getRecommendedLayers('N3', 3));

  // 【補修用】既設舗装 ＆ 切削 ＆ オーバーレイ層
  const [cutDepth, setCutDepth] = useState(5); // 既設切削深さ (cm)
  const [existingLayers, setExistingLayers] = useState([
    { id: 'ex-1', name: '既設表層', materialId: 'dense_asphalt', thickness: 5, a: 1.00, c: 0.6 },
    { id: 'ex-2', name: '既設基層', materialId: 'coarse_asphalt', thickness: 5, a: 1.00, c: 0.8 },
    { id: 'ex-3', name: '既設上層路盤', materialId: 'graded_crushed_stone', thickness: 15, a: 0.35, c: 1.0 },
    { id: 'ex-4', name: '既設下層路盤', materialId: 'recycled_crushed_stone', thickness: 20, a: 0.25, c: 1.0 }
  ]);
  const [overlayLayers, setOverlayLayers] = useState([
    { id: 'ov-1', name: '表層オーバーレイ', materialId: 'dense_asphalt', thickness: 5, a: 1.00 }
  ]);

  // モード・モーダル管理
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // 1. 目標TAの算出
  const targetTA = useMemo(() => {
    return calculateTargetTA(
      trafficClass, 
      cbr, 
      taMode, 
      useCustomN ? customN : null
    );
  }, [trafficClass, cbr, taMode, useCustomN, customN]);

  // 2. 新設設計の換算厚計算
  const newStructureResult = useMemo(() => {
    return calculatePavementStructure(newLayers);
  }, [newLayers]);

  // 3. 補修・切削オーバーレイ設計の換算厚計算
  const maintenanceStructureResult = useMemo(() => {
    return calculateMaintenanceStructure(existingLayers, cutDepth, overlayLayers);
  }, [existingLayers, cutDepth, overlayLayers]);

  // アクティブなモードに応じた最終計算結果の抽出
  const { 
    taPrime, 
    totalThickness, 
    evaluatedLayers, 
    evaluatedExistingLayers, 
    evaluatedOverlayLayers, 
    existTaPrime, 
    overlayTaPrime 
  } = useMemo(() => {
    if (designMode === 'maintenance') {
      const res = maintenanceStructureResult;
      return {
        taPrime: res.totalTaPrime,
        totalThickness: res.totalThickness,
        evaluatedLayers: [],
        evaluatedExistingLayers: res.evaluatedExistingLayers,
        evaluatedOverlayLayers: res.evaluatedOverlayLayers,
        existTaPrime: res.existTaPrime,
        overlayTaPrime: res.overlayTaPrime
      };
    } else {
      const res = newStructureResult;
      return {
        taPrime: res.taPrime,
        totalThickness: res.totalThickness,
        evaluatedLayers: res.evaluatedLayers,
        evaluatedExistingLayers: [],
        evaluatedOverlayLayers: [],
        existTaPrime: 0,
        overlayTaPrime: 0
      };
    }
  }, [designMode, newStructureResult, maintenanceStructureResult]);

  const isPass = taPrime >= targetTA;

  // 推奨構成の自動適用
  const handleApplyRecommended = () => {
    const rec = getRecommendedLayers(trafficClass, cbr);
    setNewLayers(rec);
  };

  // リセット
  const handleReset = () => {
    if (!confirm('現在の設定内容を初期状態に戻しますか？')) return;
    setTrafficClass('N3');
    setCbr(3);
    setUseCustomN(false);
    setCustomN(625);
    setTaMode('formula');
    setNewLayers(getRecommendedLayers('N3', 3));
    setCutDepth(5);
  };

  // 復元
  const handleLoadState = (state) => {
    if (!state) return;
    if (state.designMode) setDesignMode(state.designMode);
    if (state.projectInfo) setProjectInfo(state.projectInfo);
    if (state.trafficClass) setTrafficClass(state.trafficClass);
    if (state.cbr) setCbr(state.cbr);
    if (state.newLayers) setNewLayers(state.newLayers);
    if (state.cutDepth !== undefined) setCutDepth(state.cutDepth);
    if (state.existingLayers) setExistingLayers(state.existingLayers);
    if (state.overlayLayers) setOverlayLayers(state.overlayLayers);
  };

  const currentStateObj = {
    designMode,
    projectInfo,
    trafficClass,
    cbr,
    useCustomN,
    customN,
    taMode,
    newLayers,
    cutDepth,
    existingLayers,
    overlayLayers,
    targetTA,
    taPrime,
    totalThickness
  };

  return (
    <div className="app-container">
      <Header
        onOpenSaveModal={() => setActiveModal('save')}
        onOpenLoadModal={() => setActiveModal('load')}
        onReset={handleReset}
        isPrintPreview={isPrintPreview}
        setIsPrintPreview={setIsPrintPreview}
      />

      {isPrintPreview ? (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', width: '100%', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              A4設計計算書 プレビュー表示中
            </span>
            <button className="btn btn-primary" onClick={() => window.print()}>
              印刷 / PDF出力実行
            </button>
          </div>

          <div style={{ background: '#fff', color: '#000', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <ReportPrintView
              designMode={designMode}
              projectInfo={projectInfo}
              trafficClass={trafficClass}
              customN={customN}
              useCustomN={useCustomN}
              cbr={cbr}
              taMode={taMode}
              targetTA={targetTA}
              taPrime={taPrime}
              totalThickness={totalThickness}
              evaluatedLayers={evaluatedLayers}
              evaluatedExistingLayers={evaluatedExistingLayers}
              evaluatedOverlayLayers={evaluatedOverlayLayers}
              existTaPrime={existTaPrime}
              overlayTaPrime={overlayTaPrime}
              isPass={isPass}
            />
          </div>
        </div>
      ) : (
        <main className="main-content">
          <div>
            {/* モード切替タブ */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                className={`btn ${designMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
                onClick={() => setDesignMode('new')}
              >
                <Sparkles size={18} />
                <span>新設舗装 設計モード</span>
              </button>
              <button
                className={`btn ${designMode === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
                onClick={() => setDesignMode('maintenance')}
              >
                <Wrench size={18} />
                <span>既設補修・切削オーバーレイ 設計モード</span>
              </button>
            </div>

            {/* 総合判定結果 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <ResultSummary
                targetTA={targetTA}
                taPrime={taPrime}
                totalThickness={totalThickness}
              />
            </div>

            {/* 入力パネル */}
            <InputPanel
              projectInfo={projectInfo}
              setProjectInfo={setProjectInfo}
              trafficClass={trafficClass}
              setTrafficClass={setTrafficClass}
              customN={customN}
              setCustomN={setCustomN}
              useCustomN={useCustomN}
              setUseCustomN={setUseCustomN}
              cbr={cbr}
              setCbr={setCbr}
              taMode={taMode}
              setTaMode={setTaMode}
              onApplyRecommended={handleApplyRecommended}
            />

            {/* モード別の層エディタ */}
            {designMode === 'new' ? (
              <LayerEditor
                layers={newLayers}
                setLayers={setNewLayers}
              />
            ) : (
              <MaintenanceEditor
                cutDepth={cutDepth}
                setCutDepth={setCutDepth}
                existingLayers={existingLayers}
                setExistingLayers={setExistingLayers}
                overlayLayers={overlayLayers}
                setOverlayLayers={setOverlayLayers}
                existTaPrime={existTaPrime}
                overlayTaPrime={overlayTaPrime}
              />
            )}
          </div>

          {/* 右カラム：断面図 */}
          <div>
            <SectionDiagram
              mode={designMode}
              evaluatedLayers={evaluatedLayers}
              totalThickness={totalThickness}
              targetTA={targetTA}
              taPrime={taPrime}
              cbr={cbr}
              cutDepth={cutDepth}
              evaluatedExistingLayers={evaluatedExistingLayers}
              evaluatedOverlayLayers={evaluatedOverlayLayers}
            />
          </div>
        </main>
      )}

      {/* 隠し印刷ビュー */}
      <ReportPrintView
        designMode={designMode}
        projectInfo={projectInfo}
        trafficClass={trafficClass}
        customN={customN}
        useCustomN={useCustomN}
        cbr={cbr}
        taMode={taMode}
        targetTA={targetTA}
        taPrime={taPrime}
        totalThickness={totalThickness}
        evaluatedLayers={evaluatedLayers}
        evaluatedExistingLayers={evaluatedExistingLayers}
        evaluatedOverlayLayers={evaluatedOverlayLayers}
        existTaPrime={existTaPrime}
        overlayTaPrime={overlayTaPrime}
        isPass={isPass}
      />

      {activeModal && (
        <StorageModal
          mode={activeModal}
          onClose={() => setActiveModal(null)}
          currentState={currentStateObj}
          onLoadState={handleLoadState}
        />
      )}
    </div>
  );
}
