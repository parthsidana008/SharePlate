import { useState } from 'react';
import { generateLeftoverRecipes } from '../services/geminiService';
import { ChefHat, Loader2, Sparkles, Clock, BarChart } from 'lucide-react';

const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    const result = await generateLeftoverRecipes(ingredients);
    setRecipes(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <ChefHat className="text-orange-500" />
          Smart Kitchen
        </h2>
        <p className="text-slate-500 mt-2">Don't throw it away! Enter your leftover ingredients and let our AI suggest delicious recipes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. stale bread, 2 tomatoes, half an onion"
            className="flex-1 rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !ingredients}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="bg-orange-50 p-4 border-b border-orange-100">
              <h3 className="font-bold text-lg text-slate-800">{recipe.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}</span>
                <span className="flex items-center gap-1"><BarChart className="w-3 h-3" /> {recipe.difficulty}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ingredients</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="block w-1 h-1 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                        {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h4>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                  {recipe.instructions.slice(0, 3).map((inst, i) => (
                    <li key={i} className="line-clamp-2">{inst}</li>
                  ))}
                </ol>
                {recipe.instructions.length > 3 && (
                    <p className="text-xs text-orange-500 mt-2 font-medium cursor-pointer hover:underline">View full recipe...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && recipes.length === 0 && ingredients && (
          <div className="text-center text-slate-400 mt-10">
              Press generate to see magic happen!
          </div>
      )}
    </div>
  );
};

export default RecipeGenerator;

