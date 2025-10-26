"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PixelBlast from "../components/PixelBlast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioItem, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type QA = {
  question: string;
  answer: string;
};

const PER_QUESTION_MS = 15000;

function levenshtein(a: string, b: string) {
  const al = a.length;
  const bl = b.length;

  if (al === 0) 
    return bl;
  if (bl === 0) 
    return al;

  const dp = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));

  for (let i = 0; i <= al; i++) 
    dp[i][0] = i;

  for (let j = 0; j <= bl; j++) 
    dp[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[al][bl];
}

export default function Home() {
  const [topicInput, setTopicInput] = useState("");
  const [numInput, setNumInput] = useState("5");
  const [qaList, setQaList] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [remainingMs, setRemainingMs] = useState(PER_QUESTION_MS);
  const tickRef = useRef<number | null>(null);
  const questionsRef = useRef<QA[]>([]);
  const pendingQuestionsRef = useRef<QA[] | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const startGame = (questions: QA[]) => {
    questionsRef.current = questions;
    setQaList(questions);
    setAnswers(Array(questions.length).fill(""));
    setCurrentIndex(0);
    setRemainingMs(PER_QUESTION_MS);
    setFinished(false);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted || finished) return;
    // start tick
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setRemainingMs((ms) => {
        if (ms <= 100) {
          // advance
          advanceQuestion();
          return PER_QUESTION_MS;
        }
        return ms - 100;
      });
    }, 100);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentIndex, finished]);

  // Countdown effect: when countdown is active (>0) decrement every second.
  useEffect(() => {
    if (countdown == null) 
      return;

    if (countdown <= 0) {
      // start game with pending questions
      const pq = pendingQuestionsRef.current ?? [];
      if (pq.length > 0) 
        startGame(pq);
      pendingQuestionsRef.current = null;
      setCountdown(null);
      return;
    }

    const id = window.setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  function advanceQuestion() {
    setRemainingMs(PER_QUESTION_MS);
    setCurrentIndex((idx) => {
      const next = idx + 1;
      if (next >= questionsRef.current.length) {
        // finish
        setFinished(true);
        setGameStarted(false);
        if (tickRef.current) {
          window.clearInterval(tickRef.current);
          tickRef.current = null;
        }
        return idx; // keep at last index for summary
      }
      return next;
    });
  }

  function manualAdvance() {
    // user pressed Enter or clicked next
    advanceQuestion();
  }

  function updateAnswer(val: string) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = val;
      return copy;
    });
  }

  async function generateQuestions() {
    const topic = topicInput.trim();
    const num = parseInt(numInput) || 5;

    if (!topic || isNaN(num) || num <= 0) {
      setErrorMsg("⚠️ Please enter a valid topic and number of questions.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setQaList([]);

  try {
      

      const text = response.text ?? "";

      const qaMatches = text.split(/\n(?=\d+\.)/).map((block) => {
        const qMatch = block.match(/\d+\.\s*(.*?)(?:\n|$)/);
        const aMatch = block.match(/Answer:\s*(.*)/i);
        return qMatch && aMatch
          ? { question: qMatch[1].trim(), answer: aMatch[1].trim() }
          : null;
      });

      const parsedQAs = qaMatches.filter((item): item is QA => item !== null);
      if (parsedQAs.length === 0) {
        setErrorMsg("No questions were generated. Try a different topic or reduce the number.");
      } else {
        // set pending questions and start a 3-2-1 countdown before starting the game
        pendingQuestionsRef.current = parsedQAs;
        setCountdown(3);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMsg("Error generating questions: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function computeResults() {
    const results = qaList.map((q, i) => {
      const userAns = (answers[i] || "").trim();
      const correct = q.answer.trim().replace(/\.$/, ''); // remove trailing period for fairness
      const maxLen = Math.max(userAns.length, correct.length, 1);
      const dist = levenshtein(userAns.toLowerCase(), correct.toLowerCase());
      const similarity = Math.max(0, 1 - dist / maxLen);
      const points = Math.round(similarity * 100);
      return { question: q.question, correct, userAns, similarity, points };
    });
    return results;
  }

  function restart() {
    setGameStarted(false);
    setFinished(false);
    setQaList([]);
    setAnswers([]);
    setCurrentIndex(0);
    setRemainingMs(PER_QUESTION_MS);
    setErrorMsg("");
  }

  const results = finished ? computeResults() : null;

  const totalPoints = results ? results.reduce((s, r) => s + r.points, 0) : 0;
  const maxPoints = results ? results.length * 100 : 0;
  const totalPct = maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0;
  // Letter grade mapping: <=59 F, 60-69 D, 70-79 C, 80-89 B, 90-99 A, 100 S Tier
  const grade = (() => {
    if (!maxPoints) return "-";
    if (totalPct === 100) return "S Tier";
    if (totalPct >= 90) return "A";
    if (totalPct >= 80) return "B";
    if (totalPct >= 70) return "C";
    if (totalPct >= 60) return "D";
    return "F";
  })();

  // Color mapping for the grade box and text:
  // F -> red, D/C -> yellow, B/A/S Tier -> green
  const gradeColor = (() => {
    if (!maxPoints) return { text: "text-zinc-400", border: "border-zinc-600" };
    if (grade === "S Tier" || grade === "A" || grade === "B") return { text: "text-emerald-400", border: "border-emerald-400" };
    if (grade === "C" || grade === "D") return { text: "text-yellow-400", border: "border-yellow-400" };
    return { text: "text-red-500", border: "border-red-500" };
  })();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-8 font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples={false}
          liquid={false}
          speed={0.6}
          edgeFade={0.25}
          transparent
          className="absolute inset-0 w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full space-y-6">
        {!gameStarted && !finished && countdown == null && (
          <>
            <h1 className="text-3xl font-bold text-center text-white">Trivia Question Generator</h1>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{`Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800">
                <DropdownMenuRadioGroup value={difficulty} onValueChange={setDifficulty}>
                  <DropdownMenuRadioItem value="easy">Easy</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="hard">Hard</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="text-center">
              <Button onClick={generateQuestions} disabled={loading} className="px-6 py-2">
                {loading ? "Generating..." : "Start Game!"}
              </Button>
            </div>

            {errorMsg && <div className="text-red-500 text-center whitespace-pre-wrap">{errorMsg}</div>}
          </>
        )}

        {/* Countdown overlay before game starts */}
        {countdown != null && countdown > 0 && (
          <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center w-50 h-50 rounded-full bg-black/60 backdrop-blur-sm ring-2 ring-white/10">
              <div className="text-white text-8xl font-bold drop-shadow-lg animate-pulse">{countdown}</div>
            </div>
          </div>
        )}

        {/* Game view: single question at a time */}
        {gameStarted && !finished && qaList.length > 0 && (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800 p-6">
            <div className="mb-4 text-white">Question {currentIndex + 1} of {qaList.length}</div>
            <div className="mb-4 text-lg text-white">{qaList[currentIndex].question}</div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                manualAdvance();
              }}
            >
              <Input
                className="bg-white/5 text-white"
                placeholder="Type your answer here"
                value={answers[currentIndex] ?? ""}
                onChange={(e) => updateAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    manualAdvance();
                  }
                }}
              />
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-3 bg-zinc-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-[width]"
                    style={{ width: `${(remainingMs / PER_QUESTION_MS) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-white w-12 text-right">{Math.ceil(remainingMs / 1000)}s</div>
              </div>
            </form>
          </div>
        )}

        {/* Results view */}
        {finished && results && (
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800 p-6 space-y-4 text-white">
            <h2 className="text-2xl">Results</h2>
            <div className="space-y-4">
              {results.map((r, i) => {
                const pct = Math.round((r.similarity ?? 0) * 100);
                let colorClass = "text-red-500";
                if (pct > 66) colorClass = "text-emerald-400";
                else if (pct > 33) colorClass = "text-yellow-400";

                return (
                  <div key={i} className="p-3 bg-zinc-800 rounded">
                    <div className="font-semibold">Q{i + 1}: {r.question}</div>
                    <div className="text-sm">Your answer: <span className="font-medium">{r.userAns || <em className="text-zinc-400">(no answer)</em>}</span></div>
                    <div className="text-sm">Correct: <span className="font-medium">{r.correct}</span></div>
                    <div className={`text-sm ${colorClass}`}>Similarity: {pct}% — Points: {r.points}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-white">
                  Score: <span className="font-semibold">{totalPoints}</span> / <span className="font-semibold">{maxPoints}</span> — <span className="font-medium">{totalPct}%</span>
                </div>
                <div
                  className={`ml-2 ${gradeColor.text} ${gradeColor.border} border-2 rounded-md px-3 py-1 text-2xl font-bold`}
                  aria-live="polite"
                >
                  {grade}
                </div>
              </div>
              <Button onClick={restart}>Restart</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
