import { X, BookOpen, Lightbulb } from 'lucide-react';

export default function MnemonicHelper({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mnemonic-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-badge-icon">
              <BookOpen size={20} />
            </div>
            <div>
              <h3>Trucos Mnemotécnicos para Memorizar las Cuerdas</h3>
              <p>Frases y reglas mnemotécnicas para nunca olvidar el orden</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-content">
          {/* Tarjeta 1: De 6ª a 1ª */}
          <div className="mnemonic-section-card">
            <div className="section-direction-tag">
              <span className="dir-icon">⬇️</span> De la 6ª cuerda a la 1ª cuerda (De la más Gruesa a la más Fina / E-A-D-G-B-E)
            </div>

            <div className="phrases-grid">
              <div className="phrase-box">
                <div className="phrase-lang">🇺🇸 En Inglés (Cifrado E-A-D-G-B-E)</div>
                <div className="phrase-quote">"Eddie Ate Dynamite, Good Bye Eddie"</div>
                <div className="phrase-breakdown">
                  <span className="word-chip"><strong>E</strong>ddie (6ª)</span>
                  <span className="word-chip"><strong>A</strong>te (5ª)</span>
                  <span className="word-chip"><strong>D</strong>ynamite (4ª)</span>
                  <span className="word-chip"><strong>G</strong>ood (3ª)</span>
                  <span className="word-chip"><strong>B</strong>ye (2ª)</span>
                  <span className="word-chip"><strong>E</strong>ddie (1ª)</span>
                </div>
              </div>

              <div className="phrase-box highlight-es">
                <div className="phrase-lang">🇪🇸 En Español (Cifrado E-A-D-G-B-E)</div>
                <div className="phrase-quote">"En Aquel Día Gris Brilló El sol"</div>
                <div className="phrase-breakdown">
                  <span className="word-chip"><strong>E</strong>n (6ª)</span>
                  <span className="word-chip"><strong>A</strong>quel (5ª)</span>
                  <span className="word-chip"><strong>D</strong>ía (4ª)</span>
                  <span className="word-chip"><strong>G</strong>ris (3ª)</span>
                  <span className="word-chip"><strong>B</strong>rilló (2ª)</span>
                  <span className="word-chip"><strong>E</strong>l sol (1ª)</span>
                </div>
              </div>

              <div className="phrase-box solfege-es">
                <div className="phrase-lang">🎼 En Solfeo Latino (Mi - La - Re - Sol - Si - Mi)</div>
                <div className="phrase-quote">"Mi Lindo Raspado Sabe Siempre Mejor"</div>
                <div className="phrase-breakdown">
                  <span className="word-chip"><strong>Mi</strong> (6ª)</span>
                  <span className="word-chip"><strong>La</strong> (5ª)</span>
                  <span className="word-chip"><strong>Re</strong> (4ª)</span>
                  <span className="word-chip"><strong>Sol</strong> (3ª)</span>
                  <span className="word-chip"><strong>Si</strong> (2ª)</span>
                  <span className="word-chip"><strong>Mi</strong> (1ª)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: De 1ª a 6ª */}
          <div className="mnemonic-section-card">
            <div className="section-direction-tag">
              <span className="dir-icon">⬆️</span> De la 1ª cuerda a la 6ª cuerda (De la más Fina a la más Gruesa / E-B-G-D-A-E)
            </div>

            <div className="phrases-grid">
              <div className="phrase-box">
                <div className="phrase-lang">🇺🇸 En Inglés (Cifrado E-B-G-D-A-E)</div>
                <div className="phrase-quote">"Every Boy Gets Dessert At Easter"</div>
                <div className="phrase-breakdown">
                  <span className="word-chip"><strong>E</strong>very (1ª)</span>
                  <span className="word-chip"><strong>B</strong>oy (2ª)</span>
                  <span className="word-chip"><strong>G</strong>ets (3ª)</span>
                  <span className="word-chip"><strong>D</strong>essert (4ª)</span>
                  <span className="word-chip"><strong>A</strong>t (5ª)</span>
                  <span className="word-chip"><strong>E</strong>aster (6ª)</span>
                </div>
              </div>

              <div className="phrase-box highlight-es">
                <div className="phrase-lang">🇪🇸 En Español (Cifrado E-B-G-D-A-E)</div>
                <div className="phrase-quote">"El Barco Grande De Aquel Emigrante"</div>
                <div className="phrase-breakdown">
                  <span className="word-chip"><strong>E</strong>l (1ª)</span>
                  <span className="word-chip"><strong>B</strong>arco (2ª)</span>
                  <span className="word-chip"><strong>G</strong>rande (3ª)</span>
                  <span className="word-chip"><strong>D</strong>e (4ª)</span>
                  <span className="word-chip"><strong>A</strong>quel (5ª)</span>
                  <span className="word-chip"><strong>E</strong>migrante (6ª)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consejos clave */}
          <div className="mnemonic-tips-card">
            <h4>
              <Lightbulb size={18} className="tip-icon" /> Consejos Clave para Recordar:
            </h4>
            <ul>
              <li>
                <strong>Los extremos son siempre Mi (E):</strong> La 6ª (más gruesa) y la 1ª (más fina) tienen la misma nota, separadas por 2 octavas.
              </li>
              <li>
                <strong>Cuerdas 6, 5 y 4 (Bajos):</strong> Son entorchadas y gruesas, dan el sonido grave y rítmico.
              </li>
              <li>
                <strong>Cuerdas 3, 2 y 1 (Agudos):</strong> Son lisas y brillantes, ideales para melodías y solos.
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-ok-btn" onClick={onClose}>
            ¡Entendido, a practicar!
          </button>
        </div>
      </div>
    </div>
  );
}
