import { isAuthenticated } from "@/lib/authVerification";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/constants/data";
import { getAuthToken } from "@/lib/authHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};
export const Route = createFileRoute("/agent")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to sanitize assistant responses that may be JSON-wrapped or escaped
  const sanitizeAssistantContent = (raw: string | null | undefined) => {
    if (!raw) return "";
    let s = raw.trim();

    const tryParse = (str: string) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    };

    // Direct JSON parse
    const parsed = tryParse(s);
    if (parsed !== null) {
      if (typeof parsed === "string") return parsed;
      if (typeof parsed === "object") {
        const keys = ["reply", "content", "message", "result", "text"];
        for (const k of keys) {
          if (parsed[k] && typeof parsed[k] === "string") return parsed[k];
        }
        const stringKey = Object.keys(parsed).find(
          (k) => typeof parsed[k] === "string",
        );
        if (stringKey) return parsed[stringKey] as string;
        return JSON.stringify(parsed, null, 2);
      }
      return String(parsed);
    }

    // Try to find JSON substring inside
    const jsonMatch = s.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const p = tryParse(jsonMatch[0]);
      if (p && typeof p === "object") {
        const keys = ["reply", "content", "message", "result", "text"];
        for (const k of keys) {
          if (p[k] && typeof p[k] === "string") return p[k];
        }
        const stringKey = Object.keys(p).find((k) => typeof p[k] === "string");
        if (stringKey) return p[stringKey] as string;
        return JSON.stringify(p, null, 2);
      }
    }

    // Attempt to unescape common sequences
    try {
      const maybeUnescaped = tryParse(
        '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"',
      );
      if (typeof maybeUnescaped === "string") return maybeUnescaped;
    } catch (e) {
      // ignore parse/unescape attempt failures
      // no-op
      void e;
    }

    s = s
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    return s;
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = getAuthToken();

      const res = await fetch(`${API_BASE_URL}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Error: ${res.status} ${res.statusText} ${errText}`,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        return;
      }

      const contentType = res.headers.get("content-type") || "";

      if (
        res.body &&
        (contentType.includes("text/event-stream") ||
          contentType.includes("stream"))
      ) {
        // Stream response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let assistantContent = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = !!readerDone;
          if (value) {
            assistantContent += decoder.decode(value, { stream: true });
            setMessages((prev) => {
              const withoutTemp = prev.filter((m) => !m.id.startsWith("temp-"));
              return [
                ...withoutTemp,
                {
                  id: `temp-${Date.now()}`,
                  role: "assistant",
                  content: assistantContent,
                  timestamp: new Date(),
                },
              ];
            });
          }
        }

        setMessages((prev) => [
          ...prev.filter((m) => !m.id.startsWith("temp-")),
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: sanitizeAssistantContent(assistantContent),
            timestamp: new Date(),
          },
        ]);
      } else {
        // JSON fallback
        const data = await res.json().catch(() => null);
        const assistantContentRaw =
          (data && (data.content || data.message || data.result)) ||
          JSON.stringify(data) ||
          "(no response)";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: sanitizeAssistantContent(assistantContentRaw),
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      console.error("Agent request failed", err);
      const message =
        err instanceof Error
          ? err.message
          : String(
              err ?? "Request failed. Please check your connection or server.",
            );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: message,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 min-h-0 px-4 py-6" ref={scrollAreaRef}>
        <div className="mx-auto max-w-4xl space-y-6 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={
                    message.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex max-w-[80%] flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="max-h-[48vh] overflow-auto whitespace-pre-wrap break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2 ml-4 list-disc space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 ml-4 list-decimal space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              className="block rounded-lg bg-background/50 p-3 font-mono text-xs overflow-x-auto"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="mb-2 overflow-x-auto">{children}</pre>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:opacity-80"
                          >
                            {children}
                          </a>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-2 text-lg font-bold">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 text-base font-bold">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 text-sm font-bold">{children}</h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-foreground/20 pl-3 italic">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-background"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-muted-foreground">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
