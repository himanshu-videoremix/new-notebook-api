import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/constants';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
export async function GET() {
  try {
    console.log("call",API_URL,API_KEY)
    const response = await fetch(`${API_URL}/sources`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    console.log(response,"resssssssssssssssssssssssssssssssss")
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: errorText || 'Failed to fetch sources' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
