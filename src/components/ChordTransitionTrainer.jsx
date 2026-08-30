import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, ArrowRight, Zap, Music } from 'lucide-react';
import { GUITAR_CHORDS } from '../data/guitarChords';
import { soundEngine } from '../utils/audioEngine';
import ChordDiagram from './ChordDiagram';

const POPULAR_PAIRS = [
  { id: 'pair-1', chordA: 'Em', chordB: 'C', label: 'Em ➔ C (La transición más usada)' },
  { id: 'pair-2', chordA: 'G', chordB: 'D', label: 'G ➔ D (Folk & Rock clásico)' },
  { id: 'pair-3', chordA: 'Am', chordB: 'E', label: 'Am ➔ E (Flamenco & Balada)' },
  { id: 'pair-4', chordA: 'C', chordB: 'G', label: 'C ➔ G (Pop acústico)' },
  { id: 'pair-5', chordA: 'D', chordB: 'A', label: 'D ➔ A (Rock & Pop directo)' }
];

export default function ChordTransitionTrainer({ notation }) {
  const [chordAId, setChordAId] = useState('chord-em');
  const [chordBId, setChordBId] = useState('chord-c');
  const [bpm, setBpm] = useState(50); // BPM para principiantes
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1); // 1, 2, 3, 4
  const [activeChordSlot, setActiveChordSlot] = useState('A'); // 'A' | 'B'

  const timerRef = useRef(null);

  const chordA = GUITAR_CHORDS.find((c) => c.id === chordAId) || GUITAR_CHORDS[7];
  const chordB = GUITAR_CHORDS.find((c) => c.id === chordBId) || GUITAR_CHORDS[0];

  const handleSelectPair = (pair) => {
    const foundA = GUITAR_CHORDS.find((c) => c.name === pair.chordA);
    const foundB = GUITAR_CHORDS.find((c) => c.name === pair.chordB);
    if (foundA) setChordAId(foundA.id);
    if (foundB) setChordBId(foundB.id);
    setIsPlaying(false);
    setCurrentBeat(1);
    setActiveChordSlot('A');
  };

  // Bucle de práctica con metrónomo y cambio de compás
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;

    timerRef.current = setInterval(() => {
      setCurrentBeat((prevBeat) => {
        let nextBeat = prevBeat + 1;
        if (nextBeat > 4) {
          nextBeat = 1;
          // Cambiar de acorde en el tiempo 1
          setActiveChordSlot((prevSlot) => {
            const nextSlot = prevSlot === 'A' ? 'B' : 'A';
            const chordToPlay = nextSlot === 'A' ? chordA : chordB;
            soundEngine.strumChord(chordToPlay.frequencies, 35, chordToPlay.noteKeys);
            return nextSlot;
          });
        }
        return nextBeat;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, chordA, chordB]);

  const togglePlay = () => {
    if (!isPlaying) {
      // Iniciar tocando el primer acorde
      const initialChord = activeChordSlot === 'A' ? chordA : chordB;
      soundEngine.strumChord(initialChord.frequencies, 35, initialChord.noteKeys);
      setCurrentBeat(1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentBeat(1);
    setActiveChordSlot('A');
  };

  const currentActiveChord = activeChordSlot === 'A' ? chordA : chordB;
  const nextTargetChord = activeChordSlot === 'A' ? chordB : chordA;

  const getChordDisplay = (ch) => (notation === 'ES' ? ch.solfege : ch.name);

  return (
    <div className="transition-trainer-card">
      <div className="trainer-header">
        <div className="trainer-title-wrap">
          <div className="trainer-badge-icon">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="trainer-title">Entrenador de Cambio de Acordes</h3>
            <p className="trainer-subtitle">
              Practica la velocidad y precisión para pasar de un acorde al siguiente al compás del metrónomo.
            </p>
          </div>
        </div>

        {/* Parejas Populares Rápidas */}
        <div className="pairs-quick-selector">
          <span className="pairs-label">Transiciones recomendadas:</span>
          <div className="pairs-buttons-row">
            {POPULAR_PAIRS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pair-chip-btn ${
                  chordA.name === p.chordA && chordB.name === p.chordB ? 'active' : ''
                }`}
                onClick={() => handleSelectPair(p)}
              >
                {p.chordA} ➔ {p.chordB}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selector Manual de Acordes A y B */}
      <div className="trainer-chords-selection">
        <div className="chord-picker-box">
          <label htmlFor="chord-a-select">Acorde A (Inicio):</label>
          <select
            id="chord-a-select"
            value={chordAId}
            onChange={(e) => {
              setChordAId(e.target.value);
              setIsPlaying(false);
            }}
            className="chord-select-dropdown"
          >
            {GUITAR_CHORDS.map((c) => (
              <option key={`a-${c.id}`} value={c.id}>
                {getChordDisplay(c)} ({c.fullName})
              </option>
            ))}
          </select>
        </div>

        <div className="transition-arrow-symbol">
          <ArrowRight size={24} />
        </div>

        <div className="chord-picker-box">
          <label htmlFor="chord-b-select">Acorde B (Destino):</label>
          <select
            id="chord-b-select"
            value={chordBId}
            onChange={(e) => {
              setChordBId(e.target.value);
              setIsPlaying(false);
            }}
            className="chord-select-dropdown"
          >
            {GUITAR_CHORDS.map((c) => (
              <option key={`b-${c.id}`} value={c.id}>
                {getChordDisplay(c)} ({c.fullName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visor de Acción en Tiempo Real */}
      <div className="trainer-active-stage">
        <div className={`stage-chord-panel ${activeChordSlot === 'A' ? 'is-active-now' : 'is-standby'}`}>
          <div className="stage-tag">
            {activeChordSlot === 'A' ? '¡TOCANDO AHORA!' : 'Siguiente cambio'}
          </div>
          <h4 className="stage-chord-name">{getChordDisplay(chordA)}</h4>
          <div className="stage-diagram-container">
            <ChordDiagram chord={chordA} size="small" />
          </div>
        </div>

        {/* Ticker Central de Ritmo y Metrónomo */}
        <div className="stage-metronome-center">
          <div className="metronome-beats-grid">
            {[1, 2, 3, 4].map((b) => (
              <div
                key={`beat-${b}`}
                className={`beat-indicator ${currentBeat === b && isPlaying ? 'active-beat' : ''}`}
              >
                {b}
              </div>
            ))}
          </div>

          <div className="metronome-instruction">
            {isPlaying ? (
              currentBeat === 4 ? (
                <span className="switch-warning">¡PREPARA EL CAMBIO! ⚡</span>
              ) : (
                <span>Mantén la postura...</span>
              )
            ) : (
              <span>Pulsa "Iniciar Práctica"</span>
            )}
          </div>

          {/* Control de BPM */}
          <div className="bpm-control-wrap">
            <span className="bpm-text">Velocidad: <strong>{bpm} BPM</strong></span>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="bpm-slider"
            />
            <div className="bpm-hints">
              <span>Lento (40)</span>
              <span>Medio (65)</span>
              <span>Fluido (90)</span>
            </div>
          </div>

          {/* Botones de Control */}
          <div className="trainer-controls-row">
            <button
              type="button"
              className={`trainer-play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              {isPlaying ? 'Pausar' : 'Iniciar Práctica'}
            </button>

            <button
              type="button"
              className="trainer-reset-btn"
              onClick={handleReset}
              title="Reiniciar al compás 1"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className={`stage-chord-panel ${activeChordSlot === 'B' ? 'is-active-now' : 'is-standby'}`}>
          <div className="stage-tag">
            {activeChordSlot === 'B' ? '¡TOCANDO AHORA!' : 'Siguiente cambio'}
          </div>
          <h4 className="stage-chord-name">{getChordDisplay(chordB)}</h4>
          <div className="stage-diagram-container">
            <ChordDiagram chord={chordB} size="small" />
          </div>
        </div>
      </div>
    </div>
  );
}
