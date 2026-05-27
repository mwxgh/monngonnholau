'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageSender {
  id: number;
  name: string | null;
  avatar: string | null;
  role: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: MessageSender;
}

interface Conversation {
  id: number;
  userId: number;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem('accessToken'));
  }, []);

  useEffect(() => {
    if (!open || !token) return;

    const socket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join');
    });

    socket.on('history', (data: { conversation: Conversation; messages: Message[] }) => {
      setConversation(data.conversation);
      setMessages(data.messages);
    });

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [open, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || !conversation || !socketRef.current) return;
    socketRef.current.emit('message', {
      conversationId: conversation.id,
      content: input.trim(),
    });
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!token) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', connected ? 'bg-green-400' : 'bg-zinc-400')} />
              <span className="text-sm font-semibold text-primary-foreground">Hỗ trợ khách hàng</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Xin chào! Chúng tôi có thể giúp gì cho bạn?
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender.role === 'CUSTOMER';
              return (
                <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      isMe
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted text-foreground',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !connected}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
