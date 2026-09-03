import { useState, useRef, useEffect } from 'react';
import { Message, GeminiModelId, PersonaRole } from './types';
import { AVAILABLE_MODELS, DEFAULT_ROLES, SUGGESTED_PROMPTS } from './data/roles';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { RoleModal } from './components/RoleModal';
import { RulesBanner } from './components/RulesBanner';
import {
  Bot,
  Trash2,
  Sliders,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.5-flash');
  const [activeRole, setActiveRole] = useState<PersonaRole>(DEFAULT_ROLES[0]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle sending a message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, newUserMessage];
    setMessages(newHistory);
    if (!textToSend) {
      setInput('');
    }
    setIsLoading(true);

    // Placeholder assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const placeholderAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelUsed: selectedModel,
    };

    setMessages((prev) => [...prev, placeholderAssistantMessage]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Compose effective instruction
      const effectiveInstruction = customInstruction.trim() || activeRole.systemInstruction;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          customInstruction: effectiveInstruction,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataPayload = trimmed.slice(6);
          if (dataPayload === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedContent += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
          } catch (e: any) {
            // Ignore parse errors on partial lines
            if (e.message && e.message.includes('Internal server error')) {
              throw e;
            }
          }
        }
      }

      // If response finished but content remained empty
      if (!accumulatedContent.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: 'Jawab mosool nahi ho saka. Barah-e-karam dobara koshish karein.',
                  error: true,
                }
              : msg
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped generation
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: msg.content + '\n\n*(Jawab yahan rok diya gaya)*',
                }
              : msg
          )
        );
      } else {
        console.error('Chat error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: err.message || 'Gemini API se rabta qaim nahi ho saka.',
                  error: true,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Retry / Regenerate last message
  const handleRetryLast = () => {
    if (messages.length === 0 || isLoading) return;

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) return;

    const lastUserText = messages[lastUserMessageIndex].content;
    // Truncate messages up to the last user message (exclusive)
    setMessages(messages.slice(0, lastUserMessageIndex));
    handleSendMessage(lastUserText);
  };

  // Clear Chat / New Thread
  const handleClearChat = () => {
    if (isLoading) {
      handleStopGeneration();
    }
    setMessages([]);
    setInput('');
  };

  // Role Save
  const handleSaveRole = (newRole: PersonaRole, customText: string) => {
    setActiveRole(newRole);
    setCustomInstruction(customText);
  };

  const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-100 text-zinc-900 antialiased overflow-hidden font-sans">
      {/* Top Application Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          {/* Logo & Assistant Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-zinc-900 sm:text-base">
                  Urdu AI Assistant
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1">
                Direct, to-the-point aur Roman Urdu jawab
              </p>
            </div>
          </div>

          {/* Right actions: Role, Model selector, Clear */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role Config Button */}
            <button
              id="open-roles-btn"
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
              title="Role & System Instructions"
            >
              <Sliders className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline font-semibold">{activeRole.title}</span>
              <span className="sm:hidden font-semibold">Role</span>
            </button>

            {/* Model Selector */}
            <ModelSelector
              models={AVAILABLE_MODELS}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <button
                id="clear-chat-btn"
                onClick={handleClearChat}
                className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 shadow-2xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Nayi Chat Shuru Karein"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Rules Notice Banner */}
      <RulesBanner />

      {/* Main Chat Conversation Container */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-between">
          {/* Messages or Empty State */}
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mb-2">
                Aap ki khidmat me hazir Specialized AI
              </h2>
              <p className="max-w-md text-sm text-zinc-600 leading-relaxed mb-6">
                Direct aur to-the-point jawabat, aasan Roman Urdu me, bulleted points ke sath. Koi faltu tamheed nahi.
              </p>

              {/* Active persona pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-200/80 px-3 py-1 text-xs font-medium text-zinc-700 mb-8">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Fa'al Kirdar (Active Role): {activeRole.title}</span>
              </div>

              {/* Suggested Prompt Chips */}
              <div className="w-full max-w-2xl">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Misali Sawalat (Suggested Prompts):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                  {SUGGESTED_PROMPTS.map((item, index) => (
                    <button
                      key={index}
                      id={`suggested-prompt-${index}`}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-400 hover:bg-zinc-50 transition-all shadow-2xs text-zinc-800 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-800 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-900 line-clamp-1 mb-1">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-zinc-500 line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2 pb-4">
              {messages.map((message, idx) => {
                const isLastAssistant =
                  message.role === 'assistant' && idx === messages.length - 1;
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLastAssistant={isLastAssistant}
                    onRetry={handleRetryLast}
                  />
                );
              })}

              {/* Streaming Loading Indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-center gap-3 py-3 px-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Bot className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border border-zinc-200 bg-white px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce"></span>
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-xs text-zinc-500 ml-2 font-medium">
                        Jawab tayyar ho raha hai...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Box Footer */}
      <footer className="sticky bottom-0 z-10 bg-linear-to-t from-zinc-100 via-zinc-100 to-transparent pt-2">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          onStop={handleStopGeneration}
          isLoading={isLoading}
          activeModelName={activeModelObj.name}
        />
      </footer>

      {/* Role Configuration Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        activeRole={activeRole}
        customInstruction={customInstruction}
        onSaveRole={handleSaveRole}
      />
    </div>
  );
}
