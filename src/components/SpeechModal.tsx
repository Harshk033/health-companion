import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, Volume2, Activity } from 'lucide-react';

interface SpeechModalProps {
  onTranscript: (text: string) => void;
  onClose: () => void;
}

export const SpeechModal: React.FC<SpeechModalProps> = ({ onTranscript, onClose }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let recognition: any = null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Browser Speech Recognition API is not supported in this browser. You can type symptoms manually.');
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not initiate microphone speech recognition.');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleUseText = () => {
    if (transcript.trim()) {
      onTranscript(transcript);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl max-w-md w-full p-6 space-y-6 text-center shadow-2xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal-700" />
            <span>Speech-to-Text Microphone Input</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Animated Mic Recording Ring */}
        <div className="relative flex items-center justify-center py-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-teal-100 text-teal-700 ring-4 ring-teal-300/60 animate-pulse'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10 text-teal-700" /> : <MicOff className="w-10 h-10 text-slate-400" />}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-slate-800">
            {isListening ? '🎙️ Listening... Speak your symptoms clearly' : 'Microphone Stopped'}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Transcribes spoken audio directly into input field
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Transcript Box */}
        <div className="p-3.5 bg-white/80 border border-slate-200 rounded-2xl text-xs text-left min-h-[80px] max-h-[140px] overflow-y-auto text-slate-900 font-medium shadow-2xs">
          {transcript || <span className="text-slate-400 italic font-normal">Your spoken transcript will appear here in real time...</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUseText}
            disabled={!transcript.trim()}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Insert Transcribed Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
