export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockResponses: Record<string, string> = {
  default: `Based on the document, here are the key findings:\n\n1. **Primary Conclusion**: The research demonstrates a significant improvement in accuracy when using the proposed methodology.\n\n2. **Key Metrics**:\n   - Accuracy increased by **23.4%**\n   - Processing time reduced by **40%**\n   - Error rate dropped to **0.3%**\n\n3. **Recommendations**: The authors suggest further investigation into edge cases, particularly in sections 4.2 and 7.1 of the document.\n\n> "The results clearly indicate that our approach outperforms existing baselines across all evaluated metrics." — Page 12`,
  summarize: `## Document Summary\n\nThis document covers the following main topics:\n\n- **Introduction** (Pages 1-5): Background and motivation for the research\n- **Methodology** (Pages 6-15): Detailed description of the RAG pipeline architecture\n- **Results** (Pages 16-28): Comprehensive evaluation against baseline models\n- **Discussion** (Pages 29-38): Analysis of limitations and future work\n\nThe core thesis is that retrieval-augmented generation significantly improves factual accuracy in document question-answering tasks.`,
};

export const sendMessage = async (docId: string, question: string): Promise<ChatMessage> => {
  await new Promise(r => setTimeout(r, 1200));
  const isSum = question.toLowerCase().includes('summar');
  return {
    id: Math.random().toString(36).slice(2),
    role: 'assistant',
    content: isSum ? mockResponses.summarize : mockResponses.default,
    timestamp: new Date(),
  };
};
