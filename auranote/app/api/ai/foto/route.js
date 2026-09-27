import { NextResponse } from 'next/server';
import { getVisionModel, PROMPTS, withRetry } from '@/lib/gemini';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { error: 'La imagen es requerida' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const model = getVisionModel();
    
    const result = await withRetry(() => model.generateContent([
      PROMPTS.photoToNotes,
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
      type: 'foto',
      fileName: file.name
    });
  } catch (error) {
    console.error('Error generating notes from photo:', error);
    const userMessage = error.message?.includes('503')
      ? 'El servicio de IA está temporalmente ocupado. Inténtalo en unos segundos.'
      : 'Error al procesar la imagen. Inténtalo de nuevo.';
    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}
