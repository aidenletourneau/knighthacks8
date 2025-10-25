"use client";

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/ui/button';

export default function Home() {
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  
  const topic = "Movies";
  const num = 10; 

  async function generateQuestions() {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCQ3uwzBmfoMQmleseNgOB9jTvy40zV9kA" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate " + num + " trivia questions about " + topic + ". Provide the questions in a numbered list format.",
      });
      setQuestions(response.text ?? '');
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setQuestions('Error generating questions: ' + errorMessage);
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 font-sans dark:bg-black">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
          Trivia Question Generator
        </h1>
        
        <div className="text-center">
          <Button 
            onClick={generateQuestions}
            disabled={loading}
            className="px-6 py-2"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>
        </div>

        {questions && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Trivia Questions:
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {questions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}