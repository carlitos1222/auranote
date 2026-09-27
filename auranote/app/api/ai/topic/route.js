import { NextResponse } from 'next/server';
import { getModel, PROMPTS, withRetry } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { topic } = await request.json();
    
    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'El tema es requerido' },
        { status: 400 }
      );
    }

    const model = getModel();
    const prompt = PROMPTS.topicToNotes(topic.trim());
    
    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    const notes = response.text();

    return NextResponse.json({ 
      success: true, 
      notes,
      topic: topic.trim(),
      type: 'topic'
    });
  } catch (error) {
    console.error('Error generating notes from topic:', error);
    const userMessage = error.message?.includes('503') 
      ? 'El servicio de IA está temporalmente ocupado. Inténtalo en unos segundos.'
      : 'Error al generar los apuntes. Inténtalo de nuevo.';
    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}
