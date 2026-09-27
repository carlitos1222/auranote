import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getModel(modelName = 'gemini-3.6-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

export function getVisionModel() {
  return genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
}

// Retry wrapper for Gemini API calls (handles 503 errors)
export async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = error.message?.includes('503') || 
                           error.message?.includes('Service Unavailable') ||
                           error.message?.includes('high demand');
      if (isRetryable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`Reintentando en ${delay/1000}s... (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}


export const PROMPTS = {
  photoToNotes: `Eres un asistente experto en crear apuntes universitarios. Analiza esta imagen que fue tomada durante una clase universitaria (puede ser una pizarra, diapositiva, cuaderno, etc.).

Genera apuntes COMPLETOS, ORGANIZADOS y CLAROS en español basándote en el contenido de la imagen.

Formato de salida (usa Markdown):
# [Título del tema principal]

## Conceptos Clave
- Lista de conceptos importantes

## Desarrollo del Tema
[Explicación detallada y organizada del contenido]

## Fórmulas / Datos Importantes
[Si aplica, incluir fórmulas, fechas, datos relevantes]

## Resumen
[Resumen conciso de 2-3 oraciones]

## Puntos para Repasar
- Lista de puntos clave para estudiar

IMPORTANTE: Si la imagen no es clara, haz tu mejor esfuerzo para interpretar el contenido. Siempre genera apuntes útiles y bien estructurados.`,

  topicToNotes: (topic) => `Eres un profesor universitario experto. Genera apuntes COMPLETOS, DETALLADOS y BIEN ORGANIZADOS sobre el siguiente tema:

"${topic}"

Los apuntes deben ser de nivel universitario, claros y fáciles de entender. Incluye ejemplos cuando sea posible.

Formato de salida (usa Markdown):
# ${topic}

## Introducción
[Breve introducción al tema]

## Conceptos Fundamentales
[Definiciones y conceptos clave con explicaciones claras]

## Desarrollo del Tema
[Explicación detallada con subtemas organizados]

## Ejemplos
[Ejemplos prácticos que ilustren los conceptos]

## Fórmulas / Datos Importantes
[Si aplica]

## Resumen
[Resumen conciso]

## Preguntas de Repaso
1. [Pregunta para verificar comprensión]
2. [Pregunta para verificar comprensión]
3. [Pregunta para verificar comprensión]

IMPORTANTE: Genera contenido educativo de ALTA CALIDAD. Los apuntes deben ser lo suficientemente completos para estudiar para un examen.`,

  audioToNotes: `Eres un asistente experto en crear apuntes universitarios. Escucha y analiza este audio que fue grabado durante una clase universitaria.

Genera apuntes COMPLETOS, ORGANIZADOS y CLAROS en español basándote en el contenido del audio.

Formato de salida (usa Markdown):
# [Título del tema principal identificado]

## Transcripción Resumida
[Resumen de lo que se dijo en el audio, organizado por temas]

## Conceptos Clave
- Lista de conceptos importantes mencionados

## Desarrollo del Tema
[Explicación organizada del contenido de la clase]

## Datos Importantes
[Fechas, fórmulas, nombres, datos relevantes mencionados]

## Resumen
[Resumen conciso de la clase]

## Puntos para Repasar
- Lista de puntos clave para estudiar`,

  videoToNotes: `Eres un asistente experto en crear apuntes universitarios. Analiza este video que fue grabado durante una clase universitaria o es un video educativo.

Genera apuntes COMPLETOS, ORGANIZADOS y CLAROS en español basándote en el contenido visual y auditivo del video.

Formato de salida (usa Markdown):
# [Título del tema principal]

## Resumen del Video
[Resumen general del contenido del video]

## Conceptos Clave
- Lista de conceptos importantes presentados

## Desarrollo del Tema
[Explicación detallada y organizada del contenido]

## Elementos Visuales Importantes
[Diagramas, gráficos, fórmulas que aparecieron en el video]

## Datos Importantes
[Fechas, fórmulas, datos relevantes]

## Resumen
[Resumen conciso]

## Puntos para Repasar
- Lista de puntos clave para estudiar`
};
