import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, RotateCcw, Shuffle, HelpCircle, CheckCircle, Hand, X } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

// Función de detección geométrica de cuerda bajo las coordenadas del dedo/cursor
function findStringAtCoordinates(x, y, strings) {
  if (!strings || strings.length === 0) return null;

  const stringElements = document.querySelectorAll('.string-lane[data-string-id]');
  if (!stringElements || stringElements.length === 0) return null;

  // 1. Probar colisión directa con tolerancia táctil ampliada
  for (const el of stringElements) {
    const rect = el.getBoundingClientRect();
    const toleranceY = 22;
    const toleranceX = 50;
    if (
      x >= rect.left - toleranceX &&
      x <= rect.right + toleranceX &&
      y >= rect.top - toleranceY &&
      y <= rect.bottom + toleranceY
    ) {
      const stringId = el.getAttribute('data-string-id');
      return strings.find((s) => s.id === stringId) || null;
    }
  }

  // 2. Si el dedo está sobre la zona del mástil, encontrar la cuerda más cercana verticalmente
  const fretboardEl = document.querySelector('.guitar-fretboard-card') || document.querySelector('.guitar-fretboard-card-wrapper');
  if (fretboardEl) {
    const fRect = fretboardEl.getBoundingClientRect();
    if (x >= fRect.left - 60 && x <= fRect.right + 60 && y >= fRect.top - 20 && y <= fRect.bottom + 20) {
      let closestString = null;
      let minDistance = Infinity;
      for (const el of stringElements) {
        const rect = el.getBoundingClientRect();
        const centerY = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(y - centerY);
        if (dist < minDistance) {
          minDistance = dist;
          const stringId = el.getAttribute('data-string-id');
          closestString = strings.find((s) => s.id === stringId);
        }
      }
      if (minDistance < 80) {
        return closestString;
      }
    }
  }

  return null;
}

export default function DragBadgeDeck({
  badges,
  placedNotes,
  selectedBadge,
  setSelectedBadge,
  notation,
  onReset,
  onShuffle,
  onAutoSolve,
  isComplete,
  strings,
  onDropNote,
  setVibratingString
}) {
  const [activeDragBadge, setActiveDragBadge] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [hoveredStringId, setHoveredStringId] = useState(null);

  const startPosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const currentBadgeRef = useRef(null);

  // Al presionar la ficha: Activar inmediatamente bajo el dedo con coordenadas exactas
  const handlePointerDown = (e, badge) => {
    const isPlaced = Object.values(placedNotes).some((placed) => placed?.id === badge.id);
    if (isPlaced) return;

    soundEngine.init();
    const clientX = e.clientX;
    const clientY = e.clientY;

    startPosRef.current = { x: clientX, y: clientY };
    currentBadgeRef.current = badge;
    isDraggingRef.current = false;
    
    // Iniciar la posición exactamente en el punto de contacto del dedo
    setDragPos({ x: clientX, y: clientY });
    setActiveDragBadge(badge);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignorar si el navegador no permite captura
    }
  };

  // Al mover el dedo o ratón: Mover la ficha flotante y detectar cuerdas
  const handlePointerMove = (e) => {
    if (!currentBadgeRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const dx = Math.abs(clientX - startPosRef.current.x);
    const dy = Math.abs(clientY - startPosRef.current.y);

    if (dx > 3 || dy > 3) {
      isDraggingRef.current = true;
    }

    setDragPos({ x: clientX, y: clientY });

    // Detección en tiempo real de cuerda
    const targetStr = findStringAtCoordinates(clientX, clientY, strings);
    setHoveredStringId(targetStr ? targetStr.id : null);
  };

  // Al soltar el dedo o ratón
  const handlePointerUp = (e) => {
    const badge = currentBadgeRef.current;
    if (!badge) {
      setActiveDragBadge(null);
      setHoveredStringId(null);
      return;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar
    }

    if (isDraggingRef.current) {
      // Se arrastró: Probar si se soltó sobre una cuerda
      const targetStr = findStringAtCoordinates(e.clientX, e.clientY, strings);
      if (targetStr) {
        validateAndPlace(badge, targetStr);
      }
    } else {
      // Fue un toque/clic simple sin arrastre: Seleccionar / Deseleccionar
      handleBadgeClick(badge);
    }

    setActiveDragBadge(null);
    setHoveredStringId(null);
    isDraggingRef.current = false;
    currentBadgeRef.current = null;
  };

  const handlePointerCancel = () => {
    setActiveDragBadge(null);
    setHoveredStringId(null);
    isDraggingRef.current = false;
    currentBadgeRef.current = null;
  };

  // Efecto para iluminar la cuerda en hover en tiempo real
  useEffect(() => {
    const stringLanes = document.querySelectorAll('.string-lane');
    stringLanes.forEach((el) => {
      const sId = el.getAttribute('data-string-id');
      if (hoveredStringId && sId === hoveredStringId) {
        el.classList.add('drag-over');
      } else {
        el.classList.remove('drag-over');
      }
    });
  }, [hoveredStringId]);

  const validateAndPlace = (badge, targetString) => {
    const isMatch = badge.note === targetString.note;
    if (isMatch) {
      onDropNote(targetString.id, badge);
      soundEngine.playString(targetString.frequency, targetString.noteKey);
      if (setVibratingString) {
        setVibratingString(targetString.id);
        setTimeout(() => setVibratingString(null), 1200);
      }
    } else {
      soundEngine.playErrorBuzz();
      const targetElem = document.querySelector(`[data-string-id="${targetString.id}"]`);
      if (targetElem) {
        targetElem.classList.add('drop-error');
        setTimeout(() => targetElem.classList.remove('drop-error'), 700);
      }
    }
  };

  const handleBadgeClick = (badge) => {
    if (selectedBadge?.id === badge.id) {
      setSelectedBadge(null);
    } else {
      setSelectedBadge(badge);
    }
  };

  const completedCount = Object.keys(placedNotes).length;
  const progressPercent = Math.round((completedCount / 6) * 100);
  const selectedNoteText = selectedBadge
    ? notation === 'ES'
      ? selectedBadge.solfege
      : selectedBadge.note
    : null;

  return (
    <div className="badge-deck-container">
      {/* Ficha flotante renderizada en document.body mediante createPortal para coordenadas exactas en viewport */}
      {activeDragBadge && typeof document !== 'undefined' && createPortal(
        <div
          className="floating-touch-badge"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`
          }}
        >
          <span className="floating-badge-note">
            {notation === 'ES' ? activeDragBadge.solfege : activeDragBadge.note}
          </span>
          <span className="floating-badge-octave">{activeDragBadge.octave}</span>
        </div>,
        document.body
      )}

      <div className="deck-header">
        <div className="deck-title-group">
          <div className="deck-title-icon">
            <Hand size={20} className="pulse-icon" />
          </div>
          <div>
            <h3 className="deck-title">Banco de Notas Disponibles</h3>
            <p className="deck-subtitle">
              Arrastra con el dedo hacia la cuerda o toca una ficha y luego toca su cuerda en el mástil.
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="progress-card">
          <div className="progress-labels">
            <span className="progress-status-text">
              Progreso: <strong>{completedCount} de 6</strong> cuerdas
            </span>
            <span className="progress-percent">{progressPercent}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Banner de ficha seleccionada para colocar */}
      {selectedBadge && !isComplete && (
        <div className="selected-badge-banner">
          <span className="selected-badge-text">
            📍 Ficha seleccionada: <strong>{selectedNoteText}</strong> — Toca cualquier cuerda en el mástil arriba para ubicarla.
          </span>
          <button
            type="button"
            className="cancel-selection-btn"
            onClick={() => setSelectedBadge(null)}
            title="Cancelar selección"
          >
            <X size={14} /> Cancelar
          </button>
        </div>
      )}

      {/* Cartel de felicitación cuando se completan las 6 cuerdas */}
      {isComplete ? (
        <div className="completion-banner">
          <div className="completion-icon-wrapper">
            <Sparkles size={32} className="sparkle-anim" />
          </div>
          <div className="completion-text">
            <h4>¡Excelente trabajo! 🎉</h4>
            <p>Has identificado correctamente las 6 cuerdas en afinación estándar (E-A-D-G-B-E).</p>
          </div>
          <button
            type="button"
            className="deck-action-btn primary-btn"
            onClick={onReset}
          >
            <RotateCcw size={16} />
            Volver a practicar
          </button>
        </div>
      ) : (
        /* Lista de fichas interactivas */
        <div className="badges-grid">
          {badges.map((badge) => {
            const isPlaced = Object.values(placedNotes).some(
              (placed) => placed?.id === badge.id
            );
            const isSelected = selectedBadge?.id === badge.id;
            const isCurrentlyDragging = activeDragBadge?.id === badge.id;
            const noteText = notation === 'ES' ? badge.solfege : badge.note;

            return (
              <div
                key={badge.id}
                onPointerDown={(e) => handlePointerDown(e, badge)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                className={`note-chip ${isPlaced ? 'is-used' : ''} ${
                  isSelected ? 'is-selected' : ''
                } ${isCurrentlyDragging ? 'is-picked-up' : ''} ${
                  badge.type === 'wound' ? 'chip-wound' : 'chip-plain'
                }`}
                role="button"
                tabIndex={isPlaced ? -1 : 0}
                title={
                  isPlaced
                    ? `Nota ${noteText} ya ubicada`
                    : `Ficha de nota ${noteText}. Arrastra hacia una cuerda o toca para ubicar.`
                }
              >
                <div className="chip-drag-handle">⋮⋮</div>
                <div className="chip-note-name">{noteText}</div>
                {isPlaced && <CheckCircle size={14} className="chip-used-check" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Botones de acción del banco */}
      <div className="deck-actions-footer">
        <button
          type="button"
          className="deck-action-btn"
          onClick={onShuffle}
          disabled={isComplete}
          title="Revolver el orden de las fichas"
        >
          <Shuffle size={16} />
          Revolver fichas
        </button>

        <button
          type="button"
          className="deck-action-btn"
          onClick={onReset}
          title="Reiniciar el ejercicio desde cero"
        >
          <RotateCcw size={16} />
          Reiniciar
        </button>

        <button
          type="button"
          className="deck-action-btn hint-btn"
          onClick={onAutoSolve}
          disabled={isComplete}
          title="Resolver automáticamente para ver el resultado correcto"
        >
          <HelpCircle size={16} />
          Ver solución
        </button>
      </div>
    </div>
  );
}
