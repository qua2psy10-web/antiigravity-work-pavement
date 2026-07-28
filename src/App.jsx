import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import LayerEditor from './components/LayerEditor';
import ResultSummary from './components/ResultSummary';
import SectionDiagram from './components/SectionDiagram';
import ReportPrintView from './components/ReportPrintView';
import StorageModal from './components/StorageModal';
import { 
  calculateTargetTA, 
  calculatePavementStructure, 
  getRecommendedLayers 
} from './utils/pavementCalculations';

export default function App() {
  // 基本情報
  const [projectInfo, setProjectInfo] = useState({
    name: '市道A号線 舗装新設工事',
    location: '東京都○○区1丁目'
  });

  // 設計条件
  const [trafficClass, setTrafficClass] = useState('N3');
  const [cbr, setCbr] = useState(3);
  const [useCustomN, setUseCustomN] = useState(false);
  const [customN, setCustomN] = useState(625);
  const [taMode, setTaMode] = useState('formula'); // 'formula' | 'table'

  // 層構成
  const [layers, setLayers] = useState(() => getRecommendedLayers('N3', 3));

  // モード・モーダル管理
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'save' | 'load' | null

  // 1. 目標TAの算出
  const targetTA = useMemo(() => {
    return calculateTargetTA(
      trafficClass, 
      cbr, 
      taMode, 
      useCustomN ? customN : null
    );
  }, [trafficClass, cbr, taMode, useCustomN, customN]);

  // 2. 層構造の換算厚TA'および全厚Hの算出
  const { evaluatedLayers, taPrime, totalThickness } = useMemo(() => {
    return calculatePavementStructure(layers);
  }, [layers]);

  // 判定（TA' >= TA）
  const isPass = taPrime >= targetTA;

  // 推奨構成の自動適用
  const handleApplyRecommended = () => {
    const rec = getRecommendedLayers(trafficClass, cbr);
    setLayers(rec);
  };

  // 初期化・リセット
  const handleReset = () => {
    if (!confirm('現在の設定内容を初期状態にリセットしますか？')) return;
    setTrafficClass('N3');
    setCbr(3);
    setUseCustomN(false);
    setCustomN(625);
    setTaMode('formula');
    setLayers(getRecommendedLayers('N3', 3));
    setProjectInfo({ name: '市道A号線 舗装新設工事', location: '東京都○○区1丁目' });
  };

  // 保存データの復元
  const handleLoadState = (state) => {
    if (!state) return;
    if (state.projectInfo) setProjectInfo(state.projectInfo);
    if (state.trafficClass) setTrafficClass(state.trafficClass);
    if (state.cbr) setCbr(state.cbr);
    if (state.useCustomN !== undefined) setUseCustomN(state.useCustomN);
    if (state.customN) setCustomN(state.customN);
    if (state.taMode) setTaMode(state.taMode);
    if (state.layers) setLayers(state.layers);
  };

  const currentStateObj = {
    projectInfo,
    trafficClass,
    cbr,
    useCustomN,
    customN,
    taMode,
    layers,
    targetTA,
    taPrime,
    totalThickness
  };

  return (
    <div className="app-container">
      {/* アプリ共通ヘッダー */}
      <Header
        onOpenSaveModal={() => setActiveModal('save')}
        onOpenLoadModal={() => setActiveModal('load')}
        onReset={handleReset}
        isPrintPreview={isPrintPreview}
        setIsPrintPreview={setIsPrintPreview}
      />

      {/* A4計算書プレビューモード表示 */}
      {isPrintPreview ? (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', width: '100%', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              A4計算書 プレビュー表示中
            </span>
            <button className="btn btn-primary" onClick={() => window.print()}>
              印刷 / PDF出力実行
            </button>
          </div>

          <div style={{ background: '#fff', color: '#000', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <ReportPrintView
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
              isPass={isPass}
            />
          </div>
        </div>
      ) : (
        /* メイン編集画面（2カラムレイアウト） */
        <main className="main-content">
          {/* 左カラム：入力・層編集・結果 */}
          <div>
            {/* 総合判定カード */}
            <div style={{ marginBottom: '1.25rem' }}>
              <ResultSummary
                targetTA={targetTA}
                taPrime={taPrime}
                totalThickness={totalThickness}
              />
            </div>

            {/* 設計条件入力パネル */}
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

            {/* 舗装層構造の編集 */}
            <LayerEditor
              layers={layers}
              setLayers={setLayers}
            />
          </div>

          {/* 右カラム：リアルタイム構造断面図 */}
          <div>
            <SectionDiagram
              evaluatedLayers={evaluatedLayers}
              totalThickness={totalThickness}
              targetTA={targetTA}
              taPrime={taPrime}
              cbr={cbr}
            />
          </div>
        </main>
      )}

      {/* 印刷（@media print）用の隠し印刷コンポーネント */}
      <ReportPrintView
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
        isPass={isPass}
      />

      {/* 保存・読み込みモーダル */}
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
