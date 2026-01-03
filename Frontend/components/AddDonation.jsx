import { useState, useRef } from 'react';
import { getFoodSafetyTips, analyzeFoodImage } from '../services/geminiService';
import { AlertTriangle, Loader2, Camera, MapPin, UploadCloud, X, Utensils, Sparkles } from 'lucide-react';

const AddDonation = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Veg');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [safetyTip, setSafetyTip] = useState(null);
  const [isGettingTip, setIsGettingTip] = useState(false);

  const handleSafetyCheck = async () => {
    if (!title) return;
    setIsGettingTip(true);
    const tip = await getFoodSafetyTips(title);
    setSafetyTip(tip);
    setIsGettingTip(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUploadedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
      if (!uploadedImage) return;

      setIsAnalyzingImage(true);
      // Remove data URL prefix for API
      const base64Data = uploadedImage.split(',')[1];
      const analysis = await analyzeFoodImage(base64Data);
      
      if (analysis) {
        setTitle(analysis.title || '');
        setDescription(analysis.description || '');
        setQuantity(analysis.quantity || '');
        setExpiresIn(analysis.expiresIn || '');
        if (analysis.type) setType(analysis.type);
        
        // Trigger safety check based on new title
        if (analysis.title) {
           const tip = await getFoodSafetyTips(analysis.title);
           setSafetyTip(tip);
        }
      }
      setIsAnalyzingImage(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      quantity,
      location: {
        area: location
      },
      expiresIn,
      imageUrl: uploadedImage || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
      donorName: 'Current User'
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full h-full flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Image Section */}
      <div className="md:w-1/3 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600/20 to-blue-600/20 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6 text-green-400 font-bold">
            <Utensils className="w-5 h-5" />
            <span>SharePlate</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Your Food Can Be Someone's <span className="text-green-400">Meal today.</span></h2>
          <p className="text-slate-400 text-sm">Upload a photo to verify your donation. Use our AI tool to auto-fill details.</p>
        </div>
        
        <div className="relative z-10 mt-8 flex flex-col gap-4">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${uploadedImage ? 'border-green-500' : 'border-slate-600 hover:border-slate-400 hover:bg-white/5'}`}
            >
                {uploadedImage ? (
                    <>
                        <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </>
                ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-400 font-medium">Click to Upload Food Photo</span>
                    </>
                )}
            </div>

            {uploadedImage && (
                <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzingImage}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isAnalyzingImage ? (
                        <>
                             <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" /> Auto-Fill Details with AI
                        </>
                    )}
                </button>
            )}
        </div>
      </div>
      
      {/* Form Section */}
      <div className="md:w-2/3 p-8 bg-white overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Donation Details</h3>
              <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
              </button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">What are you donating?</label>
                <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSafetyCheck}
                placeholder="e.g., 20 Homemade Sandwiches"
                className="block w-full border-b-2 border-slate-100 focus:border-green-500 outline-none py-2 text-lg font-medium text-slate-900 bg-white transition-colors placeholder-slate-300"
                />
                
                {isGettingTip && <p className="text-xs text-slate-400 mt-2 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/>Checking safety guidelines...</p>}
                {safetyTip && !isGettingTip && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3 animate-fadeIn">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-bold">Safety First:</span> {safetyTip}
                        </div>
                    </div>
                )}
            </div>

            <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Description</label>
            <div className="relative">
                <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe ingredients, allergens, or condition..."
                className="block w-full rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-green-100 p-4 text-sm text-slate-900 resize-none placeholder-slate-400"
                />
            </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Food Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="block w-full bg-slate-50 border-none rounded-lg py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-green-100"
                    >
                        <option value="Veg">Vegetarian</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Bakery">Bakery</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Quantity</label>
                    <input
                        required
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 5 kg"
                        className="block w-full bg-slate-50 border-none rounded-lg py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-green-100 placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Location</label>
                    <div className="relative">
                        <input
                            required
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City or Area"
                            className="block w-full bg-slate-50 border-none rounded-lg py-2.5 px-3 pl-9 text-sm text-slate-900 focus:ring-2 focus:ring-green-100 placeholder-slate-400"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1 tracking-wider">Expires In</label>
                    <input
                        required
                        type="text"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        placeholder="e.g. 4 hours"
                        className="block w-full bg-slate-50 border-none rounded-lg py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-green-100 placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 text-sm font-semibold hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
            >
                Post Donation
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddDonation;

