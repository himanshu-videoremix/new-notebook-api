import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/constants";

  const API_KEY ='dfe22057-4937-464d-8d75-9c04f081acd4';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) 
{
  const { id } = params;
  const API_URL = `https://api.autocontentapi.com/content/status/${id}`;
  try {
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
    console.error("Error fetching sources:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
