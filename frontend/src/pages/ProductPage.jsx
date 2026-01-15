import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Wand2, Eye, Layout, Edit3, Zap, FolderOpen, 
  CheckCircle2, ArrowRight, ChevronDown, Check, Lock
} from 'lucide-react';
import ProductHeader from '../components/ProductHeader';

const ProductPage = ({ navigate }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* FIXED HEADER */}
      <ProductHeader navigate={navigate} />
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100 to-white">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.1) 0%, transparent 50%)`
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fadeIn">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Create High-Performing<br />
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                LinkedIn Posts in Minutes
              </span>
            </h1>
          </div>

          <div className="animate-fadeInDelay" style={{ animationDelay: '0.2s' }}>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Write, format, and refine professional LinkedIn posts using AI — with previews that look exactly like LinkedIn.
            </p>
          </div>

          <div className="animate-slideUp flex items-center justify-center gap-4" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => navigate('/app')}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            
            <a
              href="#features"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-purple-600 hover:text-purple-600 transition-all duration-300"
            >
              View Features
            </a>
          </div>

          <div className="mt-16 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-gray-500 mb-6">Trusted by creators, founders, and marketers</p>
            <div className="flex items-center justify-center gap-12 opacity-40 grayscale">
              <div className="text-2xl font-bold">BRAND</div>
              <div className="text-2xl font-bold">BRAND</div>
              <div className="text-2xl font-bold">BRAND</div>
              <div className="text-2xl font-bold">BRAND</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" data-animate className="py-24 bg-gray-50" style={{ opacity: isVisible('features') ? 1 : 0, transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease-out' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Win on LinkedIn</h2>
            <p className="text-xl text-gray-600">Professional tools, AI-powered, built for creators</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Wand2 className="w-8 h-8 text-purple-600" />, title: 'AI LinkedIn Post Generator', desc: 'Topic → AI → Perfect Post' },
              { icon: <Eye className="w-8 h-8 text-purple-600" />, title: 'Pixel-Perfect LinkedIn Preview', desc: 'See exactly how it looks — Desktop & Mobile' },
              { icon: <Layout className="w-8 h-8 text-purple-600" />, title: 'Smart Templates', desc: 'Viral, story-based, authority posts' },
              { icon: <Edit3 className="w-8 h-8 text-purple-600" />, title: 'AI Post Formatter', desc: 'Bold, bullets, perfect spacing' },
              { icon: <Zap className="w-8 h-8 text-purple-600" />, title: 'AI Corrections & Edits', desc: '"Add 2 more points", "Make it sharper"' },
              { icon: <FolderOpen className="w-8 h-8 text-purple-600" />, title: 'Drafts & Snippets', desc: 'Save & reuse your best content' }
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                style={{ 
                  opacity: isVisible('features') ? 1 : 0,
                  transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease-out ${i * 0.1}s`
                }}
              >
                <div className="mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section id="why" data-animate className="py-24 bg-white" style={{ opacity: isVisible('why') ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built Specifically for LinkedIn</h2>
              <div className="space-y-4">
                {[
                  'Real LinkedIn layout preview — not generic AI output',
                  'Creator-style templates that actually work',
                  'Zero learning curve — start creating in seconds',
                  'Works even without writing skills'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full" />
                  <div>
                    <div className="font-semibold">Your Name</div>
                    <div className="text-sm text-gray-600">Your Title</div>
                  </div>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  This is exactly how your post will look on LinkedIn.<br /><br />
                  No surprises. No formatting issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" data-animate className="py-24 bg-gradient-to-br from-purple-50 to-white" style={{ opacity: isVisible('how') ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: 1, text: 'Choose a topic or template' },
              { step: 2, text: 'Generate with AI' },
              { step: 3, text: 'Edit with AI corrections' },
              { step: 4, text: 'Preview like LinkedIn' },
              { step: 5, text: 'Copy & post' }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm"
                style={{
                  opacity: isVisible('how') ? 1 : 0,
                  transform: isVisible('how') ? 'translateX(0)' : 'translateX(-30px)',
                  transition: `all 0.5s ease-out ${i * 0.1}s`
                }}
              >
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-lg text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" data-animate className="py-24 bg-white" style={{ opacity: isVisible('pricing') ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Simple, Transparent Pricing</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE */}
            <div className="relative bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-600 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-1 rounded-full text-sm font-semibold">
                RECOMMENDED
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">$0</div>
                <p className="text-gray-600">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['AI Post Generator', '10+ Templates', 'LinkedIn Preview', 'Copy to Clipboard'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/app')}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Free
              </button>
            </div>

            {/* PRO */}
            <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-5xl font-bold text-gray-900 mb-2">$19</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', '200+ Advanced Templates', 'AI Image Generation', 'Snippets Library', 'Priority AI Access'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button disabled className="w-full py-4 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Coming Soon
              </button>
            </div>
          </div>

          {/* Free Explainer */}
          <div className="mt-12 bg-purple-50 p-8 rounded-xl max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              {['No credit card required', 'No signup required', 'Upgrade anytime'].map((text, i) => (
                <div key={i} className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  <p className="text-lg text-gray-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-animate className="py-24 bg-gray-50" style={{ opacity: isVisible('faq') ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this really free?', a: 'Yes! The free tier includes AI post generation, templates, and LinkedIn preview. No credit card required, ever.' },
              { q: 'Does it post to LinkedIn automatically?', a: 'Not yet. You copy the post and paste it manually on LinkedIn. Auto-posting is coming in Pro.' },
              { q: 'Is my data saved?', a: 'Drafts are saved locally in your browser. We don\'t store your posts on our servers in the free tier.' },
              { q: 'Can I upgrade later?', a: 'Absolutely! Upgrade to Pro anytime to unlock advanced templates, AI images, and priority access.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-gray-600">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Start Creating Better LinkedIn Posts Today</h2>
          <p className="text-xl mb-10 opacity-90">No signup. No credit card. Start in seconds.</p>
          <button
            onClick={() => navigate('/app')}
            className="px-12 py-5 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
          >
            Start Free Now →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 LinkedIn Post Generator. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDelay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-fadeInDelay { animation: fadeInDelay 1s ease-out; animation-fill-mode: both; }
        .animate-slideUp { animation: slideUp 1s ease-out; animation-fill-mode: both; }
      `}</style>
    </div>
  );
};

export default ProductPage;