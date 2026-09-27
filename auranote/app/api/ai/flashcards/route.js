import { NextResponse } from 'next/server';
import { getModel, withRetry } from '@/lib/gemini';

const PROMPT = (content) => `Eres un experto en técnicas de estudio. A partir del siguiente contenido de apuntes universitarios, genera EXACTAMENTE 10 flashcards (tarjetas de estudio) para memorizar los conceptos clave.

Contenido:
"""${content}"""

Responde SOLO con un JSON array válido, sin texto adicional, sin markdown, sin backticks. Cada flashcard debe tener "pregunta" y "respuesta":
[{"pregunta":"...","respuesta":"..."},{"pregunta":"...","respuesta":"..."}]

Las preguntas deben ser claras y específicas. Las respuestas deben ser concisas pero completas.`;

export async function POST(request) {
  try {
    const { content } = await request.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 });
    }
    const model = getModel();
    const result = await withRetry(() => model.generateContent(PROMPT(content.substring(0, 8000))));
    const response = await result.response;
    let text = response.text().trim();
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const flashcards = JSON.parse(text);
    return NextResponse.json({ success: true, flashcards });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Error al generar flashcards. Inténtalo de nuevo.' }, { status: 500 });
  }
}
