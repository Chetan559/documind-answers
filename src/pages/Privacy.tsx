import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const sections = [
  {
    id: 'collect', title: '1. Information We Collect',
    content: `We collect the following categories of information:\n\n• **Account information** — your email address and display name when you register.\n• **Uploaded documents** — PDF files you upload to the platform for processing.\n• **Usage data** — queries, chat sessions, quiz attempts, and feature usage patterns.\n• **Payment information** — handled entirely by Stripe. DocuMind does not store credit card numbers or bank details.\n• **Device and browser information** — browser type, operating system, and IP address for security and analytics purposes.`,
  },
  {
    id: 'use', title: '2. How We Use Your Information',
    content: `We use your information to:\n\n• Provide the DocuMind service, including document processing, chat, quiz generation, and citation export.\n• Improve the AI — only through aggregated, anonymized usage patterns. **We never use your document content for model training.**\n• Send transactional emails such as account verification, password resets, and billing receipts.\n• Prevent abuse and enforce our Terms of Service.`,
  },
  {
    id: 'documents', title: '3. Your Documents',
    content: `**Documents uploaded to DocuMind are never used to train AI models.** Your documents are stored encrypted at rest using AES-256 encryption. You can delete any document at any time, and it will be permanently removed from our systems within 30 days. During the deletion window, the document is immediately inaccessible to you and our AI systems.`,
  },
  {
    id: 'sharing', title: '4. Data Sharing',
    content: `We do not sell personal data. We share data only with the following third-party service providers, solely to operate the service:\n\n• **Cloud infrastructure** (AWS) — hosting, storage, and compute.\n• **Payment processing** (Stripe) — subscription billing and payment handling.\n• **Analytics** (anonymized only) — aggregated usage patterns to improve the product. No personally identifiable information is shared with analytics providers.`,
  },
  {
    id: 'retention', title: '5. Data Retention',
    content: `• **Account data** — retained while your account is active, plus 90 days after account deletion.\n• **Documents** — deleted immediately upon user request. Permanently purged within 30 days.\n• **Chat session history** — retained for 1 year, then automatically purged.\n• **Usage analytics** — aggregated data retained indefinitely; individual session logs purged after 90 days.`,
  },
  {
    id: 'rights', title: '6. Your Rights',
    content: `You have the right to:\n\n• **Access** — request a copy of all personal data we hold about you.\n• **Correction** — update or correct inaccurate information.\n• **Deletion** — request permanent deletion of your account and all associated data.\n• **Data portability** — export your data in a machine-readable format.\n• **Opt-out** — disable anonymized analytics collection from your account settings.\n\nTo exercise any of these rights, contact us at privacy@documind.app.`,
  },
  {
    id: 'cookies', title: '7. Cookies',
    content: `We use strictly necessary cookies only — specifically for session authentication. We do not use advertising cookies, tracking pixels, or third-party tracking of any kind.`,
  },
  {
    id: 'children', title: "8. Children's Privacy",
    content: `DocuMind is not directed at children under 13. We do not knowingly collect personal information from minors. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly.`,
  },
  {
    id: 'changes', title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we do, we will notify you by email and display an in-app banner. Continued use of DocuMind after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact', title: '10. Contact',
    content: `For privacy-related inquiries:\n\n**Email:** privacy@documind.app\n**Mailing address:** Ahmedabad, Gujarat, India 🇮🇳`,
  },
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="max-w-[680px] mx-auto px-6">
          <motion.h1 {...fade()} className="font-display text-4xl sm:text-[52px] leading-tight text-foreground mb-4">
            Privacy Policy
          </motion.h1>
          <motion.p {...fade(0.1)} className="text-sm text-muted-foreground font-body">
            Last updated: January 15, 2025
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
      </section>

      <section className="pb-24">
        <div className="max-w-[960px] mx-auto px-6 flex gap-12">
          {/* Sticky sidebar */}
          <nav className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block text-xs font-body py-1 transition-colors ${
                    activeSection === s.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="max-w-[680px]">
            {sections.map((s, i) => (
              <motion.div key={s.id} id={s.id} {...fade(i * 0.03)} className="mb-12">
                <h2 className="font-display text-xl text-foreground mb-4">{s.title}</h2>
                <div className="text-base text-foreground font-body leading-[1.8] whitespace-pre-line prose-strong:text-foreground">
                  {s.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
