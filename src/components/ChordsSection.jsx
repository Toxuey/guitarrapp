import { useState, Fragment } from 'react';
import { Volume2, Play, BookOpen, Layers, Lightbulb, Music, Zap } from 'lucide-react';
import { GUITAR_CHORDS, POPULAR_PROGRESSIONS } from '../data/guitarChords';
import { soundEngine } from '../utils/audioEngine';
import ChordDiagram from './ChordDiagram';
import ChordTransitionTrainer from './ChordTransitionTrainer';

export default function ChordsSection({ notation }) {
  const [selectedChord, setSelectedChord] = useState(GUITAR_CHORDS[0]);
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'major' | 'minor' | 'seventh' | 'twoFinger'
  const [activeStringIdx, setActiveStringIdx] = useState(null);
  const [viewMode, setViewMode] = useState('library'); // 'library' | 'trainer'
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);

  // Filtrado de acordes
  const filteredChords = GUITAR_CHORDS.filter((c) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'twoFinger') return c.twoFinger;
    return c.category === filterCategory;
  });

  const handleSelectChord = (chord) => {
    setSelectedChord(chord);
    soundEngine.strumChord(chord.frequencies, 40, chord.noteKeys);
  };

  const handleStrum = (chord = selectedChord) => {
    soundEngine.strumChord(chord.frequencies, 40, chord.noteKeys);
  };

  const handleArpeggiate = (chord = selectedChord) => {
    soundEngine.arpeggiateChord(
      chord.frequencies,
      (stringIdx) => {
        setActiveStringIdx(stringIdx);
        setTimeout(() => {
          setActiveStringIdx(null);
        }, 280);
      },
      300,
      chord.noteKeys
    );
  };

  const handlePlaySingleString = (sIdx) => {
    const freq = selectedChord.frequencies[sIdx];
    const noteKey = selectedChord.noteKeys ? selectedChord.noteKeys[sIdx] : null;
    if (freq) {
      soundEngine.playNote(noteKey, freq, 2.8);
      setActiveStringIdx(sIdx);
      setTimeout(() => {
        setActiveStringIdx(null);
      }, 500);
    }
  };

  const handlePlayProgression = (progression) => {
    if (isPlayingProgression) return;
    setIsPlayingProgression(true);

    const chordObjects = progression.chords.map((chName) =>
      GUITAR_CHORDS.find((c) => c.name === chName.split(' ')[0]) || GUITAR_CHORDS[0]
    );

    chordObjects.forEach((ch, idx) => {
      setTimeout(() => {
        setSelectedChord(ch);
        soundEngine.strumChord(ch.frequencies, 40, ch.noteKeys);
      }, idx * 1200);
    });

    setTimeout(() => {
      setIsPlayingProgression(false);
    }, chordObjects.length * 1200 + 400);
  };

  const getChordDisplayName = (ch) => (notation === 'ES' ? ch.solfege : ch.name);

  return (
    <div className="chords-section-container">
      {/* Barra de cabecera con selector de vista (Biblioteca vs Entrenador) */}
      <div className="chords-header-bar">
        <div>
          <h2 className="chords-main-title">Los 12 Acordes Esenciales de Guitarra</h2>
          <p className="chords-main-subtitle">
            Aprende la digitación exacta, escucha su sonido real y practica transiciones fluidas.
          </p>
        </div>

        <div className="view-mode-toggle" role="group">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'library' ? 'active' : ''}`}
            onClick={() => setViewMode('library')}
          >
            <BookOpen size={16} />
            <span className="btn-full-label">Biblioteca & Digitación</span>
            <span className="btn-short-label">Biblioteca</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'trainer' ? 'active' : ''}`}
            onClick={() => setViewMode('trainer')}
          >
            <Zap size={16} />
            <span className="btn-full-label">⚡ Entrenador de Cambios</span>
            <span className="btn-short-label">Entrenador</span>
          </button>
        </div>
      </div>

      {viewMode === 'trainer' ? (
        <ChordTransitionTrainer notation={notation} />
      ) : (
        <>
          {/* Barra de Filtros */}
          <div className="chord-filters-bar">
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              Todos los 12 Acordes
            </button>
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'major' ? 'active' : ''}`}
              onClick={() => setFilterCategory('major')}
            >
              Mayores (C, A, G, E, D, F)
            </button>
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'minor' ? 'active' : ''}`}
              onClick={() => setFilterCategory('minor')}
            >
              Menores (Am, Em, Dm)
            </button>
            <button
              type="button"
              className={`filter-pill ${filterCategory === 'seventh' ? 'active' : ''}`}
              onClick={() => setFilterCategory('seventh')}
            >
              Séptimas (E7, A7, D7)
            </button>
            <button
              type="button"
              className={`filter-pill easy-pill ${filterCategory === 'twoFinger' ? 'active' : ''}`}
              onClick={() => setFilterCategory('twoFinger')}
            >
              ⭐ Súper Fáciles (2 dedos)
            </button>
          </div>

          <div className="chords-master-layout">
            {/* Cuadrícula de Acordes */}
            <div className="chords-cards-grid">
              {filteredChords.map((chord) => {
                const isSelected = selectedChord.id === chord.id;
                const displayName = getChordDisplayName(chord);

                return (
                  <div
                    key={chord.id}
                    className={`chord-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectChord(chord)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="chord-card-header">
                      <span className="chord-card-name">{displayName}</span>
                      <span className={`diff-tag diff-${chord.difficulty}`}>
                        {chord.difficultyLabel}
                      </span>
                    </div>

                    <div className="chord-card-diagram">
                      <ChordDiagram chord={chord} size="small" />
                    </div>

                    <div className="chord-card-footer">
                      <span className="chord-full-sub">{chord.fullName}</span>
                      <button
                        type="button"
                        className="quick-strum-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStrum(chord);
                        }}
                        title={`Rasguear acorde ${displayName}`}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel de Detalle y Digitación del Acorde Seleccionado */}
            {selectedChord && (
              <div className="chord-detail-inspector">
                <div className="inspector-header">
                  <div className="inspector-title-wrap">
                    <span className="inspector-badge">Acorde Seleccionado</span>
                    <h3 className="inspector-chord-name">
                      {getChordDisplayName(selectedChord)}
                      <span className="inspector-chord-sub"> — {selectedChord.fullName}</span>
                    </h3>
                  </div>

                  <span className={`inspector-diff-badge diff-${selectedChord.difficulty}`}>
                    {selectedChord.difficultyLabel}
                  </span>
                </div>

                {/* Diagrama Central Grande con Botones de Sonido */}
                <div className="inspector-diagram-section">
                  <div className="large-diagram-box">
                    <ChordDiagram
                      chord={selectedChord}
                      size="large"
                      activeStringIdx={activeStringIdx}
                      onStringClick={handlePlaySingleString}
                    />
                    <div className="diagram-click-hint">
                      💡 Haz clic en cualquier cuerda del diagrama para hacerla sonar individualmente.
                    </div>
                  </div>

                  <div className="inspector-audio-actions">
                    <button
                      type="button"
                      className="chord-action-btn primary-strum"
                      onClick={() => handleStrum(selectedChord)}
                    >
                      <Play size={18} fill="currentColor" />
                      Rasguear Acorde Completo
                    </button>

                    <button
                      type="button"
                      className="chord-action-btn secondary-arpeggio"
                      onClick={() => handleArpeggiate(selectedChord)}
                    >
                      <Volume2 size={18} />
                      Puntear Cuerda por Cuerda (Arpegio)
                    </button>

                    {/* Guía de Dedos */}
                    <div className="finger-legend-box">
                      <div className="legend-title">Guía de Colores de los Dedos:</div>
                      <div className="finger-chips-list">
                        <span className="finger-chip finger-1">
                          <strong>1</strong> Índice
                        </span>
                        <span className="finger-chip finger-2">
                          <strong>2</strong> Medio
                        </span>
                        <span className="finger-chip finger-3">
                          <strong>3</strong> Anular
                        </span>
                        <span className="finger-chip finger-4">
                          <strong>4</strong> Meñique
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consejos y Canciones Famosas */}
                <div className="inspector-meta-grid">
                  <div className="meta-card-box tip-card">
                    <h4>
                      <Lightbulb size={18} className="tip-icon-gold" /> Consejo de Postura y Digitación:
                    </h4>
                    <p>{selectedChord.tip}</p>
                  </div>

                  <div className="meta-card-box songs-card">
                    <h4>
                      <Music size={18} className="songs-icon-purple" /> Canciones Famosas con este Acorde:
                    </h4>
                    <p>{selectedChord.famousSongs}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección de Progresiones Populares */}
          <div className="progressions-footer-card">
            <div className="prog-header">
              <div className="prog-icon-badge">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="prog-title">Progresiones Populares con estos 12 Acordes</h4>
                <p className="prog-subtitle">
                  ¡Combina los acordes aprendidos para tocar cientos de canciones famosas!
                </p>
              </div>
            </div>

            <div className="progressions-grid">
              {POPULAR_PROGRESSIONS.map((prog, idx) => (
                <div key={`prog-${idx}`} className="progression-pill-card">
                  <div className="prog-name">{prog.name}</div>
                  <div className="prog-chords-sequence">
                    {(notation === 'ES' ? prog.solfege : prog.chords).map((ch, cIdx) => (
                      <Fragment key={`ch-${cIdx}`}>
                        <span className="sequence-chord-badge">{ch}</span>
                        {cIdx < prog.chords.length - 1 && <span className="sequence-arrow">➔</span>}
                      </Fragment>
                    ))}
                  </div>
                  <div className="prog-examples">{prog.songs}</div>
                  <button
                    type="button"
                    className="prog-play-btn"
                    onClick={() => handlePlayProgression(prog)}
                    disabled={isPlayingProgression}
                  >
                    <Play size={14} fill="currentColor" />
                    Escuchar Progresión
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
