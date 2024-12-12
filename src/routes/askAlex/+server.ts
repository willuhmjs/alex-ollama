import askOllama from '$lib/server/askOllama';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { question } = await request.json();

        if (!question) {
            return {
                status: 400,
                body: { error: 'Question is required' }
            };
        }

        // confirm user is trying to talk to alex by asking if the question is for alex
        const words = question.toLowerCase().split(' ');
        const isForAlex = words.slice(0, 3).some(word => word.includes('alex'));
        console.log(`DEBUG: isForAlex: ${isForAlex}; QUESTION: ${question}`);
        if (!isForAlex) {
           return new Response(JSON.stringify({ response: false }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        }
        // Process the question here               
        const response = (await askOllama("You are a voice assistant named Alex. Be conversation and respond with as few words as you can while also being completely pronounceable by text to speech.. Query: ", question)).response;

        return new Response(JSON.stringify({ response }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};