const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';

interface OllamaQueryResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context: number[];
    total_duration: number;
    load_duration: number;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    eval_count: number;
    eval_duration: number;
    
}

export default async function(prompt: string, query: string): Promise<OllamaQueryResponse> {
    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "llama3.2",
                "prompt": prompt + query,
                "stream": false
            })
        });

        if (!response.ok) {
            throw new Error(`Error querying Ollama API: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        
        console.error('Error querying Ollama API:', error);
        throw error;
    }
}