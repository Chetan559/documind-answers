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
  { id: 'acceptance', title: '1. Acceptance of Terms', content: 'By accessing or using DocuMind, you agree to be bound by these Terms of Service and our Privacy Policy. If you are using DocuMind on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these terms.' },
  { id: 'service', title: '2. Description of Service', content: 'DocuMind is an AI-powered document intelligence platform that enables users to upload PDF documents, ask questions, generate quizzes, create annotations, and export citations. The service is subject to change, and we will provide reasonable notice of material changes.' },
  { id: 'registration', title: '3. Account Registration', content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials. One account per person. You must be at least 13 years old to use DocuMind.' },
  { id: 'acceptable-use', title: '4. Acceptable Use', content: 'You may not:\n\n• Upload illegal, harmful, or infringing content.\n• Attempt to reverse-engineer, decompile, or extract the AI models or algorithms.\n• Use the service to harm, harass, or defraud others.\n• Scrape, crawl, or bulk-export data from the platform.\n• Resell or redistribute access to DocuMind without written permission.\n• Interfere with the service infrastructure or circumvent rate limits.' },
  { id: 'your-content', title: '5. Your Content', content: 'You retain full ownership of all documents you upload. By uploading documents, you grant DocuMind a limited, non-exclusive license to process them solely for the purpose of providing the service. You represent that you have the necessary rights to the documents you upload.' },
  { id: 'ip', title: '6. Intellectual Property', content: 'DocuMind owns all rights to the platform, user interface, AI infrastructure, and underlying technology. You retain all rights to your documents, annotations, highlights, and any content you create within the platform.' },
  { id: 'payment', title: '7. Payment & Billing', content: 'Pro and Enterprise plans are billed monthly or annually, depending on your selection. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial billing periods except where required by applicable law. Prices may change with at least 30 days written notice.' },
  { id: 'disclaimers', title: '8. Disclaimers', content: 'The service is provided "as is" and "as available." AI-generated responses may contain errors or inaccuracies — always verify important information against the source document. DocuMind is not a substitute for professional legal, medical, or financial advice.' },
  { id: 'liability', title: '9. Limitation of Liability', content: 'To the maximum extent permitted by law, DocuMind shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability is limited to the amount you paid to DocuMind in the 12 months preceding the claim.' },
  { id: 'termination', title: '10. Termination', content: 'DocuMind may suspend or terminate accounts that violate these terms, with or without notice. You may delete your account at any time through your account settings. Upon termination, your data will be handled according to our Privacy Policy.' },
  { id: 'governing-law', title: '11. Governing Law', content: 'These terms are governed by the laws of the State of Delaware, USA. Any disputes arising from these terms shall be resolved through binding arbitration, except that either party may seek injunctive relief in a court of competent jurisdiction.' },
  { id: 'contact', title: '12. Contact', content: 'For questions about these Terms of Service:\n\nEmail: legal@documind.app\nMailing address: DocuMind Inc., 548 Market St, Suite 36000, San Francisco, CA 94104' },
];

const Terms = () => {
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
            Terms of Service
          </motion.h1>
          <motion.p {...fade(0.1)} className="text-sm text-muted-foreground font-body">
            Last updated: January 15, 2025
          </motion.p>
        </div>
        <div className="max-w-7xl mx-auto mt-16 border-t border-border/10" />
      </section>

      <section className="pb-24">
        <div className="max-w-[960px] mx-auto px-6 flex gap-12">
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

          <div className="max-w-[680px]">
            {sections.map((s, i) => (
              <motion.div key={s.id} id={s.id} {...fade(i * 0.03)} className="mb-12">
                <h2 className="font-display text-xl text-foreground mb-4">{s.title}</h2>
                <p className="text-base text-foreground font-body leading-[1.8] whitespace-pre-line">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
