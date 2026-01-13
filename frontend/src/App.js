import React, { useState, useRef } from 'react';
import { Copy, Loader2, Sparkles, Check, X, Lock, Star, Undo, Redo, Trash2, Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';

// ===========================
// STATE MANAGEMENT
// ===========================
const useStore = () => {
  const [state, setState] = useState({
    isGenerateModalOpen: false,
    topicInput: '',
    referencePostText: '',
    selectedTemplate: null,
    showTemplateList: false,
    templateBrowserTab: 'all',
    favouriteTemplates: [],
    editorContent: '',
    editorHistory: [''],
    historyIndex: 0,
    isLoading: false,
    previewMode: 'desktop',
    draft: null
  });

  return {
    ...state,
    setIsGenerateModalOpen: (val) => setState(prev => ({ ...prev, isGenerateModalOpen: val })),
    setTopicInput: (val) => setState(prev => ({ ...prev, topicInput: val })),
    setReferencePostText: (val) => setState(prev => ({ ...prev, referencePostText: val })),
    setSelectedTemplate: (val) => setState(prev => ({ ...prev, selectedTemplate: val, showTemplateList: false })),
    setShowTemplateList: (val) => setState(prev => ({ ...prev, showTemplateList: val })),
    setTemplateBrowserTab: (val) => setState(prev => ({ ...prev, templateBrowserTab: val })),
    toggleFavourite: (key) => setState(prev => ({
      ...prev,
      favouriteTemplates: prev.favouriteTemplates.includes(key)
        ? prev.favouriteTemplates.filter(k => k !== key)
        : [...prev.favouriteTemplates, key]
    })),
    setEditorContent: (val) => setState(prev => {
      const newHistory = [...prev.editorHistory.slice(0, prev.historyIndex + 1), val];
      return { ...prev, editorContent: val, editorHistory: newHistory, historyIndex: newHistory.length - 1 };
    }),
    undo: () => setState(prev => prev.historyIndex > 0 ? { ...prev, historyIndex: prev.historyIndex - 1, editorContent: prev.editorHistory[prev.historyIndex - 1] } : prev),
    redo: () => setState(prev => prev.historyIndex < prev.editorHistory.length - 1 ? { ...prev, historyIndex: prev.historyIndex + 1, editorContent: prev.editorHistory[prev.historyIndex + 1] } : prev),
    clearEditor: () => setState(prev => ({ ...prev, editorContent: '', editorHistory: [''], historyIndex: 0 })),
    setIsLoading: (val) => setState(prev => ({ ...prev, isLoading: val })),
    setPreviewMode: (val) => setState(prev => ({ ...prev, previewMode: val })),
    saveDraft: () => setState(prev => ({ ...prev, draft: { editorContent: prev.editorContent, timestamp: new Date().toISOString() } })),
    loadDraft: () => setState(prev => prev.draft ? { ...prev, editorContent: prev.draft.editorContent } : prev),
    deleteDraft: () => setState(prev => ({ ...prev, draft: null }))
  };
};

// ===========================
// TEMPLATES DATA
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
    post_body: `Top {X} Tips for {Topic} Success: 🏆

1️⃣ {Tip 1}: {Brief Explanation}
2️⃣ {Tip 2}: {Brief Explanation}
3️⃣ {Tip 3}: {Brief Explanation}

Got a tip to add? Drop it below! 👇`
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
    key: 'guide',
    name: 'Guide/How-To',
    category: 'Guides/How-To',
    author_name: 'Fernando Pessagno',
    author_title: 'Founder at aiCarousels, the first AI Carousel Generator ✨',
    timestamp: '12h',
    post_body: `After spending {Time} researching {Topic}, here's your complete guide:

📌 Introduction: {Brief intro}

✅ Step-by-Step:
1. {Step 1}
2. {Step 2}
3. {Step 3}

💡 Pro Tips:
• {Tip 1}
• {Tip 2}`
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

// ===========================
// API SERVICE
// ===========================
const API_BASE = 'http://localhost:8000/api';

const api = {
  generateFromReference: async (topic, referencePost, templateId) => {
    const res = await fetch(`${API_BASE}/generate/from-reference`, {
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
  
  editContent: async (content, action) => {
    const res = await fetch(`${API_BASE}/edit/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Edit failed');
    return await res.json();
  }
};

// ===========================
// TEMPLATE CARD COMPONENT
// ===========================
const TemplateCard = ({ template, isSelected, isFavourite, onSelect, onToggleFavourite }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-white rounded-lg border-2 transition-all hover:shadow-md ${
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
// GENERATE MODAL
// ===========================
const GenerateModal = ({ isOpen, onClose, onGenerate, store }) => {
  const [localTopic, setLocalTopic] = useState('');
  const [localReference, setLocalReference] = useState('');
  const [localTemplate, setLocalTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!localTopic.trim()) return;
    try {
      await onGenerate(localTopic, localReference, localTemplate?.key);
      setLocalTopic('');
      setLocalReference('');
      setLocalTemplate(null);
      setShowTemplates(false);
      onClose();
    } catch (err) {
      alert('Generation failed: ' + err.message);
    }
  };

  const filteredTemplates = store.templateBrowserTab === 'favourites'
    ? TEMPLATES.filter(t => store.favouriteTemplates.includes(t.key))
    : TEMPLATES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Generate Post with AI
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <textarea
              value={localTopic}
              onChange={(e) => setLocalTopic(e.target.value)}
              placeholder="Enter a topic that you want your post to cover"
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Reference Post */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <p className="text-sm text-gray-600 mb-3">
              Paste a LinkedIn post from your favourite creator or click "Select a Template" to explore our collection.
            </p>
            <textarea
              value={localReference}
              onChange={(e) => setLocalReference(e.target.value)}
              placeholder="Paste a LinkedIn post here to mimic its style, tone, and structure..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            />
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showTemplates ? '▲ Hide Templates' : '▼ Select a Template'}
              </button>
            </div>
          </div>

          {/* Template Browser */}
          {showTemplates && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => store.setTemplateBrowserTab('all')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    store.templateBrowserTab === 'all'
                      ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ALL TEMPLATES
                </button>
                <button
                  onClick={() => store.setTemplateBrowserTab('favourites')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    store.templateBrowserTab === 'favourites'
                      ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  FAVOURITES
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto bg-gray-50 p-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Your favourite templates will appear here.</p>
                    <p className="text-sm">Start adding some!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.key}
                        template={template}
                        isSelected={localTemplate?.key === template.key}
                        isFavourite={store.favouriteTemplates.includes(template.key)}
                        onSelect={() => setLocalTemplate(template)}
                        onToggleFavourite={() => store.toggleFavourite(template.key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Template Display */}
          {localTemplate && !showTemplates && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-900">Selected Template: {localTemplate.name}</div>
                  <div className="text-xs text-purple-700 mt-1">{localTemplate.category}</div>
                </div>
                <button onClick={() => setLocalTemplate(null)} className="text-purple-600 hover:text-purple-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Priority Indicator */}
          {localReference.trim() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 font-semibold text-sm">ℹ️ Style Transfer Mode</div>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                The AI will mimic the style, tone, and structure of your pasted post.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-3 flex-shrink-0">
          <button
            onClick={handleGenerate}
            disabled={!localTopic.trim() || store.isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {store.isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Post
              </>
            )}
          </button>
          <p className="text-center text-sm text-gray-500">
            Unlock +200 templates with our <span className="text-purple-600 font-semibold">PRO ✧ LinkedIn Post Generator</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// RICH TEXT EDITOR
// ===========================
const RichTextEditor = ({ content, onChange, store }) => {
  const editorRef = useRef(null);

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button onClick={store.undo} disabled={store.historyIndex <= 0} className="p-2 hover:bg-gray-200 rounded disabled:opacity-30" title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={store.redo} disabled={store.historyIndex >= store.editorHistory.length - 1} className="p-2 hover:bg-gray-200 rounded disabled:opacity-30" title="Redo">
          <Redo className="w-4 h-4" />
        </button>
        <button onClick={store.clearEditor} className="p-2 hover:bg-gray-200 rounded" title="Clear">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button onClick={() => applyFormat('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormat('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormat('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormat('strikeThrough')} className="p-2 hover:bg-gray-200 rounded" title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button onClick={() => applyFormat('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormat('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded" title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
};

// ===========================
// MAIN APP
// ===========================
const App = () => {
  const store = useStore();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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

  const handleEdit = async (action) => {
    if (!store.editorContent) return;
    store.setIsLoading(true);
    setError('');
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = store.editorContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const result = await api.editContent(plainText, action);
      store.setEditorContent(result.content);
    } catch (err) {
      setError(err.message);
    } finally {
      store.setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = store.editorContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy');
    }
  };

  const charCount = store.editorContent.replace(/<[^>]*>/g, '').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Free LinkedIn <span className="font-black">Post Generator</span>
          </h1>
          <p className="text-lg text-gray-600">
            Streamline your LinkedIn content creation with the best free AI LinkedIn Post Generator & Post Maker.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Generate AI Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Free AI LinkedIn Post Generator
                </h2>
                <button onClick={() => { store.saveDraft(); alert('Draft saved!'); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Save
                </button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button onClick={() => { store.loadDraft(); alert('Draft loaded!'); }} disabled={!store.draft} className="text-sm px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Load Draft
                </button>
                <button onClick={() => { store.deleteDraft(); alert('Draft deleted!'); }} disabled={!store.draft} className="text-sm px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Delete Draft
                </button>
              </div>

              <button
                onClick={() => store.setIsGenerateModalOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate with AI ✧
              </button>

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}
            </div>


            {/* Editor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Write Your Post
              </label>
              <RichTextEditor 
                content={store.editorContent}
                onChange={store.setEditorContent}
                store={store}
              />
            </div>

            {/* AI Actions */}
            {store.editorContent && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  AI Writing Assistant
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { action: 'improve', label: '✧ Improve writing' },
                    { action: 'rephrase', label: '✧ Rephrase' },
                    { action: 'fix-grammar', label: '✧ Fix spelling & grammar' },
                    { action: 'shorten', label: '✧ Make shorter' },
                    { action: 'expand', label: '✧ Make longer' },
                    { action: 'simplify', label: '✧ Simplify language' },
                    { action: 'add-emojis', label: '✧ Add Emojis' },
                    { action: 'add-hashtags', label: '✧ Add Hashtags' }
                  ].map(({ action, label }) => (
                    <button
                      key={action}
                      onClick={() => handleEdit(action)}
                      disabled={store.isLoading}
                      className="text-sm px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-left transition-colors"
                    >
                      {store.isLoading ? 'Processing...' : label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Post Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => store.setPreviewMode('desktop')}
                  className={`px-3 py-1 text-sm rounded ${store.previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => store.setPreviewMode('mobile')}
                  className={`px-3 py-1 text-sm rounded ${store.previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* LinkedIn Preview */}
            <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${store.previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  FP
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Fernando Pessagno</div>
                  <div className="text-sm text-gray-600">Founder at aiCarousels ✨</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">12h • 🌐</div>
                </div>
              </div>

              <div className="px-4 pb-3">
                {store.editorContent ? (
                  <div className="text-sm text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: store.editorContent }} />
                ) : (
                  <div className="text-sm text-gray-400 italic">Your generated post will appear here...</div>
                )}
              </div>

              <div className="border-t border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>64 reactions</span>
                  <span>27 comments • 4 reposts</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {['Like', 'Comment', 'Share', 'Send'].map((action) => (
                    <button key={action} className="py-2 text-sm text-gray-600 hover:bg-gray-50 rounded font-medium">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Copy & Stats */}
            {store.editorContent && (
              <div className="space-y-3">
                <button onClick={handleCopy} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy to Clipboard</>}
                </button>
                <div className="text-center text-sm text-gray-600">Characters: {charCount}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 max-w-3xl mx-auto">
          <p className="mb-4">
            Try our <span className="text-purple-600 font-semibold">PRO ✧ LinkedIn AI Post Generator</span> and unlock all features and templates.
          </p>
        </div>
      </main>

      {/* Generate Modal */}
      <GenerateModal
        isOpen={store.isGenerateModalOpen}
        onClose={() => store.setIsGenerateModalOpen(false)}
        onGenerate={handleGenerate}
        store={store}
      />
    </div>
  );
};

export default App;