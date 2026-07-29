import React from 'react';
import { Layers, Printer, Save, FolderOpen, RotateCcw, FileText, RefreshCw } from 'lucide-react';

export default function Header({ 
  onOpenSaveModal, 
  onOpenLoadModal, 
  onReset, 
  isPrintPreview, 
  setIsPrintPreview 
}) {

  // キャッシュクリア＆最新版強制ロード
  const handleForceUpdate = () => {
    if (confirm('画面を最新状態に更新し、ローカルのキャッシュ状態を再読み込みしますか？')) {
      try {
        localStorage.removeItem('pavement_design_saved_projects');
      } catch (e) {}
      window.location.reload();
    }
  };

  return (
    <header className="app-header">
      <div className="header-title-group">
        <div className="header-icon-box">
          <Layers size={22} />
        </div>
        <div>
          <h1 className="header-title">アスファルト舗装設計システム (TA法)</h1>
          <p className="header-subtitle">舗装設計施工指針準拠 ・ 構造計算 ＆ 補修・オーバーレイ設計</p>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={handleForceUpdate}
          title="ブラウザキャッシュをクリアして最新版に更新"
          style={{ color: 'var(--accent-amber)' }}
        >
          <RefreshCw size={15} />
          <span>最新版に強制更新</span>
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onReset}
          title="初期状態に戻す"
        >
          <RotateCcw size={16} />
          <span>リセット</span>
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenLoadModal}
        >
          <FolderOpen size={16} />
          <span>開く</span>
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenSaveModal}
        >
          <Save size={16} />
          <span>保存</span>
        </button>

        <button 
          className={`btn btn-sm ${isPrintPreview ? 'btn-primary' : 'btn-accent'}`}
          onClick={() => setIsPrintPreview(!isPrintPreview)}
        >
          {isPrintPreview ? (
            <>
              <Layers size={16} />
              <span>編集画面へ戻る</span>
            </>
          ) : (
            <>
              <FileText size={16} />
              <span>A4計算書プレビュー</span>
            </>
          )}
        </button>

        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => window.print()}
          title="A4サイズで印刷/PDF保存"
        >
          <Printer size={16} />
          <span>印刷 / PDF</span>
        </button>
      </div>
    </header>
  );
}
