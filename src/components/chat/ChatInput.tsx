import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="border-t border-border/20 p-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => onSend('Summarize this document')}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border/30 rounded-full text-muted-foreground hover:text-foreground hover:border-border transition-all font-body"
          aria-label="Summarize document"
        >
          <Sparkles className="w-3 h-3" /> Summarize
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about this document..."
          disabled={disabled}
          className="flex-1 bg-surface border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-body"
          aria-label="Chat input"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
