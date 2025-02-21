import { NextResponse } from 'next/server';
import axios from 'axios';

const BEARER_TOKEN = 'dfe22057-4937-464d-8d75-9c04f081acd4';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    try {
        const response = await axios.get(
            `https://api.autocontentapi.com/Content/Status/${requestId}`,
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching status:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
