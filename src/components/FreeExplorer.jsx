import React, { useState } from 'react';
import { Volume2, Play, Info, Sparkles, Activity, Radio } from 'lucide-react';
import { GUITAR_STRINGS } from '../data/guitarStrings';
import { soundEngine } from '../utils/audioEngine';

export default function FreeExplorer({ notation }) {
  const [selectedString, setSelectedString] = useState(GUITAR_STRINGS[0]);
  const [activeVibrations, setActiveVibrations] = useState({});

  const handlePluck = (stringObj) => {
    setSelectedString(stringObj);
    soundEngine.playString(stringObj.frequency, stringObj.noteKey);

    setActiveVibrations((prev) => ({ ...prev, [stringObj.id]: true }));
    setTimeout(() => {
      setActiveVibrations((prev) => ({ ...prev, [stringObj.id]: false }));
    }, 1500);
  };

  const handleStrumAll = () => {
    soundEngine.playCelebrationChord();
    GUITAR_STRINGS.forEach((str, idx) => {
      setTimeout(() => {
        setActiveVibrations((prev) => ({ ...prev, [str.id]: true }));
      }, idx * 75);
      setTimeout(() => {
        setActiveVibrations((prev) => ({ ...prev, [str.id]: false }));
      }, idx * 75 + 1800);
    });
  };

  return (
    <div className="free-explorer-container">
      {/* Barra de acciones de exploración */}
      <div className="explorer-header-bar">
        <div>
          <h3 className="explorer-title">Explorador de Afinación y Calibres</h3>
          <p className="explorer-desc">
            Haz clic en cualquier cuerda para escuchar su sonido afinado con modelado físico y ver sus propiedades acústicas.
          </p>
        </div>
        <button
          type="button"
          className="strum-all-btn"
          onClick={handleStrumAll}
          title="Rasguear las 6 cuerdas al aire (Acorde E/Mi)"
        >
          <Play size={18} fill="currentColor" />
          Rasguear Todas al Aire
        </button>
      </div>

      <div className="explorer-grid-layout">
        {/* Lista interactiva de cuerdas */}
        <div className="explorer-strings-list">
          {GUITAR_STRINGS.map((str) => {
            const isSelected = selectedString?.id === str.id;
            const isVibrating = activeVibrations[str.id];
            const noteText = notation === 'ES' ? str.solfege : str.note;

            return (
              <div
                key={str.id}
                className={`explorer-string-card ${isSelected ? 'selected' : ''} ${
                  isVibrating ? 'is-playing' : ''
                }`}
                onClick={() => handlePluck(str)}
                role="button"
                tabIndex={0}
              >
                <div className="card-badge-num">{str.number}ª</div>

                <div className="card-note-info">
                  <div className="card-main-note">
                    {noteText}
                    <span className="card-octave-sub">{str.octave}</span>
                  </div>
                  <div className="card-full-name">{str.fullName}</div>
                </div>

                {/* Visualizador de vibración */}
                <div className="string-wave-visualizer">
                  <div
                    className={`explorer-string-line ${isVibrating ? 'wave-active' : ''}`}
                    style={{
                      height: `${str.thicknessPx}px`,
                      backgroundColor: str.color
                    }}
                  ></div>
                </div>

                <div className="card-freq-tag">
                  <Activity size={14} />
                  {str.frequency} Hz
                </div>

                <button
                  type="button"
                  className="card-play-icon"
                  title="Pulsar cuerda"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Panel de detalles de la cuerda seleccionada */}
        {selectedString && (
          <div className="explorer-detail-panel">
            <div className="panel-header">
              <div className="panel-tag">
                <Radio size={16} /> Detalle de la Cuerda
              </div>
              <h4 className="panel-title">
                {selectedString.number}ª Cuerda — {notation === 'ES' ? selectedString.solfege : selectedString.note}
                <span className="panel-octave">{selectedString.octave}</span>
              </h4>
            </div>

            <div className="panel-spec-grid">
              <div className="spec-item">
                <span className="spec-label">Frecuencia fundamental</span>
                <span className="spec-value highlight">{selectedString.frequency} Hz</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Calibre estándar</span>
                <span className="spec-value">{selectedString.gauge}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Construcción</span>
                <span className="spec-value">
                  {selectedString.type === 'wound' ? 'Entorchada (Bronce/Níquel)' : 'Lisa (Acero plateado)'}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Sistema Anglo / Latino</span>
                <span className="spec-value">
                  {selectedString.note} = {selectedString.solfege}
                </span>
              </div>
            </div>

            <div className="panel-description-box">
              <h5><Info size={16} /> Descripción y uso musical:</h5>
              <p>{selectedString.description}</p>
            </div>

            <div className="panel-mnemonic-hint">
              <Sparkles size={16} className="sparkle-gold" />
              <span>
                <strong>Regla de memoria:</strong> "{selectedString.mnemonicEn}" en inglés / "
                {selectedString.mnemonicEs}" en español.
              </span>
            </div>

            <button
              type="button"
              className="panel-pluck-big-btn"
              onClick={() => handlePluck(selectedString)}
            >
              <Volume2 size={20} />
              Hacer sonar {selectedString.fullName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
