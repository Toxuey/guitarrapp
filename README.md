# 🎸 Guitarrapp - Aprende a Identificar las Cuerdas y los 12 Acordes de la Guitarra

Aplicación web interactiva para estudiantes y entusiastas de la guitarra. Incluye simulador de mástil realista con física de vibración, sonido de audio real grabado en estudio (muestras de guitarra acústica y clásica), ejercicios de arrastrar y soltar, entrenador de cambio de acordes y retos rápidos.

---

## ✨ Características Principales

1. **🎯 Práctica de Cuerdas (Drag & Drop)**:
   - Identifica las 6 cuerdas (`E`, `A`, `D`, `G`, `B`, `E` / `Mi`, `La`, `Re`, `Sol`, `Si`, `Mi`) arrastrando o seleccionando fichas interactivas.
   - Validación instantánea con feedback sonoro y animaciones de acierto/error.
   - Lluvia de confeti y arpegio completo al resolver las 6 cuerdas.

2. **🎼 Los 12 Acordes Esenciales de Guitarra**:
   - **Mayores:** C (Do), A (La), G (Sol), E (Mi), D (Re), F (Fa).
   - **Menores:** Am (La menor), Em (Mi menor), Dm (Re menor).
   - **Séptimas:** E7 (Mi 7), A7 (La 7), D7 (Re 7).
   - Diagramas SVG con numeración y código de colores por dedo (1: Índice, 2: Medio, 3: Anular, 4: Meñique).
   - Botones de **Rasgueo Completo** y **Arpegio cuerda por cuerda** para auditar notas limpias.

3. **⚡ Entrenador de Cambio de Acordes (Transition Trainer)**:
   - Metrónomo visual y sonoro ajustable (40 a 90 BPM) para practicar fluidez entre pares de acordes con alerta de cambio en el tiempo 4.

4. **🎧 Sonido Real Grabado en Estudio**:
   - Selector de timbre entre **🎸 Acústica Real (Cuerdas de Acero)** y **🎻 Clásica Nylon (Guitarra Española)**.
   - Motor de respaldo con síntesis física Karplus-Strong para funcionamiento 100% offline.

5. **⚡ Desafío Rápido (Quiz)** & **🎸 Explorador Libre**:
   - Retos de oído y anatomía con marcador de puntos y racha de aciertos.
   - Explorador de frecuencias en Hz, calibres y botón de rasgueo al aire.

6. **📖 Trucos Mnemotécnicos**:
   - Frases en inglés y español para recordar fácilmente el orden de cuerdas de 6ª a 1ª y de 1ª a 6ª.

---

## 🚀 Tecnologías

- **React 19**
- **Vite 8**
- **Web Audio API** (Studio Samples & Karplus-Strong Synthesis)
- **Lucide Icons**
- **Canvas Confetti**

---

## 🛠️ Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Toxuey/guitarrapp.git

# 2. Entrar al directorio
cd guitarrapp

# 3. Instalar dependencias con pnpm
pnpm install

# 4. Iniciar servidor de desarrollo
pnpm dev

# 5. Compilar para producción
pnpm build
```

---

## 📦 Despliegue en GitHub Pages

El proyecto incluye un flujo de trabajo de GitHub Actions (`.github/workflows/deploy.yml`) que compila y despliega automáticamente la aplicación al hacer `push` a la rama `main`.
