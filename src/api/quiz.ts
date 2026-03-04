export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  explanation: string;
  sourcePage: number;
}

export interface QuizConfig {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  types: string[];
}

const mockQuestions: QuizQuestion[] = [
  {
    id: '1', type: 'multiple-choice',
    question: 'Which of the following best describes the primary advantage of Retrieval-Augmented Generation (RAG) over standard language models?',
    options: ['Faster inference speed', 'Grounded answers from source documents', 'Smaller model size', 'Better creative writing'],
    correctIndex: 1,
    explanation: 'RAG combines retrieval from a knowledge base with generation, ensuring answers are grounded in actual source documents rather than relying solely on parametric knowledge.',
    sourcePage: 12,
  },
  {
    id: '2', type: 'true-false',
    question: 'The document states that the proposed method achieved a 23.4% improvement in accuracy over the baseline.',
    options: ['True', 'False'],
    correctIndex: 0,
    explanation: 'Section 5.1 explicitly states: "Our method achieves a 23.4% improvement in retrieval accuracy compared to the BM25 baseline."',
    sourcePage: 31,
  },
  {
    id: '3', type: 'multiple-choice',
    question: 'According to Section 4.2, what is the recommended chunk size for optimal retrieval performance?',
    options: ['128 tokens', '256 tokens', '512 tokens', '1024 tokens'],
    correctIndex: 2,
    explanation: 'The authors found that 512-token chunks provided the best balance between context preservation and retrieval precision in their experiments.',
    sourcePage: 22,
  },
  {
    id: '4', type: 'true-false',
    question: 'The authors recommend using cosine similarity over dot product for embedding comparison in high-dimensional spaces.',
    options: ['True', 'False'],
    correctIndex: 0,
    explanation: 'Table 3 shows that cosine similarity consistently outperformed dot product across all tested embedding dimensions.',
    sourcePage: 27,
  },
  {
    id: '5', type: 'multiple-choice',
    question: 'What embedding model was used in the primary experiments described in the paper?',
    options: ['Word2Vec', 'GloVe', 'OpenAI text-embedding-ada-002', 'BERT base'],
    correctIndex: 2,
    explanation: 'The authors chose text-embedding-ada-002 for its strong performance on the MTEB benchmark and cost efficiency at scale.',
    sourcePage: 18,
  },
  {
    id: '6', type: 'short-answer',
    question: 'What is the key difference between sparse and dense retrieval methods as described in the paper?',
    correctAnswer: 'Sparse retrieval uses exact keyword matching (like BM25) while dense retrieval uses learned vector representations to capture semantic similarity.',
    explanation: 'The paper dedicates Section 2.3 to contrasting these approaches, noting that dense retrieval captures semantic meaning while sparse methods rely on lexical overlap.',
    sourcePage: 8,
  },
  {
    id: '7', type: 'multiple-choice',
    question: 'What evaluation metric did the authors primarily use to measure retrieval quality?',
    options: ['BLEU score', 'Mean Reciprocal Rank (MRR)', 'Perplexity', 'F1 Score'],
    correctIndex: 1,
    explanation: 'MRR was chosen as the primary metric because it effectively captures whether the most relevant passage appears at the top of the ranked retrieval results.',
    sourcePage: 24,
  },
  {
    id: '8', type: 'true-false',
    question: 'The paper concludes that fine-tuning the embedding model on domain-specific data provides no significant improvement.',
    options: ['True', 'False'],
    correctIndex: 1,
    explanation: 'On the contrary, Section 6.2 demonstrates that domain-specific fine-tuning improved MRR by 11.2% on the medical dataset and 8.7% on the legal dataset.',
    sourcePage: 38,
  },
];

export const generateQuiz = async (_docId: string, config: QuizConfig): Promise<QuizQuestion[]> => {
  await new Promise(r => setTimeout(r, 2000));
  const filtered = mockQuestions.filter(q => config.types.includes(q.type));
  const pool = filtered.length > 0 ? filtered : mockQuestions;
  return pool.slice(0, config.numQuestions);
};

export interface GradeResult {
  result: 'correct' | 'partial' | 'incorrect';
  feedback: string;
}

export const gradeShortAnswer = async (_questionId: string, _userAnswer: string): Promise<GradeResult> => {
  await new Promise(r => setTimeout(r, 1000));
  const outcomes: GradeResult[] = [
    { result: 'correct', feedback: 'Your answer accurately captures the key distinction.' },
    { result: 'partial', feedback: 'You identified one aspect correctly, but missed the role of semantic similarity in dense retrieval.' },
    { result: 'incorrect', feedback: 'The answer does not address the core difference between sparse and dense retrieval methods.' },
  ];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
};
