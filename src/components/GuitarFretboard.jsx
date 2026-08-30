import { useState } from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

export default function GuitarFretboard({
  strings,
  placedNotes,
  onDropNote,
  selectedBadge,
  onSlotClick,
  notation,
  vibratingString,
  setVibratingString,
  reverseOrder,
  setReverseOrder
}) {
  const [dragOverStringId, setDragOverStringId] = useState(null);
  const [errorStringId, setErrorStringId] = useState(null);

  const displayedStrings = reverseOrder
    ? [...strings].reverse()
    : strings;

  const handlePluckString = (stringObj) => {
    soundEngine.playString(stringObj.frequency, stringObj.noteKey);
    setVibratingString(stringObj.id);
    setTimeout(() => {
      setVibratingString(null);
    }, 1200);
  };

  const handleDragOver = (e, stringId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStringId !== stringId) {
      setDragOverStringId(stringId);
    }
  };

  const handleDragLeave = (e, stringId) => {
    if (dragOverStringId === stringId) {
      setDragOverStringId(null);
    }
  };

  const handleDrop = (e, targetString) => {
    e.preventDefault();
    setDragOverStringId(null);
    const draggedDataStr = e.dataTransfer.getData('application/json');
    if (!draggedDataStr) return;

    try {
      const draggedBadge = JSON.parse(draggedDataStr);
      validateAndPlace(draggedBadge, targetString);
    } catch (err) {
      console.error('Error parsing drop data:', err);
    }
  };

  const handleSlotClickInternal = (targetString) => {
    if (selectedBadge) {
      validateAndPlace(selectedBadge, targetString);
      onSlotClick(null); // Deseleccionar
    } else {
      handlePluckString(targetString);
    }
  };

  const validateAndPlace = (badge, targetString) => {
    const isMatch = badge.note === targetString.note;

    if (isMatch) {
      onDropNote(targetString.id, badge);
      handlePluckString(targetString);
    } else {
      soundEngine.playErrorBuzz();
      setErrorStringId(targetString.id);
      setTimeout(() => {
        setErrorStringId(null);
      }, 700);
    }
  };

  return (
    <div className="guitar-fretboard-container">
      {/* Controles de vista del mástil */}
      <div className="fretboard-controls">
        <div className="order-toggle">
          <span className="order-label">Orientación del Mástil:</span>
          <button
            type="button"
            className={`order-btn ${!reverseOrder ? 'active' : ''}`}
            onClick={() => setReverseOrder(false)}
          >
            6ª (Grave) ➔ 1ª (Aguda)
          </button>
          <button
            type="button"
            className={`order-btn ${reverseOrder ? 'active' : ''}`}
            onClick={() => setReverseOrder(true)}
          >
            1ª (Aguda) ➔ 6ª (Grave)
          </button>
        </div>

        <div className="fretboard-legend">
          <span className="legend-item">
            <span className="legend-dot bronze"></span> Cuerdas entorchadas (Bajos)
          </span>
          <span className="legend-item">
            <span className="legend-dot steel"></span> Cuerdas de acero liso (Agudos)
          </span>
        </div>
      </div>

      {/* Vista interactiva de la Guitarra (Pala + Cejuela + Mástil con Trastes) */}
      <div className="guitar-fretboard-card-wrapper">
        <div className="guitar-fretboard-card">
          {/* Cabezal / Pala de la guitarra */}
          <div className="guitar-headstock">
            <div className="headstock-body">
              <div className="headstock-logo">Guitarrapp</div>
              <div className="headstock-truss-cover"></div>
            </div>
          </div>

          {/* Cejuela (Nut) */}
          <div className="guitar-nut">
            <div className="nut-label">Cejuela (Nut)</div>
          </div>

          {/* Mástil y cuerdas interactivas */}
          <div className="fretboard-board">
            {/* Trastes decorativos de madera con incrustaciones (Inlays) */}
            <div className="fret-lines-grid">
              <div className="fret-column fret-1">
                <span className="fret-num">Traste I</span>
              </div>
              <div className="fret-column fret-2">
                <span className="fret-num">Traste II</span>
              </div>
              <div className="fret-column fret-3">
                <span className="fret-num">Traste III</span>
                <div className="fret-inlay single-dot"></div>
              </div>
              <div className="fret-column fret-4">
                <span className="fret-num">Traste IV</span>
              </div>
              <div className="fret-column fret-5">
                <span className="fret-num">Traste V</span>
                <div className="fret-inlay single-dot"></div>
              </div>
            </div>

            {/* Carriles de las 6 cuerdas */}
            <div className="strings-track-list">
              {displayedStrings.map((stringObj) => {
                const placed = placedNotes[stringObj.id];
                const isVibrating = vibratingString === stringObj.id;
                const isDragOver = dragOverStringId === stringObj.id;
                const isError = errorStringId === stringObj.id;

                const noteDisplay = notation === 'ES' ? stringObj.solfege : stringObj.note;

                return (
                  <div
                    key={stringObj.id}
                    data-string-id={stringObj.id}
                    className={`string-lane ${isDragOver ? 'drag-over' : ''} ${isError ? 'drop-error' : ''} ${
                      placed ? 'is-solved' : ''
                    } ${selectedBadge && !placed ? 'waiting-for-placement' : ''}`}
                    onClick={() => handleSlotClickInternal(stringObj)}
                  >
                    {/* Etiqueta del número de cuerda */}
                    <div className="string-number-tag">
                      <span className="num-pill">{stringObj.number}ª</span>
                      <span className="string-subinfo">
                        {stringObj.type === 'wound' ? 'Entorchada' : 'Lisa'} ({stringObj.gauge})
                      </span>
                    </div>

                    {/* Zona de Soltado / Ranura de la Nota (Drop Target) */}
                    <div
                      className={`drop-slot ${placed ? 'slot-filled' : 'slot-empty'} ${
                        selectedBadge ? 'slot-waiting-click' : ''
                      } ${isDragOver ? 'slot-hovered' : ''}`}
                      onDragOver={(e) => handleDragOver(e, stringObj.id)}
                      onDragLeave={(e) => handleDragLeave(e, stringObj.id)}
                      onDrop={(e) => handleDrop(e, stringObj)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClickInternal(stringObj);
                      }}
                      role="button"
                      tabIndex={0}
                      title={
                        placed
                          ? `${stringObj.number}ª cuerda: ${noteDisplay} (${stringObj.frequency} Hz). Clic para hacerla sonar.`
                          : `Arrastra aquí la nota de la ${stringObj.number}ª cuerda`
                      }
                    >
                      {placed ? (
                        <div className="placed-badge-content">
                          <span className="badge-note-main">{notation === 'ES' ? placed.solfege : placed.note}</span>
                          <span className="badge-octave">{stringObj.octave}</span>
                          <CheckCircle2 size={16} className="badge-check-icon" />
                        </div>
                      ) : (
                        <div className="empty-slot-placeholder">
                          <span className="slot-plus-icon">+</span>
                          <span className="slot-hint-text">
                            {selectedBadge
                              ? `${notation === 'ES' ? selectedBadge.solfege : selectedBadge.note}`
                              : `Cuerda ${stringObj.number}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* La cuerda física vibratoria */}
                    <div
                      className="string-visual-wrapper"
                      onClick={(e) => {
                        if (selectedBadge) {
                          e.stopPropagation();
                          handleSlotClickInternal(stringObj);
                        } else {
                          handlePluckString(stringObj);
                        }
                      }}
                      title={`Pulsar cuerda ${stringObj.number} (${stringObj.fullName})`}
                    >
                      <div
                        className={`guitar-string-line ${stringObj.type} ${isVibrating ? 'vibrating' : ''}`}
                        style={{
                          height: `${stringObj.thicknessPx}px`,
                          backgroundColor: stringObj.color,
                          boxShadow: isVibrating
                            ? `0 0 12px ${stringObj.color}, 0 0 4px #fff`
                            : '0 1px 3px rgba(0,0,0,0.7)'
                        }}
                      >
                        {/* Efecto de hilo entorchado */}
                        {stringObj.type === 'wound' && <div className="wound-ridges-overlay"></div>}
                      </div>
                    </div>

                    {/* Botón de escuchar y frecuencia en Hz */}
                    <div className="string-audio-trigger">
                      <button
                        type="button"
                        className={`pluck-btn ${isVibrating ? 'btn-plucked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePluckString(stringObj);
                        }}
                        title={`Tocar ${stringObj.fullName} (${stringObj.frequency} Hz)`}
                      >
                        <Volume2 size={16} />
                        <span className="freq-text">{stringObj.frequency} Hz</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
