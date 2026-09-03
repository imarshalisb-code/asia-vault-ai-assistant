import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessage = ({ message, onRetry, isLastAssistant }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(message.timestamp));

  return (
    <div
      id={`msg-${message.id}`}
      className={`group flex w-full gap-3 md:gap-4 py-3 px-2 sm:px-4 transition-colors ${
        isUser ? 'flex-row-reverse justify-start' : 'justify-start'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm shadow-xs ${
          isUser
            ? 'bg-zinc-800 text-white border-zinc-700'
            : 'bg-emerald-600 text-white border-emerald-500'
        }`}
      >
        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </div>

      {/* Bubble */}
      <div
        className={`flex max-w-[88%] sm:max-w-[80%] md:max-w-[75%] flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Header info */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-zinc-500">
            {isUser ? 'Aap (User)' : 'Specialized AI'}
          </span>
          {message.modelUsed && !isUser && (
            <span className="text-[10px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-1.5 py-0.5 rounded-md font-mono">
              {message.modelUsed}
            </span>
          )}
          <span className="text-[10px] text-zinc-400">{formattedTime}</span>
        </div>

        {/* Message Content */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-xs ${
            isUser
              ? 'bg-zinc-900 text-zinc-50 rounded-tr-xs'
              : message.error
              ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-xs'
              : 'bg-white text-zinc-900 border border-zinc-200/90 rounded-tl-xs'
          }`}
        >
          {message.error ? (
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Koi Masla Pesh Aaya</p>
                <p className="text-sm text-red-700">{message.content}</p>
                {onRetry && (
                  <button
                    id={`retry-${message.id}`}
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Dobara Koshish Karein (Retry)
                  </button>
                )}
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="chat-markdown space-y-2.5 text-zinc-800 break-words">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions bar for Assistant */}
        {!isUser && !message.error && message.content && (
          <div className="flex items-center gap-2 mt-1.5 px-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              id={`copy-${message.id}`}
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 px-2 py-1 rounded-md transition-colors"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            {isLastAssistant && onRetry && (
              <button
                id={`regenerate-${message.id}`}
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 px-2 py-1 rounded-md transition-colors"
                title="Regenerate this response"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
