import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FolderOpen, Clock } from 'lucide-react';

const STORAGE_KEY = 'pavement_design_saved_projects';

export default function StorageModal({ mode, onClose, currentState, onLoadState }) {
  const [savedProjects, setSavedProjects] = useState([]);
  const [saveName, setSaveName] = useState('');

  // ローカルストレージから一覧取得
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedProjects(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load storage', e);
    }
  }, []);

  // 新規保存
  const handleSave = () => {
    if (!saveName.trim()) {
      alert('保存名を入力してください。');
      return;
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      name: saveName.trim(),
      updatedAt: new Date().toLocaleString('ja-JP'),
      state: currentState
    };

    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaveName('');
    alert(`「${newProject.name}」を保存しました。`);
    onClose();
  };

  // 削除
  const handleDelete = (id) => {
    if (!confirm('この設計データを削除してよろしいですか？')) return;
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // 読み込み
  const handleLoad = (project) => {
    onLoadState(project.state);
    alert(`「${project.name}」を読み込みました。`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {mode === 'save' ? <Save size={20} /> : <FolderOpen size={20} />}
            <span>{mode === 'save' ? '設計データの保存' : '保存済み設計データの読み込み'}</span>
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {mode === 'save' && (
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem' }}>
                保存するデータ名
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="例: ○○道路 N4-CBR3% 補強案"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSave}>
                  保存実行
                </button>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
            保存済みパターン一覧 ({savedProjects.length}件)
          </h3>

          {savedProjects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
              保存されているデータはありません。
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {savedProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{proj.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Clock size={12} /> {proj.updatedAt}
                      &nbsp;｜&nbsp; CBR={proj.state?.cbr}% &nbsp;｜&nbsp; T_A'={proj.state?.taPrime}cm
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleLoad(proj)}
                    >
                      <FolderOpen size={14} />
                      <span>呼出</span>
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ color: 'var(--accent-rose)' }}
                      onClick={() => handleDelete(proj.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
