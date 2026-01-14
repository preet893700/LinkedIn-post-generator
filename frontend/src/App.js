import React, { useState, useRef } from 'react';
import { 
  Sparkles, Lock, Undo, Redo, Bold, Italic, Underline, 
  Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, 
  AlignRight, Image, FileText, Save, Upload, HelpCircle, 
  X, Copy, Send, Clock, Star, Check, Monitor, Smartphone
} from 'lucide-react';

// ===========================
// API INTEGRATION
// ===========================
const API_BASE_URL = 'http://localhost:8000/api';

const api = {
  generateFromReference: async (topic, referencePost, templateId) => {
    const res = await fetch(`${API_BASE_URL}/generate/from-reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic, 
        reference_post: referencePost || null,
        template_id: templateId || null
      })
    });
    if (!res.ok) throw new Error('Generation failed');
    return await res.json();
  },
  
  editContent: async (content, action, customInstructions = null) => {
    const res = await fetch(`${API_BASE_URL}/edit/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content,
        custom_instructions: customInstructions 
      })
    });
    if (!res.ok) throw new Error('Edit failed');
    return await res.json();
  }
};

// ===========================
// STATE MANAGEMENT
// ===========================
const useStore = () => {
  const [state, setState] = useState({
    editorContent: '',
    editorHistory: [''],
    historyIndex: 0,
    aiInstruction: '',
    aiEditHistory: [],
    aiHistoryIndex: -1,
    isLoading: false,
    draft: null,
    showGenerateModal: false,
    showTemplateModal: false,
    topicInput: '',
    referencePostText: '',
    selectedTemplate: null,
    favouriteTemplates: [],
    previewMode: 'desktop'
  });

  return {
    ...state,
    setEditorContent: (val) => setState(prev => {
      const newHistory = [...prev.editorHistory.slice(0, prev.historyIndex + 1), val];
      return { ...prev, editorContent: val, editorHistory: newHistory, historyIndex: newHistory.length - 1 };
    }),
    setAiInstruction: (val) => setState(prev => ({ ...prev, aiInstruction: val })),
    undo: () => setState(prev => prev.historyIndex > 0 ? { 
      ...prev, 
      historyIndex: prev.historyIndex - 1, 
      editorContent: prev.editorHistory[prev.historyIndex - 1] 
    } : prev),
    redo: () => setState(prev => prev.historyIndex < prev.editorHistory.length - 1 ? { 
      ...prev, 
      historyIndex: prev.historyIndex + 1, 
      editorContent: prev.editorHistory[prev.historyIndex + 1] 
    } : prev),
    undoAI: () => setState(prev => prev.aiHistoryIndex > 0 ? {
      ...prev,
      aiHistoryIndex: prev.aiHistoryIndex - 1,
      editorContent: prev.aiEditHistory[prev.aiHistoryIndex - 1]
    } : prev),
    redoAI: () => setState(prev => prev.aiHistoryIndex < prev.aiEditHistory.length - 1 ? {
      ...prev,
      aiHistoryIndex: prev.aiHistoryIndex + 1,
      editorContent: prev.aiEditHistory[prev.aiHistoryIndex + 1]
    } : prev),
    applyAIEdit: (newContent) => setState(prev => {
      const newAIHistory = [...prev.aiEditHistory.slice(0, prev.aiHistoryIndex + 1), newContent];
      return {
        ...prev,
        editorContent: newContent,
        aiEditHistory: newAIHistory,
        aiHistoryIndex: newAIHistory.length - 1,
        aiInstruction: ''
      };
    }),
    setIsLoading: (val) => setState(prev => ({ ...prev, isLoading: val })),
    saveDraft: () => setState(prev => ({ 
      ...prev, 
      draft: { editorContent: prev.editorContent, timestamp: new Date().toISOString() } 
    })),
    loadDraft: () => setState(prev => prev.draft ? { 
      ...prev, 
      editorContent: prev.draft.editorContent 
    } : prev),
    setShowGenerateModal: (val) => setState(prev => ({ ...prev, showGenerateModal: val })),
    setShowTemplateModal: (val) => setState(prev => ({ ...prev, showTemplateModal: val })),
    setTopicInput: (val) => setState(prev => ({ ...prev, topicInput: val })),
    setReferencePostText: (val) => setState(prev => ({ ...prev, referencePostText: val })),
    setSelectedTemplate: (val) => setState(prev => ({ 
      ...prev, 
      selectedTemplate: val,
      referencePostText: val ? val.post_body : prev.referencePostText
    })),
    toggleFavourite: (key) => setState(prev => ({
      ...prev,
      favouriteTemplates: prev.favouriteTemplates.includes(key)
        ? prev.favouriteTemplates.filter(k => k !== key)
        : [...prev.favouriteTemplates, key]
    })),
    setPreviewMode: (val) => setState(prev => ({ ...prev, previewMode: val }))
  };
};

// ===========================
// TEMPLATES
// ===========================
const TEMPLATES = [
  {
    key: 'story',
    name: 'Story',
    category: 'Stories',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `Flashback to {Year} when I {Experience}.
↳ I learned:
{Lesson}

Sometimes, looking back is the best way to move forward.`
  },
  {
    key: 'tips',
    name: 'Tips',
    category: 'Tips',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `Everyone's chasing success... but real growth? It's all about {Core Message}. 💥

Here's what I've learned from {Experience/Action}:
- 📌 {Insight 1}
- 📌 {Insight 2}
- 📌 {Insight 3}

Remember, folks, {Concluding Insight}. ✨

PS: Curious... what does {Topic} mean to YOU? 🤔`
  },
  {
    key: 'learnings',
    name: 'Learnings',
    category: 'Learnings',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `After {X} years in {field}, here's what I've learned:

• {Key learning}
• {Another important insight}
• {A surprising discovery}

This experience has taught me {key takeaway}.`
  },
  {
    key: 'guide',
    name: 'Guide/How-To',
    category: 'Guides/How-To',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `After spending {Time Period} {Researching/Working on} {Topic}, I've compiled an all-encompassing guide that covers everything you need to know:

Introduction:
- {Brief Introduction to Topic}

Step-by-Step Process:
1. {Detailed Step 1}
2. {Detailed Step 2}
3. {Detailed Step 3}
4. {And so on...}

Common Pitfalls:
- {Pitfall 1 and how to avoid it}
- {Pitfall 2 and how to avoid it}

Pro Tips:
- {Tip 1}
- {Tip 2}

FAQs:
- {FAQ 1 and Answer}
- {FAQ 2 and Answer}

Whether you're a {Target Audience 1} or a {Target Audience 2}, this guide is designed to take you from {Starting Point} to {End Goal}.

Have questions or want to add your own tips? Drop them below! 🚀`
  },
  {
    key: 'unpopular_opinion',
    name: 'Unpopular Opinion',
    category: 'Unpopular Opinion',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `Unpopular opinion: {Your controversial opinion}.

→ Here's why I think differently:
{Explanation}

Let's debate.`
  },
  {
    key: 'case_study',
    name: 'Case Study',
    category: 'Case Studies',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `Case Study: Transforming {Problem} into {Solution} 🔄

• Challenge: {Brief Challenge}
• Action: {Brief Action Taken}
• Result: {Brief Result}

Insight? {Key Insight}.`
  },
  {
    key: 'celebration',
    name: 'Celebration',
    category: 'Celebration',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `🎉 Milestone Alert 🎉

Just hit {Milestone}! Here's what it took:

→ {Effort 1}
→ {Effort 2}
→ {Effort 3}

Beyond excited for what's next! 🚀`
  },
  {
    key: 'motivation',
    name: 'Motivation',
    category: 'Motivation',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `{Opening hook about challenge}

Here's the twist that changed everything:
→ {Pivotal realization}

Every setback was just a setup for a comeback. 💪`
  },
  {
    key: 'list',
    name: 'List',
    category: 'Lists',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `{Number} things about {Topic}:

1. {Point 1}
2. {Point 2}
3. {Point 3}
4. {Point 4}
5. {Point 5}

Which one resonates with you most?`
  },
  {
    key: 'failure',
    name: 'Failure Story',
    category: 'Failures',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `Oops, I did it again... 🙈

🔻 Blunder: {Specific Failure}
🔺 Recovery: How I {Correction Action}
🔄 Reflection: Why this was a blessing

Your turn – spill your 'oops' moment!`
  }
];

const TEMPLATE_CATEGORIES = [
  { key: 'favourites', name: '★ Favourites' },
  { key: 'all', name: 'All Templates' },
  { key: 'stories', name: 'Stories' },
  { key: 'learnings', name: 'Learnings' },
  { key: 'tips', name: 'Tips' },
  { key: 'lists', name: 'Lists' },
  { key: 'celebration', name: 'Celebration' },
  { key: 'motivation', name: 'Motivation' },
  { key: 'guides', name: 'Guides/How-To' },
  { key: 'case_studies', name: 'Case Studies' },
  { key: 'unpopular_opinion', name: 'Unpopular Opinion' },
  { key: 'failures', name: 'Failures' }
];

// ===========================
// TEMPLATE CARD
// ===========================
const TemplateCard = ({ template, isSelected, isFavourite, onSelect, onToggleFavourite }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-white rounded-lg border transition-all hover:shadow-md ${
        isSelected ? 'border-purple-600 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            FP
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{template.author_name}</div>
            <div className="text-xs text-gray-600 line-clamp-2">{template.author_title}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              {template.timestamp} • 🌐
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite();
            }}
            className="flex-shrink-0"
          >
            <Star className={`w-5 h-5 ${isFavourite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-400'} transition-colors`} />
          </button>
        </div>
        <div className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-6">
          {template.post_body}
        </div>
      </div>
    </button>
  );
};

// ===========================
// TEMPLATE BROWSER MODAL
// ===========================
const TemplateBrowserModal = ({ isOpen, onClose, onSelect, store }) => {
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const filteredTemplates = activeTab === 'favourites'
    ? TEMPLATES.filter(t => store.favouriteTemplates.includes(t.key))
    : activeTab === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category.toLowerCase().replace(/\//g, '') === activeTab.replace(/_/g, ''));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Select Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-1">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === cat.key
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Template Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No templates found.</p>
                <p className="text-sm">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.key}
                    template={template}
                    isSelected={store.selectedTemplate?.key === template.key}
                    isFavourite={store.favouriteTemplates.includes(template.key)}
                    onSelect={() => {
                      store.setSelectedTemplate(template);
                      onClose();
                    }}
                    onToggleFavourite={() => store.toggleFavourite(template.key)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-purple-50 text-center">
          <p className="text-sm text-gray-600">
            🔓 Unlock +100 Extra Post Templates: <a href="#" className="text-purple-600 font-semibold hover:underline">Sign Up Now!</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// GENERATE MODAL
// ===========================
const GenerateModal = ({ isOpen, onClose, onGenerate, store }) => {
  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!store.topicInput.trim()) return;
    try {
      await onGenerate(store.topicInput, store.referencePostText, store.selectedTemplate?.key);
      store.setTopicInput('');
      store.setReferencePostText('');
      store.setSelectedTemplate(null);
      onClose();
    } catch (err) {
      alert('Generation failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Generate Post with AI
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
          <button className="px-4 py-3 text-sm font-semibold text-purple-600 border-b-2 border-purple-600">
            Topic
          </button>
          <button disabled className="px-4 py-3 text-sm font-medium text-gray-400 flex items-center gap-1">
            Text <Lock className="w-3 h-3" />
          </button>
          <button disabled className="px-4 py-3 text-sm font-medium text-gray-400 flex items-center gap-1">
            URL <Lock className="w-3 h-3" />
          </button>
          <button disabled className="px-4 py-3 text-sm font-medium text-gray-400 flex items-center gap-1">
            Video <Lock className="w-3 h-3" />
          </button>
          <button disabled className="px-4 py-3 text-sm font-medium text-gray-400 flex items-center gap-1">
            PDF <Lock className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <textarea
              value={store.topicInput}
              onChange={(e) => store.setTopicInput(e.target.value)}
              placeholder="Enter a topic that you want your post to cover"
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <button
                onClick={() => store.setShowTemplateModal(true)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Browse Templates →
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Paste a LinkedIn post from your favourite creator or browse templates.
            </p>
            <textarea
              value={store.referencePostText}
              onChange={(e) => store.setReferencePostText(e.target.value)}
              placeholder="Paste a LinkedIn post here to mimic its style, tone, and structure..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            />
          </div>

          {store.selectedTemplate && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-900">Selected: {store.selectedTemplate.name}</div>
                  <div className="text-xs text-purple-700 mt-1">{store.selectedTemplate.category}</div>
                </div>
                <button onClick={() => store.setSelectedTemplate(null)} className="text-purple-600 hover:text-purple-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleGenerate}
            disabled={!store.topicInput.trim() || store.isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {store.isLoading ? 'Generating...' : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================
// MAIN APP
// ===========================
const App = () => {
  const store = useStore();
  const editorRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const plainText = store.editorContent.replace(/<[^>]*>/g, '');
  const charCount = plainText.length;
  const wordCount = plainText.trim().split(/\s+/).filter(w => w).length;
  const sentenceCount = (plainText.match(/[.!?]+/g) || []).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200 * 60));

  const handleGenerate = async (topic, referencePost, templateId) => {
    store.setIsLoading(true);
    setError('');
    try {
      const result = await api.generateFromReference(topic, referencePost, templateId);
      store.setEditorContent(result.content);
    } catch (err) {
      setError(err.message);
    } finally {
      store.setIsLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!store.aiInstruction.trim() || !store.editorContent) return;
    store.setIsLoading(true);
    setError('');
    try {
      const result = await api.editContent(plainText, 'improve', store.aiInstruction);
      store.applyAIEdit(result.content);
    } catch (err) {
      setError(err.message);
    } finally {
      store.setIsLoading(false);
    }
  };

  const handleQuickEdit = async (action) => {
    if (!store.editorContent) return;
    store.setIsLoading(true);
    setError('');
    try {
      const result = await api.editContent(plainText, action);
      store.setEditorContent(result.content);
    } catch (err) {
      setError(err.message);
    } finally {
      store.setIsLoading(false);
    }
  };

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      store.setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* TOP TOOLBAR */}
      <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => store.setShowGenerateModal(true)}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Post…
          </button>
          
          <button disabled className="px-2.5 py-1.5 bg-gray-200 text-gray-400 rounded-md text-xs flex items-center gap-1 cursor-not-allowed">
            <Lock className="w-3 h-3" />
            Generate Image
          </button>

          <div className="w-px h-6 bg-purple-200 mx-1" />

          <button onClick={store.undo} disabled={store.historyIndex <= 0} className="p-1.5 hover:bg-purple-100 rounded disabled:opacity-30" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={store.redo} disabled={store.historyIndex >= store.editorHistory.length - 1} className="p-1.5 hover:bg-purple-100 rounded disabled:opacity-30" title="Redo">
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-purple-200 mx-1" />

          <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-purple-100 rounded" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-purple-100 rounded" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-purple-100 rounded" title="Underline">
            <Underline className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('strikeThrough')} className="p-1.5 hover:bg-purple-100 rounded" title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-purple-200 mx-1" />

          <button onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-purple-100 rounded" title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('insertOrderedList')} className="p-1.5 hover:bg-purple-100 rounded" title="Numbered List">
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-purple-200 mx-1" />

          <button onClick={() => applyFormat('justifyLeft')} className="p-1.5 hover:bg-purple-100 rounded" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('justifyCenter')} className="p-1.5 hover:bg-purple-100 rounded" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button onClick={() => applyFormat('justifyRight')} className="p-1.5 hover:bg-purple-100 rounded" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-purple-200 mx-1" />

          <div className="relative group">
            <button className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Touch-Ups
            </button>
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 w-48">
              <button onClick={() => handleQuickEdit('improve')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">✧ Improve</button>
              <button onClick={() => handleQuickEdit('shorten')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">✧ Make shorter</button>
              <button onClick={() => handleQuickEdit('expand')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">✧ Make longer</button>
              <button onClick={() => handleQuickEdit('add-emojis')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">✧ Add emojis</button>
              <button onClick={() => handleQuickEdit('fix-grammar')} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm">✧ Fix grammar</button>
            </div>
          </div>

          <button disabled className="p-1.5 hover:bg-purple-100 rounded opacity-50" title="Attach Image">
            <Image className="w-4 h-4" />
          </button>

          <button disabled className="p-1.5 hover:bg-purple-100 rounded opacity-50" title="Snippets">
            <FileText className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => { store.saveDraft(); alert('Draft saved!'); }} className="px-2 py-1 hover:bg-purple-100 rounded text-sm flex items-center gap-1">
            <Save className="w-3 h-3" />
            Save Draft
          </button>
          <button onClick={() => { store.loadDraft(); alert('Draft loaded!'); }} disabled={!store.draft} className="px-2 py-1 hover:bg-purple-100 rounded text-sm flex items-center gap-1 disabled:opacity-50">
            <Upload className="w-3 h-3" />
            Load Draft
          </button>
          <button className="p-1.5 hover:bg-purple-100 rounded" title="Help">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-purple-100 rounded" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - TWO PANE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - EDITOR */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm flex-1 flex flex-col">
            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={(e) => store.setEditorContent(e.currentTarget.innerHTML)}
              className="flex-1 p-6 overflow-y-auto focus:outline-none"
              dangerouslySetInnerHTML={{ __html: store.editorContent }}
              style={{ minHeight: '300px' }}
              data-placeholder="Write Your Post

Struggling to hit your [goal]? Give this approach a try."
            />

            {/* Live Stats Bar */}
            <div className="border-t border-gray-200 px-6 py-2 bg-gray-50 text-xs text-gray-600 flex items-center gap-4">
              <span>Characters: {charCount}</span>
              <span>Words: {wordCount}</span>
              <span>Sentences: {sentenceCount}</span>
              <span className="flex items-center gap-1">
                Reading Time: {readingTime} sec
              </span>
            </div>
          </div>

          {/* AI CORRECTION CHAT */}
          <div className="mt-4 bg-white rounded-lg border border-gray-300 shadow-sm p-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={store.undoAI} 
                disabled={store.aiHistoryIndex <= 0}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-30" 
                title="Undo AI Change"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={store.redoAI} 
                disabled={store.aiHistoryIndex >= store.aiEditHistory.length - 1}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-30" 
                title="Redo AI Change"
              >
                <Redo className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={store.aiInstruction}
                onChange={(e) => store.setAiInstruction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIEdit()}
                placeholder="Ask AI what to change, e.g., 'add 2 more points to the list'"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!store.editorContent || store.isLoading}
              />

              <button
                onClick={handleAIEdit}
                disabled={!store.aiInstruction.trim() || !store.editorContent || store.isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {store.isLoading ? 'Processing...' : (
                  <>
                    Edit Post
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-[480px] flex-shrink-0 p-4 overflow-y-auto flex flex-col" style={{ background: 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)' }}>
          {/* Preview Mode Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Post Preview</h3>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => store.setPreviewMode('desktop')}
                className={`p-2 rounded ${store.previewMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => store.setPreviewMode('mobile')}
                className={`p-2 rounded ${store.previewMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${store.previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-[420px] mx-auto'}`}>
            {/* LinkedIn Post Card */}
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  FP
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">Fernando</div>
                  <div className="text-sm text-gray-600">Founder at aiCarousels</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">12h • 🌐</div>
                </div>
              </div>

              <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {plainText || <span className="text-gray-400 italic">Your post will appear here...</span>}
              </div>

              {plainText && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    👍 64
                  </div>
                  <div className="text-xs text-gray-500">27 comments • 4 reposts</div>
                </div>
              )}
            </div>

            {/* Engagement Buttons */}
            {plainText && (
              <div className="border-t border-gray-200 px-4 py-2">
                <div className="grid grid-cols-4 gap-1">
                  {['Like', 'Comment', 'Share', 'Send'].map(action => (
                    <button key={action} className="py-2 text-sm text-gray-600 hover:bg-gray-50 rounded font-medium flex items-center justify-center gap-1">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white border-t border-gray-300 px-4 py-3 flex items-center justify-center gap-3 flex-shrink-0">
        <button
          onClick={handleCopy}
          disabled={!store.editorContent}
          className="px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy To Clipboard'}
        </button>

        <button
          disabled
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-not-allowed flex items-center gap-2 opacity-50"
        >
          <Lock className="w-4 h-4" />
          Post On LinkedIn
        </button>
      </div>

      {/* Template Browser Modal */}
      <TemplateBrowserModal
        isOpen={store.showTemplateModal}
        onClose={() => store.setShowTemplateModal(false)}
        onSelect={(template) => {
          store.setSelectedTemplate(template);
          store.setShowTemplateModal(false);
        }}
        store={store}
      />

      {/* Generate Modal */}
      <GenerateModal
        isOpen={store.showGenerateModal}
        onClose={() => store.setShowGenerateModal(false)}
        onGenerate={handleGenerate}
        store={store}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default App;