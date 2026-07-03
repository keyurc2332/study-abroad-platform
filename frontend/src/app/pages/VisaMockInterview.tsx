import React, { useEffect, useRef, useState } from "react";
import { Mic, Send, User, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  time: number;
};

const QUESTIONS = [
  "Can I have your full name, please?",
  "What is the purpose of your travel/study?",
  "Which university and program have you applied to?",
  "How do you plan to fund your studies?",
  "When do you plan to travel / start your program?",
  "Do you have any family/dependents traveling with you?",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function VisaMockInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // start conversation
    const welcome: Message = { id: uid(), role: "bot", text: "Hello — I'm the visa officer for this mock interview. I'll ask some questions to simulate an embassy interview.", time: Date.now() };
    const first: Message = { id: uid(), role: "bot", text: QUESTIONS[0], time: Date.now() + 10 };
    setMessages([welcome, first]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // setup speech recognition if available
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";
    recog.onresult = (ev: any) => {
      const transcript = Array.from(ev.results).map((r: any) => r[0].transcript).join(" ");
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setListening(false);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
  }, []);

  const appendMessage = (m: Message) => setMessages((prev) => [...prev, m]);

  const handleSend = (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;
    const userMsg: Message = { id: uid(), role: "user", text: msgText, time: Date.now() };
    appendMessage(userMsg);
    setInput("");

    // simple bot logic: acknowledge and ask next question
    setTimeout(() => {
      const ack: Message = { id: uid(), role: "bot", text: `I see. Thank you for your answer.`, time: Date.now() };
      appendMessage(ack);

      const next = questionIndex + 1;
      if (next < QUESTIONS.length) {
        const q: Message = { id: uid(), role: "bot", text: QUESTIONS[next], time: Date.now() + 10 };
        appendMessage(q);
        setQuestionIndex(next);
      } else {
        const done: Message = { id: uid(), role: "bot", text: "Thank you — that's all for this mock interview. Good luck!", time: Date.now() + 10 };
        appendMessage(done);
      }
    }, 700);
  };

  const toggleListening = () => {
    const recog = recognitionRef.current;
    if (!recog) return;
    if (listening) {
      recog.stop();
      setListening(false);
    } else {
      try {
        recog.start();
        setListening(true);
      } catch {
        // ignore start errors
        setListening(false);
      }
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-[calc(100vh-118px)] bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-158px)] w-full max-w-7xl flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-5 rounded-[20px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Visa Mock Interview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Practice a visa interview with a simulated visa officer</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">Talk via text or microphone. The officer will ask common interview questions and guide you through realistic prompts used in embassy interviews.</p>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <button
                onClick={() => {
                  setMessages([]);
                  setTimeout(() => {
                    const welcome: Message = { id: uid(), role: "bot", text: "Hello — I'm the visa officer for this mock interview. I'll ask some questions to simulate an embassy interview.", time: Date.now() };
                    const first: Message = { id: uid(), role: "bot", text: QUESTIONS[0], time: Date.now() + 10 };
                    setMessages([welcome, first]);
                    setQuestionIndex(0);
                  }, 50);
                }}
                className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700 border border-slate-100 hover:bg-slate-100"
              >
                Restart
              </button>
            </div>
          </div>
        </motion.div>
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex min-h-[430px] flex-1 flex-col rounded-[16px] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto rounded-md bg-slate-50 p-4 sm:p-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`relative max-w-[78%] rounded-2xl px-5 py-4 text-sm shadow-sm ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-white text-slate-900 border border-slate-200"}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full ${m.role === "user" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-700"} text-xs font-medium`}>{m.role === "user" ? "You" : "VO"}</div>
                      </div>
                      <div>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                        <div className="mt-2 text-[12px] text-slate-400">{formatTime(m.time)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-none items-end gap-3 sm:items-center sm:gap-4">
              <button
                onClick={toggleListening}
                aria-pressed={listening}
                aria-label={listening ? "Stop recording" : "Start recording"}
                className={`rounded-full p-3 ${listening ? "bg-red-600 text-white" : "bg-white border border-slate-200 text-slate-900"} shadow-sm`}
              >
                <Mic className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <label htmlFor="visa-input" className="sr-only">Answer input</label>
                <textarea
                  id="visa-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { handleSend(); } }}
                  placeholder="Type your answer here (press Ctrl+Enter to send)..."
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

                <button onClick={() => handleSend()} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md sm:px-5">
                  <Send className="h-4 w-4" /> Send
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
