import { Sparkles } from "lucide-react";

// AI Generation Component
const AIGenerator = ({ formData, onInputChange, onGenerate, isGenerating }) => (
  <div className="p-4 mb-6 rounded-lg bg-gray-50">
    <h3 className="flex items-center mb-3 text-sm font-medium text-gray-700">
      <Sparkles className="w-4 h-4 mr-2" />
      AI Content Generation
    </h3>
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          AI Prompt
        </label>
        <textarea
          name="prompt"
          value={formData.prompt}
          onChange={onInputChange}
          placeholder="Enter a prompt for AI to generate content..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onGenerate}
        disabled={isGenerating || !formData.prompt}
        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors rounded-md bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <Sparkles size={16} />
        <span>{isGenerating ? "Generating..." : "Generate Content"}</span>
      </button>
    </div>
  </div>
);

export default AIGenerator;
