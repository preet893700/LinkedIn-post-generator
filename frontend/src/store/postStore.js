import { create } from 'zustand';

const usePostStore = create((set) => ({
  // Input state
  inputText: '',
  setInputText: (text) => set({ inputText: text }),
  
  // Template state
  selectedTemplate: '',
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  // Generated post state
  generatedPost: '',
  setGeneratedPost: (post) => set({ generatedPost: post }),
  
  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Preview mode (desktop/mobile)
  previewMode: 'desktop',
  setPreviewMode: (mode) => set({ previewMode: mode }),
  
  // Custom instructions
  customInstructions: '',
  setCustomInstructions: (instructions) => set({ customInstructions: instructions }),
  
  // Draft management
  draft: null,
  saveDraft: () => set((state) => ({
    draft: {
      inputText: state.inputText,
      generatedPost: state.generatedPost,
      selectedTemplate: state.selectedTemplate,
      timestamp: new Date().toISOString()
    }
  })),
  loadDraft: () => set((state) => {
    if (state.draft) {
      return {
        inputText: state.draft.inputText,
        generatedPost: state.draft.generatedPost,
        selectedTemplate: state.draft.selectedTemplate
      };
    }
    return {};
  }),
  deleteDraft: () => set({ draft: null }),
  
  // Reset state
  reset: () => set({
    inputText: '',
    selectedTemplate: '',
    generatedPost: '',
    customInstructions: '',
  })
}));

export default usePostStore;