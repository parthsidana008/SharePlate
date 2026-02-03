import { Clock, MapPin, CheckCircle2, ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DonationCard = ({ donation, onRequest, onEdit, onDelete, isDonorOwned = false, isRequested = false }) => {
  const { user } = useAuth();
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'Veg': return 'bg-green-100 text-green-800';
      case 'Non-Veg': return 'bg-red-100 text-red-800';
      case 'Vegan': return 'bg-emerald-100 text-emerald-800';
      case 'Bakery': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={donation.imageUrl} 
          alt={donation.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(donation.type)}`}>
            {donation.type}
          </span>
        </div>
        {donation.verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-blue-500 shadow-sm" title="Verified Donor">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{donation.title}</h3>
        </div>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{donation.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-500 text-xs">
            <ShoppingBag className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>{donation.quantity}</span>
          </div>
          <div className="flex items-center text-slate-500 text-xs">
            <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>Expires in {donation.expiresIn}</span>
          </div>
          <div className="flex items-center text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span className="truncate">{donation.location?.area || donation.location?.city || donation.location || ''}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="flex items-center">
             <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
               {donation.donorName.charAt(0)}
             </div>
             <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{donation.donorName}</span>
           </div>
           {isDonorOwned || user?.role === 'donor' ? (
             <div className="flex gap-2">
               <button 
                 onClick={() => onEdit && onEdit(donation)}
                 className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors active:scale-95 flex items-center gap-1"
               >
                 <Edit2 className="w-4 h-4" />
                 Edit
               </button>
               <button 
                 onClick={() => onDelete && onDelete(donation)}
                 className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors active:scale-95 flex items-center gap-1"
               >
                 <Trash2 className="w-4 h-4" />
                 Delete
               </button>
             </div>
           ) : (
             <button 
               onClick={() => !isRequested && onRequest(donation)}
               disabled={isRequested}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95 ${
                 isRequested
                   ? 'bg-green-100 text-green-700 cursor-not-allowed'
                   : 'bg-slate-900 text-white hover:bg-slate-800'
               }`}
             >
               {isRequested ? 'Requested' : 'Request'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;

