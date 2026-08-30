import { Volume2, VolumeX, Sparkles, BookOpen, Music, Target, Zap } from 'lucide-react';

export default function Header({
  activeMode,
  setActiveMode,
  notation,
  setNotation,
  guitarType,
  onGuitarTypeChange,
  isMuted,
  toggleMute,
  openMnemonicModal,
  streak
}) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <div className="brand-icon-wrapper">
            <span className="brand-guitar-emoji">🎸</span>
            <span className="brand-glow"></span>
          </div>
          <div>
            <h1 className="brand-title">
              Guitarra<span className="brand-accent">pp</span>
            </h1>
            <p className="brand-subtitle">Domina las cuerdas y notas de la guitarra</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Selector de tipo de sonido de guitarra */}
          <div className="notation-pill guitar-type-pill" role="group" aria-label="Tipo de sonido de guitarra">
            <button
              type="button"
              className={`notation-btn ${guitarType === 'steel' ? 'active' : ''}`}
              onClick={() => onGuitarTypeChange('steel')}
              title="Sonido Real Grabado en Estudio: Guitarra Acústica (Cuerdas de Acero)"
            >
              <span className="btn-full-label">🎸 Acústica Real</span>
              <span className="btn-short-label">🎸 Acústica</span>
            </button>
            <button
              type="button"
              className={`notation-btn ${guitarType === 'nylon' ? 'active' : ''}`}
              onClick={() => onGuitarTypeChange('nylon')}
              title="Sonido Real Grabado en Estudio: Guitarra Clásica / Española (Cuerdas de Nylon)"
            >
              <span className="btn-full-label">🎻 Clásica Nylon</span>
              <span className="btn-short-label">🎻 Nylon</span>
            </button>
          </div>

          {/* Selector de notación */}
          <div className="notation-pill" role="group" aria-label="Selector de sistema de notas">
            <button
              type="button"
              className={`notation-btn ${notation === 'EN' ? 'active' : ''}`}
              onClick={() => setNotation('EN')}
              title="Cifrado Anglosajón (E, B, G, D, A, E)"
            >
              <span className="notation-flag">🇺🇸</span>
              <span className="btn-full-label">E - B - G</span>
              <span className="btn-short-label">EN</span>
            </button>
            <button
              type="button"
              className={`notation-btn ${notation === 'ES' ? 'active' : ''}`}
              onClick={() => setNotation('ES')}
              title="Sistema Latino (Mi, Si, Sol, Re, La, Mi)"
            >
              <span className="notation-flag">🇪🇸</span>
              <span className="btn-full-label">Mi - Si - Sol</span>
              <span className="btn-short-label">ES</span>
            </button>
          </div>

          {/* Botón de Trucos mnemotécnicos */}
          <button
            type="button"
            className="action-icon-btn helper-btn"
            onClick={openMnemonicModal}
            title="Trucos para memorizar el orden de las cuerdas"
          >
            <BookOpen size={18} />
            <span className="btn-label btn-full-label">Trucos de Memoria</span>
            <span className="btn-label btn-short-label">Trucos</span>
          </button>

          {/* Botón de Silencio/Audio */}
          <button
            type="button"
            className={`action-icon-btn ${isMuted ? 'muted' : 'sound-on'}`}
            onClick={toggleMute}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Barra de modos */}
      <nav className="mode-navbar" aria-label="Modos de aprendizaje">
        <button
          type="button"
          className={`mode-tab ${activeMode === 'drag' ? 'active' : ''}`}
          onClick={() => setActiveMode('drag')}
        >
          <Target size={18} className="tab-icon" />
          <span>🎯 Práctica: Arrastrar y Soltar</span>
          <span className="tab-badge">Interactivo</span>
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveMode('quiz')}
        >
          <Zap size={18} className="tab-icon" />
          <span>⚡ Desafío Rápido</span>
          {streak > 0 && <span className="streak-badge">🔥 {streak}</span>}
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'chords' ? 'active' : ''}`}
          onClick={() => setActiveMode('chords')}
        >
          <Sparkles size={18} className="tab-icon" />
          <span>🎼 12 Acordes Básicos</span>
          <span className="tab-badge chord-new-badge">Nuevo</span>
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveMode('explorer')}
        >
          <Music size={18} className="tab-icon" />
          <span>🎸 Explorador & Sonido Real</span>
        </button>
      </nav>
    </header>
  );
}
