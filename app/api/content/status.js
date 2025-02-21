import { NextResponse } from 'next/server';

export async function GET() {
    const { id } = params;
  const API_URL = `https://api.autocontentapi.com/content/status/38fdb402-5409-4fcd-b7a4-6971918e9323`;
  const API_KEY ='dfe22057-4937-464d-8d75-9c04f081acd4';

  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  try {
    console.log("Call status")
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
