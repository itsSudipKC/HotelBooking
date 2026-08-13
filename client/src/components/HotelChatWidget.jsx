import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { chatWithHotel } from '../services/hotelService';

const HotelChatWidget = ({ hotelId, hotelName }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          text: `Hi! Ask me anything about ${hotelName} — check-in/out times, amenities, room types, parking, and more.`,
        },
      ]);
    }
  }, [open, hotelName, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setSending(true);
    try {
      const res = await chatWithHotel(hotelId, question);
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:text-brand-600"
      >
        <MessageCircle className="h-4 w-4" />
        Chat With Us
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-4 sm:items-center sm:justify-center">
          <div className="flex h-[520px] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-brand-600 px-4 py-3">
              <p className="text-sm font-semibold text-white">Chat about {hotelName}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <p className="max-w-[85%] rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-400">Typing…</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="rounded-lg bg-brand-600 p-2.5 text-white transition hover:bg-brand-700 disabled:bg-brand-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelChatWidget;
