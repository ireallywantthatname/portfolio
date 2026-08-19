"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import {
  createContext,
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Draggable from "react-draggable";

import { btnPrimary, panel } from "@/lib/styles";
import { cn } from "@/lib/utils";

type ChatUiState = {
  open: boolean;
  minimized: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleMinimized: () => void;
};

const ProjectChatContext = createContext<ChatUiState | null>(null);

export function useProjectChat() {
  const ctx = useContext(ProjectChatContext);
  if (!ctx) {
    throw new Error("useProjectChat must be used within ProjectChatProvider");
  }
  return ctx;
}

export function ProjectChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const value = useMemo<ChatUiState>(
    () => ({
      open,
      minimized,
      openChat: () => {
        setOpen(true);
        setMinimized(false);
      },
      closeChat: () => setOpen(false),
      toggleMinimized: () => setMinimized((v) => !v),
    }),
    [open, minimized],
  );

  return (
    <ProjectChatContext.Provider value={value}>
      {children}
    </ProjectChatContext.Provider>
  );
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

export function ProjectChatWindow() {
  const { open, minimized, closeChat, toggleMinimized, openChat } =
    useProjectChat();
  const nodeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open || minimized) return;
    const el = listRef.current;
    if (!el) return;
    if (messages.length === 0 && status === "ready") return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status, open, minimized]);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  }, [input, busy, sendMessage]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      void submit();
    },
    [submit],
  );

  if (!open) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".chat-drag-handle"
      bounds="parent"
      defaultPosition={{ x: 24, y: 80 }}
    >
      <div
        ref={nodeRef}
        className={cn(
          panel,
          "absolute z-40 flex w-[min(360px,calc(100%-1.5rem))] flex-col overflow-hidden bg-secondary-background",
          minimized ? "h-auto" : "h-[min(420px,calc(100%-2rem))]",
        )}
      >
        <div className="chat-drag-handle flex cursor-grab items-center justify-between border-b-4 border-border bg-main px-3 py-2 active:cursor-grabbing">
          <div className="flex items-center gap-2 text-main-foreground">
            <MessageCircle className="size-4" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.16em]">
              Project chat
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMinimized}
              className="inline-flex size-8 items-center justify-center rounded-base border-2 border-border bg-secondary-background text-foreground hover:bg-background focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={minimized ? "Expand chat" : "Minimize chat"}
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex size-8 items-center justify-center rounded-base border-2 border-border bg-secondary-background text-foreground hover:bg-background focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Close chat"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {!minimized ? (
          <>
            <div
              ref={listRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3"
            >
              {messages.length === 0 ? (
                <p className="text-sm leading-relaxed text-foreground/80">
                  Ask about pinned projects. Answers use each repo&apos;s
                  CONTEXT.md.
                </p>
              ) : null}
              {messages.map((message) => {
                const text = messageText(message);
                if (!text && message.role === "assistant") {
                  return (
                    <div
                      key={message.id}
                      className="max-w-[92%] self-start rounded-base border-2 border-border bg-main/15 px-3 py-2 text-sm"
                    >
                      …
                    </div>
                  );
                }
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[92%] rounded-base border-2 border-border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                      message.role === "user"
                        ? "self-end bg-main text-main-foreground"
                        : "self-start bg-background",
                    )}
                  >
                    {text}
                  </div>
                );
              })}
              {error ? (
                <p className="rounded-base border-2 border-border bg-background px-3 py-2 text-sm text-foreground">
                  Something went wrong. Try again.
                </p>
              ) : null}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 border-t-4 border-border p-3"
            >
              <label className="sr-only" htmlFor="project-chat-input">
                Message
              </label>
              <textarea
                id="project-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="Ask about a project…"
                className="min-h-[44px] flex-1 resize-none rounded-base border-2 border-border bg-background px-3 py-2 text-sm leading-snug outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => void stop()}
                  className={cn(btnPrimary, "h-[44px] shrink-0 px-3")}
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    btnPrimary,
                    "h-[44px] shrink-0 px-3 disabled:pointer-events-none disabled:opacity-50",
                  )}
                  aria-label="Send"
                >
                  <Send className="size-4" />
                </button>
              )}
            </form>
          </>
        ) : (
          <button
            type="button"
            onClick={openChat}
            className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-foreground/80 hover:bg-main/10"
          >
            Click to expand
          </button>
        )}
      </div>
    </Draggable>
  );
}

export function OpenProjectChatButton({ className }: { className?: string }) {
  const { openChat, open } = useProjectChat();
  return (
    <button
      type="button"
      onClick={openChat}
      className={className}
      aria-pressed={open}
    >
      Ask about projects
    </button>
  );
}
