import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  onSelectAddress: (address: Address) => void;
  selectedAddress: Address | undefined;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, addresses, onSelectAddress, selectedAddress }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a delivery address</DialogTitle>
          <DialogDescription>
            Select an address from the list below or add a new one.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          defaultValue={selectedAddress?.id}
          onValueChange={(value) => {
            const address = addresses.find(a => a.id === value);
            if (address) {
              onSelectAddress(address);
            }
          }}
        >
          <div className="space-y-4 max-h-80 overflow-y-auto p-1">
            {!addresses || addresses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No addresses found. Add a new address to continue.</p>
              </div>
            ) : (
              addresses.map((address) => (
                <Label
                  key={address.id}
                  htmlFor={address.id}
                  className="flex items-start gap-4 rounded-md border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={address.id} id={address.id} />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{address.name} <span className="font-normal text-muted-foreground">({address.addressType})</span></p>
                    <p className="text-muted-foreground">{address.addressLine1}, {address.addressLine2}, {address.landmark}</p>
                    <p className="text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-muted-foreground">Mobile: {address.phone}</p>
                  </div>
                </Label>
              ))
            )}
          </div>
        </RadioGroup>
        <div className="mt-4">
          <Link to="/profile">
            <Button variant="outline" className="w-full hover:bg-brand-red hover:text-white transition-colors">+ Add a new address</Button>
          </Link>
        </div>
        <Button variant="ghost" size="sm" className="absolute right-4 top-4" onClick={onClose}>
          ✕
        </Button>
      </DialogContent>
    </Dialog>
  );
};
