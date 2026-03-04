import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatMessageComponent = ({ role, content, timestamp }: ChatMessageProps) => {
  const copyToClipboard = () => navigator.clipboard.writeText(content);

  // Simple markdown rendering
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="font-display text-lg text-primary mt-3 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-border pl-3 text-muted-foreground italic my-2 text-sm">{line.slice(2)}</blockquote>;
      if (line.startsWith('- ')) {
        const formatted = formatInline(line.slice(2));
        return <li key={i} className="ml-4 list-disc text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (/^\d+\. /.test(line)) {
        const formatted = formatInline(line.replace(/^\d+\. /, ''));
        return <li key={i} className="ml-4 list-decimal text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
    });
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-background rounded text-xs">$1</code>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {role === 'assistant' && (
        <div className="w-7 h-7 rounded-full bg-surface border border-border/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-display text-primary">D</span>
        </div>
      )}
      <div className={`max-w-[80%] group relative ${
        role === 'user'
          ? 'bg-surface rounded-2xl rounded-br-sm px-4 py-3 text-foreground'
          : 'text-foreground'
      }`}>
        <div className="font-body leading-relaxed">{renderMarkdown(content)}</div>
        {role === 'assistant' && (
          <button
            onClick={copyToClipboard}
            className="absolute -top-2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface rounded"
            aria-label="Copy message"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessageComponent;
