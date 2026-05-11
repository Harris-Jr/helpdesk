import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Ticket as TicketIcon, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatbotConfig, ChatbotFAQ, ChatLog, KnowledgeBaseArticle, Notification, Ticket } from '@/api/entities';
import { InvokeLLM } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const SESSION_KEY = 'chatbot_session_id';
const HISTORY_KEY = 'chatbot_history';
const MAX_CONTEXT_MESSAGES = 20; // how many recent messages to send to the LLM

function genSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatbotWidget({ user }) {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [config, setConfig] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) { id = genSessionId(); localStorage.setItem(SESSION_KEY, id); }
    return id;
  });
  const [lastResolved, setLastResolved] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load config + restore history
  useEffect(() => {
    (async () => {
      try {
        const cfgs = await ChatbotConfig.list();
        const cfg = cfgs?.[0] || null;
        setConfig(cfg);
        if (cfg && cfg.enabled === false) setEnabled(false);
      } catch {}
    })();

    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (stored.length > 0) setMessages(stored);
    } catch {}
  }, []);

  // Persist history
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-100))); } catch {}
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Show welcome on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greet = config?.welcome_message ||
        `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your OAG Helpdesk assistant. Ask me anything — tickets, common IT issues, how to use the system, or I can help you create a ticket.`;
      setMessages([{ role: 'assistant', content: greet, timestamp: new Date().toISOString() }]);
    }
  }, [open]); // eslint-disable-line

  const saveLog = async (msgs, resolved = true, lastQuestion = '') => {
    try {
      const existing = await ChatLog.filter({ session_id: sessionId });
      const payload = {
        session_id: sessionId,
        user_email: user?.email,
        user_name: user?.full_name,
        messages: msgs.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
        resolved,
        last_user_question: lastQuestion,
      };
      if (existing?.[0]) await ChatLog.update(existing[0].id, payload);
      else await ChatLog.create(payload);
    } catch {}
  };

  const buildContext = async () => {
    let kbContext = '';
    let faqContext = '';
    let userTickets = '';

    try {
      if (config?.use_knowledge_base !== false) {
        const articles = await KnowledgeBaseArticle.filter({ status: 'Published' }, '-views', 20);
        if (articles?.length) {
          kbContext = articles
            .map((a, i) => `[KB${i + 1}] "${a.title}" (${a.category || 'general'})\n${(a.content || '').slice(0, 600)}`)
            .join('\n\n');
        }
      }
    } catch {}

    try {
      const faqs = await ChatbotFAQ.filter({ enabled: true }, '', 50);
      if (faqs?.length) {
        faqContext = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
      }
    } catch {}

    // Optional: user's own recent tickets for context-aware answers
    try {
      if (user?.email) {
        const tickets = await Ticket.filter({ created_by: user.email }, '-created_date', 5);
        if (tickets?.length) {
          userTickets = tickets
            .map((t) => `- ${t.ticket_number || t.id.slice(-6)}: "${t.title}" [${t.status}]${t.assigned_to ? ` assigned to ${t.assigned_to}` : ''}`)
            .join('\n');
        }
      }
    } catch {}

    return { kbContext, faqContext, userTickets };
  };

  const askBot = async (userText) => {
    setSending(true);
    const userMsg = { role: 'user', content: userText, timestamp: new Date().toISOString() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);

    try {
      const { kbContext, faqContext, userTickets } = await buildContext();

      // Full session memory — include all recent turns (up to MAX_CONTEXT_MESSAGES)
      const conversation = nextMsgs
        .slice(-MAX_CONTEXT_MESSAGES)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const systemPrompt = `You are the OAG (Office of the Auditor General) Helpdesk Assistant — a warm, intelligent, conversational AI support agent, similar to ChatGPT. You talk naturally and helpfully, like a real human support specialist.

CORE RULE: RESPOND TO EVERYTHING
- You MUST reply to every single message, no matter how small or casual.
- Greetings ("hi", "hello", "hey", "good morning", "howzit") → respond warmly and invite them to ask something. Example: "Hey! 👋 How can I help you today?"
- Small talk ("how are you?", "thanks", "ok", "cool", "lol") → respond naturally like a human would, briefly, then gently steer back to how you can help if appropriate.
- Questions, support issues, complex problems → answer thoroughly.
- NEVER ignore, skip, or refuse a message. Every input gets a meaningful, friendly reply.

PERSONALITY & STYLE
- Be friendly, clear, and conversational. Never robotic, never scripted.
- Write naturally — vary sentence length, use contractions, sound human.
- Use simple language; avoid corporate jargon.
- Match the energy of the user: short casual messages get short casual replies; detailed questions get detailed answers.
- Format longer answers with short paragraphs, bullet points, or numbered steps when helpful.
- Use light emojis occasionally (👋, ✅, 💡) to feel human, but don't overdo it.

HOW TO ANSWER
- Understand the user's full intent, including follow-ups and ambiguous questions.
- Use the conversation history to stay context-aware (e.g. if they mentioned a ticket, remember it).
- Give complete, explanatory answers — not one-liners — when the question deserves it.
- Provide step-by-step help for troubleshooting.
- Reference knowledge base articles by title when you use them.
- If the user's question is vague, ask ONE specific clarifying question instead of guessing.

WHEN TO SUGGEST A TICKET
- If the issue needs a technician, set suggest_ticket = true and propose a helpful title + description drawn from the conversation.
- Phrase it naturally: "I can create a ticket for you with these details if you'd like."
- Don't push tickets for simple questions you can answer directly.

RESOLUTION FLAG
- Set resolved = true for greetings, small talk, clarifying questions, and any useful answer.
- Set resolved = false ONLY if you truly couldn't help a support issue and a human technician is needed.

KNOWN FAQS
${faqContext || '(none configured yet)'}

KNOWLEDGE BASE ARTICLES
${kbContext || '(no articles available)'}

USER CONTEXT
- Name: ${user?.full_name || 'Unknown'}
- Email: ${user?.email || 'unknown'}
${userTickets ? `- Recent tickets:\n${userTickets}` : '- No recent tickets.'}

CONVERSATION SO FAR
${conversation}

Now generate your next reply as the Assistant. Respond ONLY in JSON matching the schema.`;

      const res = await InvokeLLM({
        prompt: systemPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            reply: { type: 'string', description: 'The assistant reply. Markdown allowed.' },
            resolved: { type: 'boolean' },
            suggest_ticket: { type: 'boolean' },
            suggested_title: { type: 'string' },
            suggested_description: { type: 'string' },
          },
          required: ['reply', 'resolved'],
        },
      });

      const botMsg = {
        role: 'assistant',
        content: res.reply || (config?.fallback_message || "Could you tell me a bit more so I can help you properly?"),
        timestamp: new Date().toISOString(),
        suggest_ticket: res.suggest_ticket,
        suggested_title: res.suggested_title,
        suggested_description: res.suggested_description,
      };

      const finalMsgs = [...nextMsgs, botMsg];
      setMessages(finalMsgs);
      setLastResolved(!!res.resolved);
      saveLog(finalMsgs, !!res.resolved, userText);

      if (!res.resolved && config?.notify_admin_on_unresolved !== false) {
        try {
          await Notification.create({
            title: 'Unresolved chatbot question',
            message: `User ${user?.full_name || user?.email} asked: "${userText.slice(0, 140)}"`,
            type: 'warning',
            category: 'system',
            sent_to: 'admin',
            auto_generated: true,
          });
        } catch {}
      }
    } catch {
      const fallback = {
        role: 'assistant',
        content: "I'm having a bit of trouble right now. Could you rephrase your question, or I can help you create a ticket?",
        timestamp: new Date().toISOString(),
      };
      setMessages([...nextMsgs, fallback]);
      setLastResolved(false);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    askBot(text);
  };

  const createTicketFromChat = (suggested) => {
    try {
      const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
      sessionStorage.setItem('chatbot_ticket_draft', JSON.stringify({
        title: suggested?.title || '',
        description: suggested?.description || lastUserMsg,
      }));
    } catch {}
    setOpen(false);
    navigate('/user/submit-ticket');
  };

  const clearChat = () => {
    if (!confirm('Start a fresh conversation? Current chat will be cleared.')) return;
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
    const newId = genSessionId();
    localStorage.setItem(SESSION_KEY, newId);
    setSessionId(newId);
    // Re-seed greeting
    const greet = config?.welcome_message ||
      `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your OAG Helpdesk assistant. What can I help you with?`;
    setMessages([{ role: 'assistant', content: greet, timestamp: new Date().toISOString() }]);
  };

  if (!enabled) return null;

  // Group messages by day for date separators; determine if avatar should show
  const renderMessages = () => {
    const out = [];
    let lastDate = null;
    messages.forEach((m, i) => {
      const ts = m.timestamp ? new Date(m.timestamp) : new Date();
      if (!lastDate || !isSameDay(lastDate, ts)) {
        out.push(
          <div key={`sep-${i}`} className="flex items-center justify-center my-2">
            <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-3 py-0.5">
              {format(ts, 'EEEE, MMM d')}
            </span>
          </div>
        );
      }
      lastDate = ts;

      const prev = messages[i - 1];
      const showAvatar = !prev || prev.role !== m.role;

      out.push(
        <MessageBubble
          key={i}
          message={m}
          onCreateTicket={createTicketFromChat}
          showAvatar={showAvatar}
        />
      );
    });
    return out;
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-xl p-4 flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] h-[75vh] max-h-[680px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Helpdesk Assistant</p>
                  <p className="text-xs text-green-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    AI • Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} title="New conversation" className="hover:bg-white/10 rounded p-1.5">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} title="Close" className="hover:bg-white/10 rounded p-1.5">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
              {renderMessages()}

              {sending && <TypingIndicator />}

              {!sending && messages.length > 1 && !lastResolved && (
                <div className="flex justify-center pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createTicketFromChat()}
                    className="text-xs border-green-700 text-green-700 hover:bg-green-50"
                  >
                    <TicketIcon className="w-3 h-3 mr-1" />
                    Create a ticket instead
                  </Button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message Helpdesk Assistant…"
                  rows={1}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-green-600 resize-none max-h-32"
                  disabled={sending}
                  style={{ minHeight: '40px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white rounded-full p-2.5 flex-shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                AI-powered — may occasionally be inaccurate. Press Enter to send, Shift+Enter for new line.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
