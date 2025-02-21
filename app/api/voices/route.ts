import { NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';

export async function GET() {
    try {
        const response = await fetch(`${API_URL}/Content/GetVoices`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'SmartNotebook/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Voice API error: ${response.status}`);
        }

        const voices = await response.json();
        return NextResponse.json(voices);

    } catch (error) {
        console.error('Error fetching voices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch voices' },
            { status: 500 }
        );
    }
}