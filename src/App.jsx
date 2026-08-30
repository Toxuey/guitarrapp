import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { GUITAR_STRINGS } from './data/guitarStrings';
import { soundEngine } from './utils/audioEngine';
import Header from './components/Header';
import GuitarFretboard from './components/GuitarFretboard';
import DragBadgeDeck from './components/DragBadgeDeck';
import QuizMode from './components/QuizMode';
import FreeExplorer from './components/FreeExplorer';
import ChordsSection from './components/ChordsSection';
import MnemonicHelper from './components/MnemonicHelper';
import './App.css';

// Crear conjunto inicial de fichas mezcladas
function generateInitialBadges() {
  const list = GUITAR_STRINGS.map((str) => ({
    id: `badge-${str.id}`,
    stringNumber: str.number,
    note: str.note,
    solfege: str.solfege,
    type: str.type,
    octave: str.octave
  }));
  return [...list].sort(() => Math.random() - 0.5);
}

function App() {
  // Estado de modo de la app
  const [activeMode, setActiveMode] = useState('drag'); // 'drag' | 'quiz' | 'chords' | 'explorer'
  const [notation, setNotation] = useState('EN'); // 'EN' (E,B,G,D,A,E) | 'ES' (Mi,Si,Sol,Re,La,Mi)
  const [guitarType, setGuitarType] = useState('steel'); // 'steel' (acústica) | 'nylon' (clásica)
  const [isMuted, setIsMuted] = useState(false);
  const [isMnemonicOpen, setIsMnemonicOpen] = useState(false);

  const handleGuitarTypeChange = (type) => {
    setGuitarType(type);
    soundEngine.setGuitarType(type);
    // Tocar una cuerda al cambiar para feedback inmediato
    soundEngine.playString(82.41, 'E2');
  };

  // Estados del juego de Arrastrar y Soltar
  const [badges, setBadges] = useState(generateInitialBadges);
  const [placedNotes, setPlacedNotes] = useState({}); // { 'string-6': badge, ... }
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [vibratingString, setVibratingString] = useState(null);
  const [reverseOrder, setReverseOrder] = useState(false);

  // Estados del Modo Quiz
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Comprobar si se completaron las 6 cuerdas
  const isComplete = useMemo(() => {
    return Object.keys(placedNotes).length === 6;
  }, [placedNotes]);

  // Al completar las 6 cuerdas: disparar celebración y acorde
  useEffect(() => {
    if (isComplete) {
      soundEngine.playCelebrationChord();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  // Colocar una nota en una cuerda
  const handleDropNote = (targetStringId, badge) => {
    setPlacedNotes((prev) => ({
      ...prev,
      [targetStringId]: badge
    }));
    setSelectedBadge(null);
  };

  // Reiniciar ejercicio de arrastrar y soltar
  const handleReset = () => {
    setPlacedNotes({});
    setSelectedBadge(null);
    setBadges(generateInitialBadges());
  };

  // Revolver orden de fichas
  const handleShuffle = () => {
    setBadges((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Auto-resolver para ver la solución
  const handleAutoSolve = () => {
    const solved = {};
    GUITAR_STRINGS.forEach((str) => {
      solved[str.id] = {
        id: `badge-${str.id}`,
        stringNumber: str.number,
        note: str.note,
        solfege: str.solfege,
        type: str.type,
        octave: str.octave
      };
    });
    setPlacedNotes(solved);
    setSelectedBadge(null);
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
  };

  return (
    <div className="app-wrapper">
      {/* Header y Navegación */}
      <Header
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        notation={notation}
        setNotation={setNotation}
        guitarType={guitarType}
        onGuitarTypeChange={handleGuitarTypeChange}
        isMuted={isMuted}
        toggleMute={toggleMute}
        openMnemonicModal={() => setIsMnemonicOpen(true)}
        score={score}
        streak={streak}
      />

      {/* Contenido según el Modo Activo */}
      <main className="main-content-area">
        {activeMode === 'drag' && (
          <div className="practice-view-layout">
            {/* Mástil y Cuerdas Interactivas */}
            <GuitarFretboard
              strings={GUITAR_STRINGS}
              placedNotes={placedNotes}
              onDropNote={handleDropNote}
              selectedBadge={selectedBadge}
              onSlotClick={setSelectedBadge}
              notation={notation}
              vibratingString={vibratingString}
              setVibratingString={setVibratingString}
              reverseOrder={reverseOrder}
              setReverseOrder={setReverseOrder}
            />

            {/* Banco de Fichas Arrastrables */}
            <DragBadgeDeck
              badges={badges}
              placedNotes={placedNotes}
              selectedBadge={selectedBadge}
              setSelectedBadge={setSelectedBadge}
              notation={notation}
              onReset={handleReset}
              onShuffle={handleShuffle}
              onAutoSolve={handleAutoSolve}
              isComplete={isComplete}
              strings={GUITAR_STRINGS}
              onDropNote={handleDropNote}
              setVibratingString={setVibratingString}
            />
          </div>
        )}

        {activeMode === 'quiz' && (
          <QuizMode
            notation={notation}
            score={score}
            setScore={setScore}
            streak={streak}
            setStreak={setStreak}
          />
        )}

        {activeMode === 'chords' && (
          <ChordsSection notation={notation} />
        )}

        {activeMode === 'explorer' && (
          <FreeExplorer notation={notation} />
        )}
      </main>

      {/* Modal de Trucos Mnemotécnicos */}
      <MnemonicHelper
        isOpen={isMnemonicOpen}
        onClose={() => setIsMnemonicOpen(false)}
        notation={notation}
      />
    </div>
  );
}

export default App;
