import { useState, useEffect } from 'react';
import { useChildren } from '@/hooks/useChildren';
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

interface EditChildLinksModalProps {
  childId: string | null;
  onClose: () => void;
}

const EditChildLinksModal = ({ childId, onClose }: EditChildLinksModalProps) => {
  const { children, updateChildLinks, isUpdatingLinks } = useChildren();
  const child = childId ? children.find(c => c.id === childId) : null;

  const [caseRecordSheetUrl, setCaseRecordSheetUrl] = useState('');
  const [assessmentViewerUrl, setAssessmentViewerUrl] = useState('');

  useEffect(() => {
    if (child) {
      setCaseRecordSheetUrl(child.caseRecordSheetUrl || '');
      setAssessmentViewerUrl(child.assessmentViewerUrl || '');
    }
  }, [child]);

  const handleSave = () => {
    if (childId) {
      updateChildLinks({
        childId,
        caseRecordSheetUrl: caseRecordSheetUrl || undefined,
        assessmentViewerUrl: assessmentViewerUrl || undefined,
      });
      onClose();
    }
  };

  if (!child) return null;

  return (
    <Dialog open={!!childId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Links for {child.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="caseRecordSheet">Case Record Sheet URL</Label>
            <Input
              id="caseRecordSheet"
              value={caseRecordSheetUrl}
              onChange={(e) => setCaseRecordSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessmentViewer">Assessment Viewer URL</Label>
            <Input
              id="assessmentViewer"
              value={assessmentViewerUrl}
              onChange={(e) => setAssessmentViewerUrl(e.target.value)}
              placeholder="https://assessments.example.com/..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdatingLinks}>
            {isUpdatingLinks ? 'Saving...' : 'Save Links'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChildLinksModal;
