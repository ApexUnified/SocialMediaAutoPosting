import { Sparkles } from "lucide-react";

// AI Generation Component
const AIGenerator = ({ formData, onInputChange, onGenerate, isGenerating }) => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <Sparkles className="w-4 h-4 mr-2" />
        AI Content Generation
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Sparkles size={16} />
          <span>{isGenerating ? "Generating..." : "Generate Content"}</span>
        </button>
      </div>
    </div>
  );

export default AIGenerator;