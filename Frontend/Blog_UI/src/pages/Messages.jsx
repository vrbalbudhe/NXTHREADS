import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquareDashed,
  MessagesSquare,
  Search,
  SendHorizontal,
  Smile,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useChatContext } from "../Context/ChatContext";
import { useConversation } from "../hooks/useConversation";
import { displayName, formatDate, formatTime, timeAgo } from "../lib/format";
import { useShellTitle } from "../Components/layout/ShellContext";
import { useUserLookup } from "../Components/widgets/Widgets";
import Avatar from "../Components/ui/Avatar";
import { EmptyState, ErrorNote, Skeleton, Spinner } from "../Components/ui/Feedback";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "😢"];

function ContactList({ contacts, loading, error, selectedId, onSelect, typing }) {
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (contact) =>
        contact.username?.toLowerCase().includes(term) ||
        contact.fullname?.toLowerCase().includes(term)
    );
  }, [contacts, filter]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-3 dark:border-line-dark">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search conversations"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ErrorNote message={error} />
        {loading && contacts.length === 0 ? (
          <div className="space-y-1 p-2">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title={filter ? "No matches" : "No conversations yet"}
            description={filter ? undefined : "Follow people to start chatting with them."}
            action={
              filter ? null : (
                <Link to="/people" className="btn btn-primary btn-sm">
                  Find people
                </Link>
              )
            }
          />
        ) : (
          <ul className="space-y-0.5 p-2">
            {visible.map((contact) => {
              const active = contact.id === selectedId;
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(contact.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                      active
                        ? "bg-slate-100 dark:bg-white/[0.06]"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <PresenceAvatar user={contact} online={contact.online} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                          {displayName(contact)}
                        </span>
                        {contact.lastMessageAt && (
                          <span className="shrink-0 text-[10px] muted">
                            {timeAgo(contact.lastMessageAt)}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-xs ${contact.unreadCount ? "font-semibold text-slate-800 dark:text-slate-100" : "muted"}`}
                        >
                          {typing[contact.id] ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              typing…
                            </span>
                          ) : (
                            contact.lastMessage || `@${contact.username}`
                          )}
                        </span>
                        {contact.unreadCount > 0 && (
                          <span className="min-w-5 shrink-0 rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-bold leading-5 text-white">
                            {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function PresenceAvatar({ user, online }) {
  return (
    <span className="relative shrink-0">
      <Avatar user={user} size="md" />
      <span
        aria-label={online ? "Online" : "Offline"}
        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-panel-dark ${
          online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
        }`}
      />
    </span>
  );
}

function groupByDay(messages) {
  const groups = [];
  for (const message of messages) {
    const day = formatDate(message.createdAt, { weekday: "short", day: "numeric", month: "short" });
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(message);
    else groups.push({ day, items: [message] });
  }
  return groups;
}

const TYPING_IDLE_MS = 3000;
const TYPING_REPEAT_MS = 2500;

function Composer({ onSend, sending, onTyping }) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef(null);
  const typingRef = useRef({ sentAt: 0, timer: null });

  const stopTyping = () => {
    clearTimeout(typingRef.current.timer);
    if (typingRef.current.sentAt) {
      typingRef.current.sentAt = 0;
      onTyping(false);
    }
  };

  useEffect(() => {
    const state = typingRef.current;
    return () => clearTimeout(state.timer);
  }, []);

  const handleChange = (value) => {
    setText(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (now - typingRef.current.sentAt > TYPING_REPEAT_MS) {
      typingRef.current.sentAt = now;
      onTyping(true);
    }
    clearTimeout(typingRef.current.timer);
    typingRef.current.timer = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    stopTyping();
    const ok = await onSend(text);
    if (ok) setText("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="relative border-t border-line p-3 dark:border-line-dark">
      {emojiOpen && (
        <div className="absolute bottom-full left-3 mb-2 grid grid-cols-8 gap-1 rounded-xl border border-line bg-panel p-1.5 shadow-lift dark:border-line-dark dark:bg-panel-dark">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="h-8 w-8 rounded-lg text-base hover:bg-slate-100 dark:hover:bg-white/5"
              onClick={() => {
                handleChange(text + emoji);
                setEmojiOpen(false);
                inputRef.current?.focus();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 rounded-xl border border-line bg-white px-2 py-1 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-line-dark dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setEmojiOpen((value) => !value)}
          className="icon-btn h-8 w-8"
          aria-label="Add emoji"
        >
          <Smile className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={inputRef}
          value={text}
          maxLength={2000}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={stopTyping}
          placeholder="Write a message…"
          className="h-9 flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-50 disabled:text-slate-300 dark:hover:bg-brand-500/10 dark:disabled:text-slate-600"
          aria-label="Send message"
        >
          {sending ? <Spinner /> : <SendHorizontal className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </form>
  );
}

function Conversation({ partner, onBack }) {
  const { currentUser } = useAuth();
  const { connected, typing, sendTyping } = useChatContext();
  const partnerTyping = Boolean(typing[partner.id]);
  const status = !connected
    ? {
        label: "Reconnecting…",
        dot: "bg-amber-500",
        tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      }
    : partnerTyping
      ? {
          label: "typing…",
          dot: "bg-emerald-500",
          tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        }
      : partner.online
        ? {
            label: "Online",
            dot: "bg-emerald-500",
            tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
          }
        : {
            label: "Offline",
            dot: "bg-slate-400",
            tone: "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400",
          };
  const { messages, hasMore, loading, sending, error, loadOlder, send } = useConversation(
    currentUser.userId,
    partner.id
  );
  const bottomRef = useRef(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastId]);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-3 py-2.5 dark:border-line-dark sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="icon-btn md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link to={`/profile/${partner.id}`} className="flex min-w-0 items-center gap-3">
          <PresenceAvatar user={partner} online={partner.online} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">
              {displayName(partner)}
            </span>
            <span className="block truncate text-[11px] muted">@{partner.username}</span>
          </span>
        </Link>
        <span
          aria-live="polite"
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.tone}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-3 py-4 dark:bg-white/[0.01] sm:px-5">
        {hasMore && (
          <div className="mb-3 flex justify-center">
            <button type="button" onClick={loadOlder} className="btn btn-secondary btn-sm">
              Load older messages
            </button>
          </div>
        )}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="ml-auto h-10 w-1/3" />
            <Skeleton className="h-10 w-2/5" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquareDashed}
            title={`Say hi to ${displayName(partner).split(" ")[0]}`}
            description="Messages are delivered instantly when you're both online."
          />
        ) : (
          groups.map((group) => (
            <div key={group.day} className="space-y-1.5">
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-soft dark:bg-panel-dark dark:text-slate-400">
                  {group.day}
                </span>
              </div>
              {group.items.map((message) => {
                const mine = message.senderId === currentUser.userId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 sm:max-w-[65%] ${
                        mine
                          ? "rounded-br-md bg-brand-600 text-white"
                          : "rounded-bl-md border border-line bg-white text-slate-800 dark:border-line-dark dark:bg-panel-dark dark:text-slate-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`mt-0.5 text-right text-[10px] ${mine ? "text-white/70" : "muted"}`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-3 pt-2">
          <ErrorNote message={error} />
        </div>
      )}
      <Composer
        onSend={send}
        sending={sending}
        onTyping={(isTyping) => sendTyping(partner.id, isTyping)}
      />
    </div>
  );
}

export default function Messages() {
  const { contacts, loading, error, typing, setActiveConversation } = useChatContext();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("user");
  const known = contacts.find((contact) => contact.id === selectedId);
  const { user: looked, error: lookupError } = useUserLookup(
    selectedId && !known ? selectedId : null
  );
  const partner = known || looked;
  useShellTitle("Messages");

  useEffect(() => {
    setActiveConversation(selectedId);
    return () => setActiveConversation(null);
  }, [selectedId, setActiveConversation]);

  const select = (id) => setParams(id ? { user: id } : {});

  return (
    <div className="card grid h-[calc(100dvh-10.5rem)] min-h-[420px] overflow-hidden md:grid-cols-[300px_minmax(0,1fr)] lg:h-[calc(100dvh-7rem)]">
      <aside
        className={`min-h-0 border-r border-line dark:border-line-dark ${selectedId ? "hidden md:block" : "block"}`}
      >
        <ContactList
          contacts={contacts}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={select}
          typing={typing}
        />
      </aside>
      <section className={`min-h-0 ${selectedId ? "block" : "hidden md:block"}`}>
        {selectedId && partner ? (
          <Conversation key={partner.id} partner={partner} onBack={() => select(null)} />
        ) : selectedId && lookupError ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessageSquareDashed}
              title="Can't open this conversation"
              description="This person may no longer exist."
              action={
                <button
                  type="button"
                  onClick={() => select(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Back
                </button>
              }
            />
          </div>
        ) : selectedId ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-5 w-5 text-brand-600" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessagesSquare}
              title="Your messages"
              description="Pick a conversation on the left, or message someone from their profile."
            />
          </div>
        )}
      </section>
    </div>
  );
}
