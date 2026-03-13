'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Type, 
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Settings2,
  Zap
} from 'lucide-react';
import { correctTextLocally } from '@/lib/corrector';
import { GoogleGenAI } from "@google/genai";

export default function SentenceCorrector() {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'local' | 'ai'>('local');

  const handleCorrect = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setCorrectedText('');

    if (mode === 'ai') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: [{ parts: [{ text: `Correct the following text for grammar, spelling, and natural flow. Return ONLY the corrected text without any explanations or quotes: "${inputText}"` }] }],
          config: {
            temperature: 0.1,
            topP: 0.95,
            topK: 40,
          }
        });

        const result = response.text;
        if (result) {
          setCorrectedText(result.trim());
        } else {
          throw new Error("No response from AI");
        }
      } catch (err) {
        console.error("AI Correction error:", err);
        setError("AI correction failed. Please check your connection or try Local Mode.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Simulate a small delay for "processing" feel
      setTimeout(() => {
        try {
          const result = correctTextLocally(inputText);
          if (result) {
            setCorrectedText(result);
          } else {
            throw new Error("Could not process text");
          }
        } catch (err) {
          console.error("Correction error:", err);
          setError("Failed to correct text locally.");
        } finally {
          setIsLoading(false);
        }
      }, 600);
    }
  };

  const handleCopy = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText('');
    setCorrectedText('');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            <div className="inline-flex p-1 bg-slate-200 rounded-2xl">
              <button
                onClick={() => setMode('local')}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'local' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Local Mode
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BrainCircuit className="w-4 h-4 mr-2" />
                AI Mode (Large)
              </button>
            </div>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${mode === 'local' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {mode === 'local' ? 'Privacy Focused' : 'Advanced Correction'}
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
          >
            Sentence & Spelling <span className={mode === 'local' ? 'text-emerald-600' : 'text-indigo-600'}>Corrector</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            {mode === 'local' 
              ? "Fix grammar and spelling instantly. Works entirely offline with no external API calls."
              : "Advanced AI-powered correction for complex sentence restructuring and natural flow."
            }
          </motion.p>
        </header>

        <div className="space-y-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-bottom border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center text-slate-600 font-medium">
                <Type className="w-4 h-4 mr-2" />
                Original Text
              </div>
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-48 md:h-64 p-6 focus:outline-none resize-none text-lg leading-relaxed placeholder:text-slate-300"
            />
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCorrect}
                disabled={isLoading || !inputText.trim()}
                className={`
                  flex items-center px-8 py-3 rounded-2xl font-semibold transition-all duration-200
                  ${isLoading || !inputText.trim() 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : mode === 'local' 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'}
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === 'ai' ? 'AI Thinking...' : 'Correcting...'}
                  </>
                ) : (
                  <>
                    {mode === 'ai' ? 'AI Correction' : 'Correct Text'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center"
              >
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
            {(correctedText || isLoading) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`bg-white rounded-3xl shadow-xl border overflow-hidden ${mode === 'local' ? 'shadow-emerald-100/50 border-emerald-100' : 'shadow-indigo-100/50 border-indigo-100'}`}
              >
                <div className={`p-4 border-bottom flex items-center justify-between ${mode === 'local' ? 'border-emerald-50 bg-emerald-50/30' : 'border-indigo-50 bg-indigo-50/30'}`}>
                  <div className={`flex items-center font-medium ${mode === 'local' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                    {mode === 'ai' ? <BrainCircuit className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {mode === 'ai' ? 'AI Corrected Version' : 'Improved Version'}
                  </div>
                  <button 
                    onClick={handleCopy}
                    disabled={!correctedText}
                    className={`
                      flex items-center px-4 py-1.5 rounded-xl text-sm font-medium transition-all
                      ${copied 
                        ? mode === 'local' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                        : mode === 'local' 
                          ? 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'
                          : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}
                    `}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-6 min-h-[12rem] relative">
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                      <div className="relative">
                        <Loader2 className={`w-10 h-10 animate-spin ${mode === 'local' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${mode === 'local' ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
                        </div>
                      </div>
                      <p className="mt-4 text-slate-400 font-medium animate-pulse">
                        {mode === 'ai' ? 'AI is analyzing your sentence...' : 'Polishing your text...'}
                      </p>
                    </div>
                  ) : null}
                  <div className={`text-lg leading-relaxed ${!correctedText ? 'text-slate-300 italic' : 'text-slate-800'}`}>
                    {correctedText || "The corrected text will appear here..."}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 text-center text-slate-400 text-sm">
          <p>Open Source • Local Processing • No Data Leaves Your Browser</p>
        </footer>
      </div>
    </main>
  );
}
