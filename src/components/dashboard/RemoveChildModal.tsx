import { useApp } from '@/contexts/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RemoveChildModalProps {
  childId: string | null;
  onClose: () => void;
}

const RemoveChildModal = ({ childId, onClose }: RemoveChildModalProps) => {
  const { getChildById, getParentByChildId, removeChild, getSessionsByChildId } = useApp();

  if (!childId) return null;

  const child = getChildById(childId);
  const parent = getParentByChildId(childId);
  const sessions = getSessionsByChildId(childId);

  if (!child) return null;

  const handleRemove = () => {
    removeChild(childId);
    onClose();
  };

  return (
    <AlertDialog open={!!childId} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Child</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{child.name}</strong> from your assigned children?
            {sessions.length > 0 && (
              <span className="block mt-2 text-destructive">
                This will also remove {sessions.length} associated session(s).
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveChildModal;
