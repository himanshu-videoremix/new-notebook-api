import { NextRequest, NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkStatusWithPolling(requestId) {
  const startTime = Date.now();
  while (true) {
    try {
      const response = await fetch(`${API_URL}/Content/Status/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log("Polling Status:", data);
      
      // If status is complete, return the data
      if (data.status === 100) {
        console.log("✅ Request is complete:", data);
        return data;
      }
      
      // Check if more than 3 minutes have elapsed
      if (Date.now() - startTime > 600000) {
        console.log("⏳ Request pending for more than 3 minutes.");
        return {
          status: data.status,
          message: "Your request has been pending for over 10 minutes. Please check back later."
        };
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
    await delay(5000); // Wait for 5 seconds before next check
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);
    console.log(API_KEY, "key");

    const outputType = body.outputType === 'deep_dive' ? 'audio' : 'text';

    const requestBody = {
      text: body.text,
      outputType,
      resources: body.resources || [],
      includeCitations: outputType !== 'audio',
    };

    if (outputType !== 'audio' && body.customization) {
      requestBody.customization = body.customization;
    }

    const response = await fetch(`${API_URL}/Content/Create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    let data = await response.json();
    console.log("API Response Data:", data);
    
    if (!data.request_id) {
      return NextResponse.json({ errorMessage: "No request ID received." }, { status: 400 });
    }

    // Poll for the status until complete or 3 minutes have elapsed
    const finalResult = await checkStatusWithPolling(data.request_id);

    return NextResponse.json({
      status: "success",
      initialResponse: data,
      finalResult
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
