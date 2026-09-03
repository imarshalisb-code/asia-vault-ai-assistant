import { useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  activeModelName: string;
}

export const ChatInput = ({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  activeModelName,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4 pt-1">
      <div className="relative flex flex-col rounded-2xl border border-zinc-300 bg-white shadow-sm focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
        {/* Text Input Area */}
        <textarea
          id="chat-textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Apna sawal ya task yahan likhein (Urdu / Roman Urdu)..."
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-60 max-h-[200px] overflow-y-auto"
        />

        {/* Footer controls inside input container */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-zinc-400">
              Shift + Enter for new line • Enter to send
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
              Model: {activeModelName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isLoading ? (
              <button
                id="btn-stop-generation"
                onClick={onStop}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Rokein (Stop)</span>
              </button>
            ) : (
              <button
                id="btn-send-message"
                onClick={onSend}
                disabled={!input.trim()}
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-xs ${
                  input.trim()
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-zinc-400">
        AI Assistant direct, to-the-point aur bulleted Roman Urdu / Urdu me jawab deta hai.
      </p>
    </div>
  );
};
