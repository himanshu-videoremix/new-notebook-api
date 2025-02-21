import { NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const name = formData.get('name');

    if (!audioFile || !name) {
      return NextResponse.json(
        { error: 'Missing audio file or name' },
        { status: 400 }
      );
    }

    // Save the audio file locally and get a public URL
    const audioUrl = await saveFileLocally(audioFile);
    console.log(audioUrl,"audioUrlaudioUrl")
    // Prepare the payload for the voice cloning API
    const payload = {
      audioUrl, // URL of the uploaded audio file
      name,
    };

    // Call the external API
    const response = await fetch(`${API_URL}/Content/CloneVoice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Voice cloning failed: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.log(error,"errorerrorerrorerror")
    console.error('Voice cloning error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Failed to clone voice' },
      { status: 500 }
    );
  }
}

async function saveFileLocally(file: FormDataEntryValue): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error('Invalid file');
  }

  // Define the local path to the media folder within the public directory.
  const publicPath = path.join(process.cwd(), 'public', 'media');
  await fs.mkdir(publicPath, { recursive: true });

  // Create a unique file name (you might want to sanitize the original file name)
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(publicPath, fileName);

  // Convert the file to a Buffer and write it to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Construct the public URL.
  // IMPORTANT: Ensure that your domain (or localhost during development) is accessible to the external API.
  return `http://167.71.188.184:1340/media/${fileName}`;
}
