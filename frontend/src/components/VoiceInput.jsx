import React, { useState, useEffect } from 'react';

export default function VoiceInput({ onTranscript, isListening, setIsListening }) {
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onTranscript(finalTranscript, interimTranscript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscript, setIsListening]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${
        isListening
          ? "bg-danger text-white shadow-lg animate-pulse"
          : "bg-surface text-muted hover:text-accent hover:bg-accent-light"
      }`}
      title={isListening ? "Stop listening" : "Speak your query"}
    >
      {isListening ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
