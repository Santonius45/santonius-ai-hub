import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Skema JSON yang diwajibkan dari Gemini
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Deskripsi ringkas mengenai isi gambar secara keseluruhan.',
    },
    detected_objects: {
      type: Type.ARRAY,
      description: 'Daftar objek yang terdeteksi di dalam gambar beserta koordinat bounding box-nya.',
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: 'Nama/kategori objek' },
          confidence: { type: Type.NUMBER, description: 'Tingkat keyakinan (0.0 - 1.0)' },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: 'Koordinat bounding box berformat [ymin, xmin, ymax, xmax] dengan rentang nilai 0-1000',
          },
        },
        required: ['label', 'confidence', 'box_2d'],
      },
    },
  },
  required: ['summary', 'detected_objects'],
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Cek Autentikasi User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, imagePath } = await req.json();
    if (!imageUrl || !imagePath) {
      return NextResponse.json({ error: 'Image URL and Path are required' }, { status: 400 });
    }

    // 2. Fetch gambar dari Supabase Storage sebagai Buffer
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

  // 3. Panggil Gemini dengan Structured JSON Output
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // <-- Gunakan versi model terbaru ini
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: 'Lakukan analisis computer vision pada gambar ini. Deteksi objek-objek penting, berikan label, confidence score, dan koordinat box_2d berformat [ymin, xmin, ymax, xmax] (skala 0 - 1000). Berikan juga deskripsi singkat (summary) mengenai gambar.',
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gagal mendapatkan respons dari AI');
    }

    const parsedResult = JSON.parse(resultText);

    // 4. Simpan hasil analisis ke Supabase Database
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('vision_analyses')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        image_path: imagePath,
        summary: parsedResult.summary,
        detected_objects: parsedResult.detected_objects,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Gagal menyimpan hasil ke database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: savedAnalysis,
    });

  } catch (error: any) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}