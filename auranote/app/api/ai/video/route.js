import { NextResponse } from 'next/server';
import { getModel, PROMPTS, withRetry } from '@/lib/gemini';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video');
    
    if (!file) {
      return NextResponse.json(
        { error: 'El archivo de video es requerido' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'video/mp4';

    const model = getModel();
    
    const result = await withRetry(() => model.generateContent([
      PROMPTS.videoToNotes,
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
      type: 'video',
      fileName: file.name
    });
  } catch (error) {
    console.error('Error generating notes from video:', error);
    const userMessage = error.message?.includes('503')
      ? 'El servicio de IA está temporalmente ocupado. Inténtalo en unos segundos.'
      : 'Error al procesar el video. Verifica que el archivo no sea muy grande (máx ~20MB).';
    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}
