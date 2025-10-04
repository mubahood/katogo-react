// src/app/pages/static/Help.tsx
import React, { useState } from 'react';
import { Film, Tv, ShoppingCart, Users, CreditCard, Play, HelpCircle, Mail, MessageCircle, Phone, ChevronDown } from 'react-feather';
import { COMPANY_INFO } from '../../constants';
import './Help.css';

const Help: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const quickLinks = [
    { icon: <CreditCard />, text: 'My Subscription', href: '/account/subscriptions' },
    { icon: <Film />, text: 'Watch Movies', href: '/movies' },
    { icon: <Tv />, text: 'Watch Series', href: '/series' },
    { icon: <ShoppingCart />, text: 'Buy & Sell', href: '/products' },
    { icon: <Users />, text: 'Connect', href: '/connect' },
    { icon: <HelpCircle />, text: 'My Account', href: '/account' }
  ];

  const faqData = [
    {
      id: 'subscriptions',
      icon: <CreditCard />,
      category: "Subscriptions & Payments",
      questions: [
        {
          id: 'sub-1',
          question: "How do I subscribe to UgFlix?",
          answer: "Click on 'My Subscription' in the menu or visit your Account page. Choose your preferred plan (Daily, Weekly, or Monthly) and complete payment via Mobile Money, Bank Card, or Bank Transfer."
        },
        {
          id: 'sub-2',
          question: "What payment methods are available?",
          answer: "We accept Mobile Money (MTN, Airtel Money), Visa/Mastercard credit/debit cards, and Bank Transfers. All payments are processed securely."
        },
        {
          id: 'sub-3',
          question: "Can I cancel my subscription?",
          answer: "Yes, you can cancel anytime from your Account > Subscriptions page. You'll continue to have access until the end of your current billing period."
        },
        {
          id: 'sub-4',
          question: "Will my subscription auto-renew?",
          answer: "Subscriptions do not auto-renew. You'll receive reminders before expiry and can manually renew when ready."
        }
      ]
    },
    {
      id: 'movies-series',
      icon: <Film />,
      category: "Movies & Series",
      questions: [
        {
          id: 'mov-1',
          question: "How do I watch movies?",
          answer: "Browse our movie collection, click on any movie you like, and click the Play button. You need an active subscription to watch full movies."
        },
        {
          id: 'mov-2',
          question: "Can I download movies to watch offline?",
          answer: "Currently, all content is streamed online. We're working on adding download functionality for premium subscribers."
        },
        {
          id: 'mov-3',
          question: "What languages are available?",
          answer: "Most of our content features Luganda translations by popular VJs. You can filter by specific VJs to find your favorite dubbed content."
        },
        {
          id: 'mov-4',
          question: "How often is new content added?",
          answer: "We add new movies and series regularly. Check the 'New Releases' section or follow us on social media for updates."
        }
      ]
    },
    {
      id: 'buy-sell',
      icon: <ShoppingCart />,
      category: "Buy & Sell Marketplace",
      questions: [
        {
          id: 'buy-1',
          question: "How do I post a product for sale?",
          answer: "Go to Account > Post Product, fill in the details, upload photos, set your price, and submit. Your product will be reviewed and published within 24 hours."
        },
        {
          id: 'buy-2',
          question: "How do I buy products?",
          answer: "Browse products, click on items you like, and use the 'Chat with Seller' button to negotiate. Complete the transaction directly with the seller."
        },
        {
          id: 'buy-3',
          question: "Is there buyer protection?",
          answer: "We verify sellers and moderate listings. However, transactions happen directly between buyers and sellers. Always meet in safe public places."
        },
        {
          id: 'buy-4',
          question: "Are there any fees for posting?",
          answer: "Posting products is completely free. We only charge a small commission on premium listing features (optional)."
        }
      ]
    },
    {
      id: 'connect',
      icon: <Users />,
      category: "Connect & Chat",
      questions: [
        {
          id: 'con-1',
          question: "What is the Connect feature?",
          answer: "Connect is our social feature where you can meet new people, chat, and build your network within the UgFlix community."
        },
        {
          id: 'con-2',
          question: "How do I start chatting?",
          answer: "Visit the Connect page, browse profiles, and click 'Start Chat' on anyone you'd like to connect with. You can also chat with product sellers."
        },
        {
          id: 'con-3',
          question: "Is messaging free?",
          answer: "Yes, all messaging features are completely free for registered users."
        },
        {
          id: 'con-4',
          question: "How do I report inappropriate content?",
          answer: "Click the three-dot menu on any message or profile and select 'Report'. Our team reviews all reports within 24 hours."
        }
      ]
    },
    {
      id: 'account',
      icon: <HelpCircle />,
      category: "Account & Technical",
      questions: [
        {
          id: 'acc-1',
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email or phone number, and follow the instructions sent to you."
        },
        {
          id: 'acc-2',
          question: "Can I use UgFlix on multiple devices?",
          answer: "Yes, you can access your account on multiple devices. However, only one device can stream content at a time."
        },
        {
          id: 'acc-3',
          question: "Why is video buffering or slow?",
          answer: "Check your internet connection. We recommend at least 2Mbps for standard quality and 5Mbps for HD. Lower quality in settings if needed."
        },
        {
          id: 'acc-4',
          question: "How do I delete my account?",
          answer: "Contact support via email or WhatsApp to request account deletion. Note that this action is permanent and cannot be undone."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqData = searchQuery
    ? faqData.map(section => ({
        ...section,
        questions: section.questions.filter(
          q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.questions.length > 0)
    : faqData;

  return (
    <div className="help-container">
      {/* Page Header */}
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>Find answers to common questions about UgFlix</p>
      </div>

      {/* Search Help */}
      <div className="help-search">
        <input
          type="text"
          className="help-search-input"
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Links */}
      <div className="help-quick-links">
        {quickLinks.map((link, index) => (
          <a key={index} href={link.href} className="help-quick-link">
            {link.icon}
            <span className="help-quick-link-text">{link.text}</span>
          </a>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="help-faq-sections">
        {filteredFaqData.map((section) => (
          <div key={section.id} className="help-faq-section">
            <div className="help-faq-section-title">
              {section.icon}
              <h2>{section.category}</h2>
            </div>
            <div className="help-faq-items">
              {section.questions.map((faq) => (
                <div
                  key={faq.id}
                  className={`help-faq-item ${openFaqId === faq.id ? 'open' : ''}`}
                >
                  <div
                    className="help-faq-question"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <p className="help-faq-question-text">{faq.question}</p>
                    <ChevronDown className="help-faq-icon" />
                  </div>
                  <div className="help-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support Section */}
      <div className="help-contact-section">
        <h2>Still Need Help?</h2>
        <p style={{ fontSize: '12px', color: 'var(--dark-text-secondary, #E0E0E0)', marginBottom: '10px' }}>
          Contact our support team through your preferred channel
        </p>
        <div className="help-contact-methods">
          <div className="help-contact-card">
            <div className="help-contact-card-header">
              <MessageCircle />
              <h3>WhatsApp</h3>
            </div>
            <p>Quick response via WhatsApp chat</p>
            <a
              href={`https://wa.me/${COMPANY_INFO.WHATSAPP?.replace(/\D/g, '') || '256700000000'}?text=Hi, I need help with UgFlix`}
              target="_blank"
              rel="noopener noreferrer"
              className="help-contact-link"
            >
              <MessageCircle />
              Chat on WhatsApp
            </a>
          </div>

          <div className="help-contact-card">
            <div className="help-contact-card-header">
              <Mail />
              <h3>Email</h3>
            </div>
            <p>Send us a detailed message</p>
            <a
              href={`mailto:${COMPANY_INFO.EMAIL || 'support@ugflix.com'}`}
              className="help-contact-link"
            >
              <Mail />
              Send Email
            </a>
          </div>

          <div className="help-contact-card">
            <div className="help-contact-card-header">
              <Phone />
              <h3>Phone</h3>
            </div>
            <p>Call us for immediate assistance</p>
            <a
              href={`tel:${COMPANY_INFO.PHONE || '+256700000000'}`}
              className="help-contact-link"
            >
              <Phone />
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
