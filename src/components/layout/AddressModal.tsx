import React from 'react';
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
            {addresses.map((address) => (
              <Label
                key={address.id}
                htmlFor={address.id}
                className="flex items-start gap-4 rounded-md border p-4 hover:bg-gray-50 cursor-pointer"
              >
                <RadioGroupItem value={address.id} id={address.id} />
                <div className="text-sm">
                  <p className="font-medium">{address.name} <span className="font-normal text-gray-500">({address.addressType})</span></p>
                  <p className="text-gray-600">{address.addressLine1}, {address.addressLine2}, {address.landmark}</p>
                  <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-gray-600">Mobile: {address.phone}</p>
                </div>
              </Label>
            ))}
          </div>
        </RadioGroup>
        <div className="mt-4">
          {/* TODO: Link to profile page to add new address */}
          <Button variant="outline" className="w-full">+ Add a new address</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
