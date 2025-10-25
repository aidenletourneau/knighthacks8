"use client";

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PixelBlast from '../components/PixelBlast';

export default function Home() {
  const [topicInput, setTopicInput] = useState("");
  const [numInput, setNumInput] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateQuestions() {
    const topic = topicInput.trim();
    const num = parseInt(numInput);

    if (!topic || isNaN(num) || num <= 0) {
      setQuestions("⚠️ Please enter a valid topic and number of questions.");
      return;
    }

    setLoading(true);

    try {
      const ai = new GoogleGenAI({
        apiKey: "AIzaSyCQ3uwzBmfoMQmleseNgOB9jTvy40zV9kA",
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate ${num} trivia questions about ${topic}. Provide the questions in a numbered list format.`,
      });

      setQuestions(response.text ?? "");
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setQuestions("Error generating questions: " + errorMessage);
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-8 font-sans">
      {/* Background PixelBlast */}
      <div className="fixed inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-white">
          Trivia Question Generator
        </h1>

        <Input
          className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800"
          placeholder="Enter a topic (e.g., Movies)"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
        />
        <Input
          className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800"
          placeholder="Enter number of questions"
          type="number"
          value={numInput}
          onChange={(e) => setNumInput(e.target.value)}
        />

        <div className="text-center">
          <Button
            onClick={generateQuestions}
            disabled={loading}
            className="px-6 py-2"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </div>

        {questions && (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Trivia Questions:
            </h2>
            <div className="text-zinc-300 whitespace-pre-wrap">
              {questions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}