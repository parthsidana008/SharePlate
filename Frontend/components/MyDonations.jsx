import { useState, useEffect } from 'react';
import { Edit2, Trash2, MapPin, Clock, Users, Utensils, Package } from 'lucide-react';
import api from '../utils/api';

const MyDonations = ({ donations, onEdit, onDelete, onRefresh }) => {
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Veg':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Non-Veg':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Vegan':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Bakery':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-blue-100 text-blue-700';
      case 'Requested':
        return 'bg-yellow-100 text-yellow-700';
      case 'Claimed':
        return 'bg-green-100 text-green-700';
      case 'Expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleDelete = async (donationId) => {
    try {
      setLoading(true);
      setDeleteError(null);
      await api.delete(`/donations/${donationId}`);
      setDeleteConfirm(null);
      onDelete(donationId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting donation:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete donation';
      setDeleteError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Donations</h2>
          <p className="text-slate-500 mt-1">Manage and track your food donations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Donation List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
          {donations.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No donations yet.</p>
              <p className="text-sm text-slate-400 mt-1">Start sharing food with your community!</p>
            </div>
          ) : (
            donations.map((donation) => (
              <div
                key={donation._id || donation.id}
                onClick={() => setSelectedDonation(donation)}
                className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedDonation?._id === donation._id || selectedDonation?.id === donation.id
                    ? 'border-green-500 ring-1 ring-green-500 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <img
                  src={donation.imageUrl}
                  alt={donation.title}
                  className="w-full h-32 rounded-lg object-cover bg-slate-100 mb-3"
                />
                <div>
                  <h4 className="font-bold text-slate-900 truncate">{donation.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getTypeColor(
                        donation.type
                      )}`}
                    >
                      {donation.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(
                        donation.status || 'Available'
                      )}`}
                    >
                      {donation.status || 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          {selectedDonation ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-full flex flex-col">
              {/* Header with Image */}
              <div className="relative h-64 overflow-hidden bg-slate-200">
                <img
                  src={selectedDonation.imageUrl}
                  alt={selectedDonation.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span
                    className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(
                      selectedDonation.status || 'Available'
                    )}`}
                  >
                    {selectedDonation.status || 'Available'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedDonation.title}</h3>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getTypeColor(selectedDonation.type)}`}>
                    {selectedDonation.type}
                  </span>
                </div>

                <p className="text-slate-600 mb-6">{selectedDonation.description}</p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <Utensils className="w-4 h-4" />
                      Quantity
                    </div>
                    <p className="font-bold text-slate-900">{selectedDonation.quantity}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      Expires In
                    </div>
                    <p className="font-bold text-slate-900">{selectedDonation.expiresIn}</p>
                  </div>

                  <div className="col-span-2 bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <MapPin className="w-4 h-4" />
                      Location
                    </div>
                    <p className="font-bold text-slate-900">
                      {selectedDonation.location?.area || selectedDonation.location?.city || selectedDonation.location}
                    </p>
                  </div>

                  {selectedDonation.requests && (
                    <div className="col-span-2 bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        Requests
                      </div>
                      <p className="font-bold text-slate-900">{selectedDonation.requests} pending request(s)</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => onEdit(selectedDonation)}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(selectedDonation)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 h-full flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Select a donation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Donation?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{deleteError}</p>
                {deleteError.includes('accepted requests') && (
                  <p className="text-red-600 text-xs mt-2">💡 You can cancel the accepted request first, then delete the donation.</p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError(null);
                }}
                className="flex-1 py-2 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
              >
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button
                  onClick={() => handleDelete(deleteConfirm._id || deleteConfirm.id)}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-70 transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
