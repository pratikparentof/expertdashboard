import { useState } from 'react';
import { useChildren } from '@/hooks/useChildren';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, FileText, ClipboardList, History, UserMinus, Pencil } from 'lucide-react';
import AddChildModal from './AddChildModal';
import SessionHistoryModal from './SessionHistoryModal';
import RemoveChildModal from './RemoveChildModal';
import EditChildLinksModal from './EditChildLinksModal';

const ChildrenList = () => {
  const { children } = useChildren();
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChildForHistory, setSelectedChildForHistory] = useState<string | null>(null);
  const [selectedChildForRemove, setSelectedChildForRemove] = useState<string | null>(null);
  const [selectedChildForEditLinks, setSelectedChildForEditLinks] = useState<string | null>(null);

  const handleOpenUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <Card className="shadow-card flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Assigned Children</CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowAddChild(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Child
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto pb-4">
          <div className="space-y-2">
            {children.map(child => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{child.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{child.parentName}</span>
                    <span>•</span>
                    <span>Age {child.age}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem className="flex items-center justify-between p-0">
                      <button 
                        className="flex items-center flex-1 px-2 py-1.5"
                        onClick={() => handleOpenUrl(child.caseRecordSheetUrl)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Open Case Record Sheet
                      </button>
                      <button 
                        className="p-1.5 hover:bg-accent rounded-sm mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChildForEditLinks(child.id);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center justify-between p-0">
                      <button 
                        className="flex items-center flex-1 px-2 py-1.5"
                        onClick={() => handleOpenUrl(child.assessmentViewerUrl)}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Open Assessment Viewer
                      </button>
                      <button 
                        className="p-1.5 hover:bg-accent rounded-sm mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChildForEditLinks(child.id);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedChildForHistory(child.id)}>
                      <History className="h-4 w-4 mr-2" />
                      View Session History
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSelectedChildForRemove(child.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Child
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {children.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No children assigned yet.</p>
                <p className="text-sm mt-1">Click "Add Child" to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddChildModal open={showAddChild} onOpenChange={setShowAddChild} />
      
      <SessionHistoryModal 
        childId={selectedChildForHistory} 
        onClose={() => setSelectedChildForHistory(null)} 
      />
      
      <RemoveChildModal 
        childId={selectedChildForRemove} 
        onClose={() => setSelectedChildForRemove(null)} 
      />
      
      <EditChildLinksModal 
        childId={selectedChildForEditLinks} 
        onClose={() => setSelectedChildForEditLinks(null)} 
      />
    </>
  );
};

export default ChildrenList;
