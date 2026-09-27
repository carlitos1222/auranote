import { NextResponse } from 'next/server';
import { getModel, withRetry } from '@/lib/gemini';

const PROMPT = (content) => `Eres un profesor universitario experto. A partir del siguiente contenido de apuntes, genera EXACTAMENTE 8 preguntas de opción múltiple para evaluar la comprensión del estudiante.

Contenido:
"""${content}"""

Responde SOLO con un JSON array válido, sin texto adicional, sin markdown, sin backticks. Cada pregunta debe tener: "pregunta", "opciones" (array de 4 strings), "correcta" (índice 0-3 de la respuesta correcta), "explicacion":
[{"pregunta":"...","opciones":["A","B","C","D"],"correcta":0,"explicacion":"..."}]

Las preguntas deben cubrir los conceptos más importantes del contenido.`;

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
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(text);
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Error al generar el quiz. Inténtalo de nuevo.' }, { status: 500 });
  }
}
