import React from 'react';

const FINGER_COLORS = {
  1: '#38bdf8', // 1: Índice (Cyan brillante)
  2: '#4ade80', // 2: Medio (Verde esmeralda)
  3: '#facc15', // 3: Anular (Amarillo oro)
  4: '#c084fc'  // 4: Meñique (Púrpura)
};

export default function ChordDiagram({ chord, size = 'large', activeStringIdx = null, onStringClick = null }) {
  const isLarge = size === 'large';
  const width = isLarge ? 280 : 160;
  const height = isLarge ? 320 : 185;

  const padX = isLarge ? 38 : 22;
  const topY = isLarge ? 48 : 28;
  const gridW = width - padX * 2;
  const gridH = height - topY - (isLarge ? 42 : 25);

  const numFrets = 4;
  const numStrings = 6;
  const stringSpacing = gridW / (numStrings - 1);
  const fretSpacing = gridH / numFrets;

  const stringLabels = ['6ª', '5ª', '4ª', '3ª', '2ª', '1ª'];

  return (
    <div className={`chord-diagram-wrapper ${size}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="chord-svg"
      >
        {/* Cejuela superior (Nut) */}
        <rect
          x={padX - 2}
          y={topY - (isLarge ? 6 : 4)}
          width={gridW + 4}
          height={isLarge ? 8 : 5}
          fill="#d1d5db"
          rx="2"
        />

        {/* Trastes horizontales */}
        {Array.from({ length: numFrets + 1 }).map((_, fIdx) => {
          const y = topY + fIdx * fretSpacing;
          return (
            <line
              key={`fret-${fIdx}`}
              x1={padX}
              y1={y}
              x2={padX + gridW}
              y2={y}
              stroke="#64748b"
              strokeWidth={fIdx === 0 ? (isLarge ? 4 : 2.5) : (isLarge ? 2 : 1.2)}
            />
          );
        })}

        {/* Cuerdas verticales */}
        {Array.from({ length: numStrings }).map((_, sIdx) => {
          const x = padX + sIdx * stringSpacing;
          const isWound = sIdx < 3;
          const isActive = activeStringIdx === sIdx;
          const strokeW = isWound
            ? (isLarge ? 3.5 - sIdx * 0.5 : 2.2 - sIdx * 0.3)
            : (isLarge ? 1.8 - (sIdx - 3) * 0.3 : 1.2);

          return (
            <g key={`string-${sIdx}`} onClick={() => onStringClick && onStringClick(sIdx)} style={{ cursor: onStringClick ? 'pointer' : 'default' }}>
              <line
                x1={x}
                y1={topY}
                x2={x}
                y2={topY + gridH}
                stroke={isActive ? '#38bdf8' : (isWound ? '#c5a059' : '#cbd5e1')}
                strokeWidth={isActive ? strokeW * 2.2 : strokeW}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px #38bdf8)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            </g>
          );
        })}

        {/* Marcadores de cejuela (O / X) */}
        {chord.frets.map((fret, sIdx) => {
          const x = padX + sIdx * stringSpacing;
          const y = topY - (isLarge ? 16 : 10);
          const isActive = activeStringIdx === sIdx;

          if (fret === -1) {
            // Cuerda silenciada (X)
            return (
              <text
                key={`mute-${sIdx}`}
                x={x}
                y={y + (isLarge ? 4 : 2)}
                fill="#f43f5e"
                fontSize={isLarge ? 15 : 10}
                fontWeight="800"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Cuerda al aire (O)
            return (
              <circle
                key={`open-${sIdx}`}
                cx={x}
                cy={y}
                r={isLarge ? 6 : 4}
                fill={isActive ? '#38bdf8' : 'none'}
                stroke={isActive ? '#38bdf8' : '#34d399'}
                strokeWidth={isLarge ? 2.5 : 1.8}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px #38bdf8)' : 'none'
                }}
              />
            );
          }

          return null;
        })}

        {/* Puntos pisados con número de dedo */}
        {chord.frets.map((fret, sIdx) => {
          if (fret <= 0) return null;

          const finger = chord.fingers[sIdx];
          const x = padX + sIdx * stringSpacing;
          const y = topY + (fret - 0.5) * fretSpacing;
          const dotRadius = isLarge ? 14 : 8.5;
          const fingerColor = FINGER_COLORS[finger] || '#3b82f6';
          const isActive = activeStringIdx === sIdx;

          return (
            <g key={`dot-${sIdx}`} onClick={() => onStringClick && onStringClick(sIdx)} style={{ cursor: onStringClick ? 'pointer' : 'default' }}>
              {/* Brillo exterior si está activo */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={dotRadius + 5}
                  fill={fingerColor}
                  opacity="0.4"
                  className="pulsing-dot"
                />
              )}

              {/* Punto principal */}
              <circle
                cx={x}
                cy={y}
                r={dotRadius}
                fill={fingerColor}
                stroke="#0f172a"
                strokeWidth={isLarge ? 2.5 : 1.5}
                style={{
                  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))'
                }}
              />

              {/* Número de dedo */}
              {finger > 0 && (
                <text
                  x={x}
                  y={y + (isLarge ? 4.5 : 3.2)}
                  fill="#090a0f"
                  fontSize={isLarge ? 13 : 8.5}
                  fontWeight="900"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}

        {/* Etiquetas de número de cuerda en la parte inferior */}
        {isLarge &&
          stringLabels.map((lbl, sIdx) => {
            const x = padX + sIdx * stringSpacing;
            const y = topY + gridH + 20;
            return (
              <text
                key={`lbl-${sIdx}`}
                x={x}
                y={y}
                fill="#64748b"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {lbl}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
