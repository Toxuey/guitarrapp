import React from 'react';
import { Sparkles, RotateCcw, Shuffle, HelpCircle, CheckCircle, Hand } from 'lucide-react';

export default function DragBadgeDeck({
  badges,
  placedNotes,
  selectedBadge,
  setSelectedBadge,
  notation,
  onReset,
  onShuffle,
  onAutoSolve,
  isComplete
}) {
  const handleDragStart = (e, badge) => {
    e.dataTransfer.setData('application/json', JSON.stringify(badge));
    e.dataTransfer.effectAllowed = 'move';
    // Highlight the dragged element
    e.target.classList.add('is-dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('is-dragging');
  };

  const handleBadgeClick = (badge) => {
    if (selectedBadge?.id === badge.id) {
      setSelectedBadge(null); // Deseleccionar si ya estaba seleccionado
    } else {
      setSelectedBadge(badge);
    }
  };

  const completedCount = Object.keys(placedNotes).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <div className="badge-deck-container">
      <div className="deck-header">
        <div className="deck-title-group">
          <div className="deck-title-icon">
            <Hand size={20} className="pulse-icon" />
          </div>
          <div>
            <h3 className="deck-title">Banco de Notas Disponibles</h3>
            <p className="deck-subtitle">
              Arrastra cada ficha a su cuerda correspondiente o haz clic para seleccionarla y luego toca la cuerda.
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
        /* Lista de fichas arrastrables */
        <div className="badges-grid">
          {badges.map((badge) => {
            const isPlaced = Object.values(placedNotes).some(
              (placed) => placed?.id === badge.id
            );
            const isSelected = selectedBadge?.id === badge.id;
            const noteText = notation === 'ES' ? badge.solfege : badge.note;

            return (
              <div
                key={badge.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, badge)}
                onDragEnd={handleDragEnd}
                onClick={() => !isPlaced && handleBadgeClick(badge)}
                className={`note-chip ${isPlaced ? 'is-used' : ''} ${
                  isSelected ? 'is-selected' : ''
                } ${badge.type === 'wound' ? 'chip-wound' : 'chip-plain'}`}
                role="button"
                tabIndex={isPlaced ? -1 : 0}
                title={
                  isPlaced
                    ? `Nota ${noteText} ya ubicada`
                    : `Ficha de nota ${noteText}`
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
