import { ArrowRight, Globe, Heart, ShieldCheck, Leaf, ChevronDown } from 'lucide-react';

const Hero = ({ onCtaClick, onFindFoodClick }) => {
  return (
    <div className="flex flex-col w-full">
        {/* Full Screen Hero Section */}
        <div className="relative w-full min-h-[90vh] flex items-center justify-center bg-slate-900 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                    alt="Community dining" 
                    className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
                    style={{ animationDuration: '30s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center sm:px-6 lg:px-8 flex flex-col items-center animate-[fadeIn_1s_ease-out]">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-green-300 text-sm font-medium mb-8">
                    <Leaf className="w-4 h-4" />
                    <span>Over 5 tons of food saved this month</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight drop-shadow-lg">
                    Turn Surplus into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Smiles & Sustenance</span>
                </h1>
                
                <p className="max-w-2xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light">
                    The smartest way to share extra food with neighbors and shelters. 
                    Join 10,000+ donors making a difference in their local communities today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button 
                        onClick={onCtaClick}
                        className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                    >
                        Start Donating <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onFindFoodClick}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full font-bold text-lg transition-all flex items-center justify-center"
                    >
                        Find Food Nearby
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400 cursor-pointer" onClick={onFindFoodClick}>
                <ChevronDown className="w-8 h-8" />
            </div>
        </div>

        {/* Feature Grid / Value Prop */}
        <div className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How SharePlate Works</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">We've simplified the process of food donation to make it as easy as ordering a cab. Here is how you can help.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Step 1 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 hover:bg-green-50 transition-colors border border-slate-100 hover:border-green-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Heart className="w-32 h-32 text-green-600" />
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-xl font-bold text-green-600 group-hover:scale-110 transition-transform">1</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">List Your Surplus</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Take a photo of your food, add a quick description using our AI tools, and set a pickup location. It takes less than 2 minutes.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-100 hover:border-blue-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck className="w-32 h-32 text-blue-600" />
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-xl font-bold text-blue-600 group-hover:scale-110 transition-transform">2</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Connect & Verify</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Nearby neighbors or NGOs request the food. We verify profiles to ensure safety and trust within the community.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="group p-8 rounded-3xl bg-slate-50 hover:bg-orange-50 transition-colors border border-slate-100 hover:border-orange-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe className="w-32 h-32 text-orange-600" />
                        </div>
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-xl font-bold text-orange-600 group-hover:scale-110 transition-transform">3</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Share & Impact</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Coordinate a seamless pickup. Feel good knowing you've prevented waste and fed someone in need.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Impact Dashboard Style Section */}
        <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10">
                 <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                 </svg>
             </div>
             
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                     <div>
                         <h2 className="text-3xl md:text-5xl font-bold mb-6">Real Impact,<br/>Real Time.</h2>
                         <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                             Our community is growing faster every day. Every donation counts towards a greener planet and a hunger-free world.
                         </p>
                         <button className="text-green-400 font-bold hover:text-green-300 flex items-center gap-2 group">
                             View Global Impact Report <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                         </button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6">
                         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                             <div className="text-4xl font-bold text-green-400 mb-1">12k+</div>
                             <div className="text-slate-300 text-sm">Meals Shared</div>
                         </div>
                         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                             <div className="text-4xl font-bold text-blue-400 mb-1">850+</div>
                             <div className="text-slate-300 text-sm">Verified Donors</div>
                         </div>
                         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                             <div className="text-4xl font-bold text-orange-400 mb-1">5.2T</div>
                             <div className="text-slate-300 text-sm">CO2 Prevented</div>
                         </div>
                         <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                             <div className="text-4xl font-bold text-purple-400 mb-1">24/7</div>
                             <div className="text-slate-300 text-sm">AI Support</div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default Hero;

