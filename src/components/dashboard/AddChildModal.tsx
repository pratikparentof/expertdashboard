import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus } from 'lucide-react';

interface AddChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddChildModal = ({ open, onOpenChange }: AddChildModalProps) => {
  const { parents, addChild } = useApp();
  const [parentEmail, setParentEmail] = useState('');
  const [foundParent, setFoundParent] = useState<typeof parents[0] | null>(null);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const parent = parents.find(p => p.email.toLowerCase() === parentEmail.toLowerCase());
    setFoundParent(parent || null);
    setSearched(true);
  };

  const handleAddChild = () => {
    if (!foundParent || !childName || !childAge) return;

    addChild({
      id: `child-${Date.now()}`,
      name: childName,
      age: parseInt(childAge),
      parentId: foundParent.id,
    });

    handleClose();
  };

  const handleClose = () => {
    setParentEmail('');
    setFoundParent(null);
    setChildName('');
    setChildAge('');
    setSearched(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Child</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parentEmail">Parent Email</Label>
            <div className="flex gap-2">
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@email.com"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  setSearched(false);
                  setFoundParent(null);
                }}
              />
              <Button type="button" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {searched && !foundParent && (
            <p className="text-sm text-destructive">
              No parent found with this email address.
            </p>
          )}

          {foundParent && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="font-medium">{foundParent.name}</p>
              <p className="text-sm text-muted-foreground">{foundParent.email}</p>
            </div>
          )}

          {foundParent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="childName">Child's Name</Label>
                <Input
                  id="childName"
                  placeholder="Enter child's name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childAge">Child's Age</Label>
                <Input
                  id="childAge"
                  type="number"
                  min="1"
                  max="18"
                  placeholder="Enter age"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddChild}
            disabled={!foundParent || !childName || !childAge}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildModal;
