<script lang="ts">
    import { onMount } from "svelte";
    let history = "";
    let recognition;
    let isSpeaking = false;

    function initializeRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.onstart = handleRecognitionStart;
        recognition.onresult = handleRecognitionResult;
        recognition.onend = handleRecognitionEnd;

        recognition.start();
    }

    function handleRecognitionStart() {
        console.log("We are listening. Try speaking into the microphone.");
    }

    async function askAlex(question: string) {
        const response = await fetch('/askAlex', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            console.error(data.error);
        }
    }

    async function handleRecognitionResult(event) {
        const transcript = event.results[0][0].transcript;
        console.log("DEBUG: " + transcript);
        const words = transcript.toLowerCase().split(' ');
        const isForAlex = words.slice(0, 3).some(word => word.includes('alex') && !words.includes("alexa"));
        if (isForAlex) {
            console.log("You said:", transcript);
            history += "<br>" + transcript;
            const { response } = await askAlex(transcript);
            history += response;

            speakResponse(response);
        } else {
            recognition.abort();
        }
    }

    function speakResponse(response: string) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(response);
        const voices = synth.getVoices();
        if (synth.getVoices().length > 0) {
            utterance.voice = voices.find(voice => voice.name === "Google UK English Male");
        }    

        // Stop recognition before speaking
        recognition.stop();

        utterance.onend = () => {
            // Restart recognition after speaking
            isSpeaking = false;
            recognition.start();
        };

        isSpeaking = true;
        synth.speak(utterance);
    }

    function handleRecognitionEnd() {
        if (isSpeaking) return;
        recognition.start()
    }

    onMount(() => {
        if (!recognition) {
            initializeRecognition();
        }
    });
</script>
{@html history}