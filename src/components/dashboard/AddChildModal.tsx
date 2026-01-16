import { useState } from 'react';
import { useSearchChildrenByParentEmail, useChildren } from '@/hooks/useChildren';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus, Loader2 } from 'lucide-react';

interface AddChildModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FoundChild {
  id: string;
  name: string;
  age: number;
  isAlreadyAssigned: boolean;
}

interface FoundParent {
  id: string;
  name: string;
  email: string;
}

const AddChildModal = ({ open, onOpenChange }: AddChildModalProps) => {
  const { linkChild, isLinking } = useChildren();
  const searchMutation = useSearchChildrenByParentEmail();
  
  const [parentEmail, setParentEmail] = useState('');
  const [foundParent, setFoundParent] = useState<FoundParent | null>(null);
  const [foundChildren, setFoundChildren] = useState<FoundChild[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setFoundParent(null);
    setFoundChildren([]);
    setSelectedChildren(new Set());
    
    try {
      const result = await searchMutation.mutateAsync(parentEmail);
      setFoundParent(result.parent);
      setFoundChildren(result.children);
      setSearched(true);
    } catch (err) {
      setSearched(true);
      setError(err instanceof Error ? err.message : 'Failed to search');
    }
  };

  const toggleChild = (childId: string) => {
    const newSet = new Set(selectedChildren);
    if (newSet.has(childId)) {
      newSet.delete(childId);
    } else {
      newSet.add(childId);
    }
    setSelectedChildren(newSet);
  };

  const handleAddChildren = () => {
    selectedChildren.forEach(childId => {
      linkChild(childId);
    });
    handleClose();
  };

  const handleClose = () => {
    setParentEmail('');
    setFoundParent(null);
    setFoundChildren([]);
    setSelectedChildren(new Set());
    setSearched(false);
    setError('');
    onOpenChange(false);
  };

  const availableChildren = foundChildren.filter(c => !c.isAlreadyAssigned);
  const canAdd = selectedChildren.size > 0;

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
                  setFoundChildren([]);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearch}
                disabled={searchMutation.isPending || !parentEmail}
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {searched && foundParent && foundChildren.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No children found for this parent.
            </p>
          )}

          {foundParent && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="font-medium">{foundParent.name}</p>
              <p className="text-sm text-muted-foreground">{foundParent.email}</p>
            </div>
          )}

          {foundChildren.length > 0 && (
            <div className="space-y-2">
              <Label>Select children to add</Label>
              <div className="space-y-2">
                {foundChildren.map(child => (
                  <div
                    key={child.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      child.isAlreadyAssigned 
                        ? 'bg-muted/30 border-muted' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={child.id}
                      checked={selectedChildren.has(child.id)}
                      onCheckedChange={() => toggleChild(child.id)}
                      disabled={child.isAlreadyAssigned}
                    />
                    <label 
                      htmlFor={child.id}
                      className={`flex-1 cursor-pointer ${child.isAlreadyAssigned ? 'opacity-50' : ''}`}
                    >
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Age {child.age}
                        {child.isAlreadyAssigned && ' • Already assigned'}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
              {availableChildren.length === 0 && foundChildren.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  All children are already assigned to you.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddChildren}
            disabled={!canAdd || isLinking}
          >
            {isLinking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Add {selectedChildren.size > 0 ? `(${selectedChildren.size})` : 'Child'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildModal;
