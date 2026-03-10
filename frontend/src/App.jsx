import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = (t) =>
    t.trim() === "" ? 0 : t.trim().split(/\s+/).length;

  const summarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary("Error connecting to backend.");
    }

    setLoading(false);
  };

  const summarizeFile = async () => {

  if (!file) return;

  setLoading(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://localhost:8000/summarize-file", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setSummary(data.summary);

  } catch (err) {
    setSummary("File summarization failed.");
  }

  setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setText("");
    setSummary("");
  };

  return (
   <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

  <div className="text-center py-10">
    <h1 className="text-4xl font-bold text-white mb-2">
      AI Document Summarizer
    </h1>
    <p className="text-zinc-400 text-sm">
      Summarize long articles, PDFs, and documents instantly using transformer models.
    </p>
  </div>

  {/* Header */}
  <header className="border-b border-zinc-800">
    <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
      <h1 className="text-xl font-semibold">AI Summarizer</h1>
      <span className="text-sm text-zinc-500">
        FastAPI · HuggingFace · React
      </span>
    </div>
  </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Input */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">

            <div className="flex justify-between mb-3">
              <span className="text-sm text-zinc-400">Input</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-3 text-sm text-zinc-400"
              />
              <span className="text-xs text-zinc-500">
                {wordCount(text)} words
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your article or text here..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-amber-500"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={summarize}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-2 rounded-lg font-medium"
              >
                {loading ? "Summarizing..." : "Summarize"}
              </button>

              <button
                onClick={clear}
                className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
              >
                Clear
              </button>
              <button
                onClick={summarizeFile}
                className="px-4 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg"
              >
              Summarize File
              </button>
            </div>

          </div>

          {/* Output */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">

            <div className="flex justify-between mb-3">
              <span className="text-sm text-zinc-400">Summary</span>
              {summary && (
                <span className="text-xs text-zinc-500">
                  {wordCount(summary)} words
                </span>
              )}
            </div>

            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm leading-relaxed">

              {loading && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
                </div>
              )}

              {!loading && !summary && (
                <p className="text-zinc-600 text-center mt-10">
                  Your summary will appear here
                </p>
              )}

              {!loading && summary && (
                <p>{summary}</p>
              )}

            </div>

            {summary && !loading && (
              <button
                onClick={copy}
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm"
              >
                {copied ? "Copied!" : "Copy Summary"}
              </button>
            )}

          </div>

        </div>

        {/* Stats */}
        {summary && (
          <div className="mt-8 flex justify-center gap-10 text-center">

            <div>
              <p className="text-2xl font-bold text-amber-400">
                {wordCount(text)}
              </p>
              <p className="text-xs text-zinc-500 uppercase">Original</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-amber-400">
                {wordCount(summary)}
              </p>
              <p className="text-xs text-zinc-500 uppercase">Summary</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-amber-400">
                {Math.round(
                  (1 - wordCount(summary) / wordCount(text)) * 100
                )}%
              </p>
              <p className="text-xs text-zinc-500 uppercase">Reduced</p>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}