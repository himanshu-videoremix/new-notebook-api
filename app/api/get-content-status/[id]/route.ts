import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/constants';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
export async function GET(request: Request) {
  try {
    console.log("call get API")
     // Extract the content request ID from the query parameters or URL
     const { searchParams } = new URL(request.url);
     const contentRequestId = searchParams.get('id'); // Assuming 'id' is the query parameter for the content request ID
 
     if (!contentRequestId) {
       return NextResponse.json(
         { message: 'Content Request ID is required' },
         { status: 400 }
       );
     }
 
    const response = await fetch(`${API_URL}/content/status/${contentRequestId}`, {
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
