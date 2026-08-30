import { useState, useCallback } from 'react';
import { Zap, Volume2, Trophy, Flame, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { GUITAR_STRINGS } from '../data/guitarStrings';
import { soundEngine } from '../utils/audioEngine';
import confetti from 'canvas-confetti';

function createQuestion(notation, playSound = false) {
  const questionTypes = ['by-number', 'by-note', 'by-sound', 'by-gauge'];
  const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  const targetString = GUITAR_STRINGS[Math.floor(Math.random() * GUITAR_STRINGS.length)];

  const noteText = notation === 'ES' ? targetString.solfege : targetString.note;
  let prompt;

  if (randomType === 'by-number') {
    prompt = `¿Qué nota corresponde a la ${targetString.number}ª cuerda de la guitarra?`;
  } else if (randomType === 'by-note') {
    prompt = `¿En qué número de cuerda se encuentra la nota "${noteText}" (${targetString.fullName})?`;
  } else if (randomType === 'by-sound') {
    prompt = `Escucha con atención: ¿A qué cuerda pertenece este sonido afinado?`;
    if (playSound) {
      setTimeout(() => {
        soundEngine.playString(targetString.frequency, targetString.noteKey);
      }, 300);
    }
  } else {
    prompt = targetString.number === 6
      ? '¿Cuál es la cuerda más gruesa y grave de la guitarra?'
      : targetString.number === 1
      ? '¿Cuál es la cuerda más fina y aguda de la guitarra?'
      : `¿Cuál es el calibre (${targetString.gauge}) y frecuencia (${targetString.frequency} Hz) de esta cuerda?`;
  }

  const options = [...GUITAR_STRINGS].sort(() => Math.random() - 0.5);

  return {
    type: randomType,
    prompt,
    targetString,
    correctAnswerId: targetString.id,
    options
  };
}

export default function QuizMode({ notation, score, setScore, streak, setStreak }) {
  const [currentQuestion, setCurrentQuestion] = useState(() => createQuestion(notation, true));
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Generar nueva pregunta
  const generateQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setIsCorrect(false);
    setCurrentQuestion(createQuestion(notation, true));
  }, [notation]);

  const handleSelectOption = (stringOption) => {
    if (isAnswered) return;

    setSelectedOption(stringOption.id);
    setIsAnswered(true);

    const correct = stringOption.id === currentQuestion.correctAnswerId;
    setIsCorrect(correct);

    // Reproducir la cuerda elegida para comparación auditiva
    soundEngine.playString(stringOption.frequency, stringOption.noteKey);

    if (correct) {
      soundEngine.playSuccessChime();
      const newScore = score + 10 + streak * 2;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      if (newStreak % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } else {
      soundEngine.playErrorBuzz();
      setStreak(0);
    }

    setQuestionsAnswered((prev) => prev + 1);
  };

  const handleReplayTargetSound = () => {
    if (currentQuestion?.targetString) {
      soundEngine.playString(currentQuestion.targetString.frequency, currentQuestion.targetString.noteKey);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="quiz-mode-container">
      {/* Marcador de puntuación */}
      <div className="quiz-scoreboard">
        <div className="score-stat">
          <Trophy size={18} className="score-icon" />
          <span className="stat-label">Puntos:</span>
          <span className="stat-value">{score}</span>
        </div>

        <div className="score-stat streak-stat">
          <Flame size={18} className="streak-icon" />
          <span className="stat-label">Racha:</span>
          <span className="stat-value">{streak} 🔥</span>
        </div>

        <div className="score-stat">
          <span className="stat-label">Mejor Racha:</span>
          <span className="stat-value">{bestStreak}</span>
        </div>

        <div className="score-stat">
          <span className="stat-label">Respondidas:</span>
          <span className="stat-value">{questionsAnswered}</span>
        </div>
      </div>

      {/* Tarjeta de la Pregunta */}
      <div className="quiz-question-card">
        <div className="question-header">
          <span className="question-type-badge">
            <Zap size={14} />
            {currentQuestion.type === 'by-sound'
              ? 'Desafío de Oído'
              : currentQuestion.type === 'by-gauge'
              ? 'Anatomía de la Cuerda'
              : 'Identificación Rápida'}
          </span>

          {currentQuestion.type === 'by-sound' && (
            <button
              type="button"
              className="sound-replay-btn"
              onClick={handleReplayTargetSound}
              title="Volver a escuchar el sonido objetivo"
            >
              <Volume2 size={18} />
              Volver a escuchar tono
            </button>
          )}
        </div>

        <h3 className="question-prompt">{currentQuestion.prompt}</h3>

        {/* Opciones de respuesta */}
        <div className="quiz-options-grid">
          {currentQuestion.options.map((opt) => {
            const noteText = notation === 'ES' ? opt.solfege : opt.note;
            const isChosen = selectedOption === opt.id;
            const isTarget = opt.id === currentQuestion.correctAnswerId;

            let btnClass = 'quiz-option-btn';
            if (isAnswered) {
              if (isTarget) btnClass += ' correct-answer';
              else if (isChosen && !isTarget) btnClass += ' incorrect-answer';
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={btnClass}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
              >
                <div className="option-string-num">{opt.number}ª</div>
                <div className="option-string-note">{noteText}</div>
                <div className="option-string-sub">
                  {opt.fullName} • {opt.frequency} Hz
                </div>
                {isAnswered && isTarget && (
                  <CheckCircle size={18} className="result-icon success" />
                )}
                {isAnswered && isChosen && !isTarget && (
                  <XCircle size={18} className="result-icon error" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback y Siguiente Pregunta */}
        {isAnswered && (
          <div className={`quiz-feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
            <div className="feedback-message">
              {isCorrect ? (
                <>
                  <CheckCircle size={24} className="feedback-icon" />
                  <div>
                    <strong>¡Correcto! (+{10 + streak * 2} pts)</strong>
                    <p>
                      La {currentQuestion.targetString.number}ª cuerda es{' '}
                      {currentQuestion.targetString.fullName} ({currentQuestion.targetString.frequency} Hz).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={24} className="feedback-icon" />
                  <div>
                    <strong>¡Ups, no era esa!</strong>
                    <p>
                      La respuesta correcta era la {currentQuestion.targetString.number}ª cuerda (
                      {currentQuestion.targetString.fullName} - {currentQuestion.targetString.frequency} Hz).
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              className="next-question-btn"
              onClick={generateQuestion}
            >
              Siguiente Desafío <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
