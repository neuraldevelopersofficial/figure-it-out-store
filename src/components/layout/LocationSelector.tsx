import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { AddressModal } from '@/components/layout/AddressModal';

interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  addressType: string;
}

export const LocationSelector: React.FC = () => {
  const { user } = useAuth();
  const { state: { addresses, selectedAddress }, setSelectedAddress } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayAddress = selectedAddress || addresses.find(a => a.isDefault);

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 cursor-pointer hover:text-brand-red transition-colors" onClick={() => setIsModalOpen(true)}>
        <MapPin className="h-5 w-5 text-foreground" />
        <div className="text-sm">
          <p className="text-muted-foreground">Deliver to {user?.full_name || 'You'}</p>
          <p className="font-medium text-foreground">
            {displayAddress ? `${displayAddress.city} ${displayAddress.pincode}` : 'Select Address'}
          </p>
        </div>
      </div>
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addresses={addresses}
        onSelectAddress={handleSelectAddress}
        selectedAddress={displayAddress}
      />
    </div>
  );
};
