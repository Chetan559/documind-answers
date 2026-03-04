import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Footer = () => {
  const linkGroups = [
    { title: 'Product', links: ['Features', 'Pricing', 'API'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers'] },
    { title: 'Legal', links: ['Privacy', 'Terms'] },
  ];

  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-display text-lg text-primary">DocuMind</span>
            </Link>
            <p className="text-sm text-muted-foreground font-body">Read Less. Know More.</p>
          </div>
          {linkGroups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-body font-semibold text-foreground mb-4">{g.title}</h4>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground font-body">© 2025 DocuMind Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
