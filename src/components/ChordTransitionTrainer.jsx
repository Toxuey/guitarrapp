import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Zap } from 'lucide-react';
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
  const [bpm, setBpm] = useState(50); // BPM para principiantes (40 - 90)
  const [beatsPerChord, setBeatsPerChord] = useState(4); // 4 tiempos o 2 tiempos
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1); // 1, 2, 3, 4
  const [activeChordSlot, setActiveChordSlot] = useState('A'); // 'A' | 'B'

  const chordA = GUITAR_CHORDS.find((c) => c.id === chordAId) || GUITAR_CHORDS[7];
  const chordB = GUITAR_CHORDS.find((c) => c.id === chordBId) || GUITAR_CHORDS[0];

  const stateRef = useRef({
    isPlaying: false,
    currentBeat: 1,
    activeChordSlot: 'A',
    chordA,
    chordB,
    beatsPerChord: 4
  });

  // Mantener referencias actualizadas
  useEffect(() => {
    stateRef.current.chordA = chordA;
    stateRef.current.chordB = chordB;
    stateRef.current.beatsPerChord = beatsPerChord;
  }, [chordA, chordB, beatsPerChord]);

  const handleSelectPair = (pair) => {
    const foundA = GUITAR_CHORDS.find((c) => c.name === pair.chordA);
    const foundB = GUITAR_CHORDS.find((c) => c.name === pair.chordB);
    if (foundA) setChordAId(foundA.id);
    if (foundB) setChordBId(foundB.id);
    setIsPlaying(false);
    stateRef.current.isPlaying = false;
    stateRef.current.currentBeat = 1;
    stateRef.current.activeChordSlot = 'A';
    setCurrentBeat(1);
    setActiveChordSlot('A');
  };

  // Bucle de metrónomo y cambio de acordes continuo y sincronizado
  useEffect(() => {
    if (!isPlaying) return;

    stateRef.current.isPlaying = true;
    const intervalMs = (60 / bpm) * 1000;

    const timer = setInterval(() => {
      const current = stateRef.current.currentBeat;
      const maxBeats = stateRef.current.beatsPerChord;

      if (current >= maxBeats) {
        // Fin del compás actual -> Cambiar de acorde en tiempo 1
        const nextSlot = stateRef.current.activeChordSlot === 'A' ? 'B' : 'A';
        stateRef.current.activeChordSlot = nextSlot;
        stateRef.current.currentBeat = 1;

        setActiveChordSlot(nextSlot);
        setCurrentBeat(1);

        // Tocar el nuevo acorde y click con acento en el tiempo 1
        const chordToPlay = nextSlot === 'A' ? stateRef.current.chordA : stateRef.current.chordB;
        soundEngine.strumChord(chordToPlay.frequencies, 35, chordToPlay.noteKeys);
        soundEngine.playMetronomeClick(true);
      } else {
        // Tiempos intermedios (2, 3, 4)
        const nextBeat = current + 1;
        stateRef.current.currentBeat = nextBeat;
        setCurrentBeat(nextBeat);
        // Sonido de click normal
        soundEngine.playMetronomeClick(false);
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, bpm]);

  const togglePlay = () => {
    soundEngine.init();
    if (!isPlaying) {
      // Iniciar en el tiempo 1 tocando el acorde A
      stateRef.current.currentBeat = 1;
      stateRef.current.activeChordSlot = 'A';
      setCurrentBeat(1);
      setActiveChordSlot('A');

      soundEngine.strumChord(chordA.frequencies, 35, chordA.noteKeys);
      soundEngine.playMetronomeClick(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    stateRef.current.isPlaying = false;
    stateRef.current.currentBeat = 1;
    stateRef.current.activeChordSlot = 'A';
    setCurrentBeat(1);
    setActiveChordSlot('A');
  };

  const getChordDisplay = (ch) => (notation === 'ES' ? ch.solfege : ch.name);

  const targetNextChord = activeChordSlot === 'A' ? chordB : chordA;

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
              Practica el cambio continuo entre 2 acordes al compás del metrónomo en un bucle automático.
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
          <label htmlFor="chord-a-select">Acorde A (Inicial):</label>
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
          <label htmlFor="chord-b-select">Acorde B (Siguiente):</label>
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
        {/* Panel Acorde A */}
        <div className={`stage-chord-panel chord-panel-a ${activeChordSlot === 'A' ? 'is-active-now' : 'is-standby'}`}>
          <div className="stage-tag">
            {activeChordSlot === 'A' ? '🎸 ¡TOCANDO AHORA!' : '⏳ Siguiente cambio'}
          </div>
          <h4 className="stage-chord-name">{getChordDisplay(chordA)}</h4>
          <div className="stage-diagram-container">
            <ChordDiagram chord={chordA} size="small" />
          </div>
        </div>

        {/* Ticker Central de Ritmo y Metrónomo */}
        <div className="stage-metronome-center">
          <div className="metronome-beats-grid">
            {Array.from({ length: beatsPerChord }).map((_, idx) => {
              const b = idx + 1;
              const isActive = currentBeat === b && isPlaying;
              return (
                <div
                  key={`beat-${b}`}
                  className={`beat-indicator ${isActive ? 'active-beat' : ''} ${b === 1 ? 'beat-one' : ''}`}
                >
                  {b}
                </div>
              );
            })}
          </div>

          <div className="metronome-instruction">
            {isPlaying ? (
              currentBeat === beatsPerChord ? (
                <span className="switch-warning">
                  ⚡ ¡CAMBIO A {getChordDisplay(targetNextChord)} EN EL 1!
                </span>
              ) : (
                <span>Compás de {getChordDisplay(activeChordSlot === 'A' ? chordA : chordB)} • Tiempo {currentBeat} de {beatsPerChord}</span>
              )
            ) : (
              <span>Pulsa "Iniciar Práctica" para comenzar el ciclo continuo</span>
            )}
          </div>

          {/* Control de BPM y Tiempos */}
          <div className="bpm-control-wrap">
            <div className="bpm-header-row">
              <span className="bpm-text">Velocidad: <strong>{bpm} BPM</strong></span>
              <div className="beats-selector-toggle">
                <button
                  type="button"
                  className={`beat-toggle-btn ${beatsPerChord === 4 ? 'active' : ''}`}
                  onClick={() => setBeatsPerChord(4)}
                  title="4 tiempos por acorde (1 compás completo)"
                >
                  4 Tiempos
                </button>
                <button
                  type="button"
                  className={`beat-toggle-btn ${beatsPerChord === 2 ? 'active' : ''}`}
                  onClick={() => setBeatsPerChord(2)}
                  title="2 tiempos por acorde (cambio más rápido)"
                >
                  2 Tiempos
                </button>
              </div>
            </div>

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
              <span>Rápido (90)</span>
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
              {isPlaying ? 'Pausar Ciclo' : 'Iniciar Práctica'}
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

        {/* Panel Acorde B */}
        <div className={`stage-chord-panel chord-panel-b ${activeChordSlot === 'B' ? 'is-active-now' : 'is-standby'}`}>
          <div className="stage-tag">
            {activeChordSlot === 'B' ? '🎸 ¡TOCANDO AHORA!' : '⏳ Siguiente cambio'}
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
