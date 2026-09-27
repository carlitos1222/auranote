import { NextResponse } from 'next/server';
import { getModel, withRetry } from '@/lib/gemini';

const PROMPT = (content) => `Eres un experto en técnicas de estudio. A partir del siguiente contenido de apuntes universitarios, genera un RESUMEN EJECUTIVO perfecto para repasar antes de un examen.

Contenido:
"""${content}"""

El resumen debe incluir:
1. Los 5 conceptos más importantes (en orden de importancia)
2. Las definiciones clave (máximo 8)
3. Fórmulas o datos críticos (si aplica)
4. 3 puntos que probablemente vengan en el examen

Formato: Usa Markdown con encabezados claros. Sé conciso pero completo.`;

export async function POST(request) {
  try {
    const { content } = await request.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 });
    }
    const model = getModel();
    const result = await withRetry(() => model.generateContent(PROMPT(content.substring(0, 8000))));
    const response = await result.response;
    const summary = response.text();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Error al generar el resumen.' }, { status: 500 });
  }
}
