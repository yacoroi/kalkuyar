import { NextRequest, NextResponse } from 'next/server';

interface PushMessage {
    to: string;
    title: string;
    body: string;
    sound?: 'default' | null;
    data?: Record<string, any>;
}

export async function POST(request: NextRequest) {
    try {
        const { tokens, title, body, data } = await request.json();

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
        }

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        // Prepare messages for Expo Push API
        const messages: PushMessage[] = tokens.map((token: string) => ({
            to: token,
            title,
            body,
            sound: 'default',
            data: data || {},
        }));

        // Send to Expo Push API in chunks of 100
        const CHUNK_SIZE = 100;
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
            const chunk = messages.slice(i, i + CHUNK_SIZE);

            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });

            if (!response.ok) {
                console.error('Expo Push API error:', await response.text());
                failedCount += chunk.length;
                continue;
            }

            const result = await response.json();

            // Count successes and failures
            if (result.data) {
                for (const ticket of result.data) {
                    if (ticket.status === 'ok') {
                        successCount++;
                    } else {
                        failedCount++;
                        console.error('Push failed:', ticket.message);
                    }
                }
            }
        }

        return NextResponse.json({
            success: successCount,
            failed: failedCount,
            total: tokens.length,
        });

    } catch (error) {
        console.error('Push notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
