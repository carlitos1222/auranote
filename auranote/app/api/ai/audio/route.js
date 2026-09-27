import { NextResponse } from 'next/server';
import { getModel, PROMPTS, withRetry } from '@/lib/gemini';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio');
    
    if (!file) {
      return NextResponse.json(
        { error: 'El archivo de audio es requerido' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'audio/mpeg';

    const model = getModel();
    
    const result = await withRetry(() => model.generateContent([
      PROMPTS.audioToNotes,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
    ]));

    const response = await result.response;
    const notes = response.text();

    return NextResponse.json({ 
      success: true, 
      notes,
      type: 'audio',
      fileName: file.name
    });
  } catch (error) {
    console.error('Error generating notes from audio:', error);
    const userMessage = error.message?.includes('503')
      ? 'El servicio de IA está temporalmente ocupado. Inténtalo en unos segundos.'
      : 'Error al procesar el audio. Inténtalo de nuevo.';
    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}
