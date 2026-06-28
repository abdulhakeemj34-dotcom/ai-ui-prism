import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePlanner } from '@/hooks/use-planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function SortableSession({
  session,
  subjectName,
  onDelete,
  onToggleReminder,
}: {
  session: ReturnType<typeof usePlanner>['sessions'][0];
  subjectName: string;
  onDelete: () => void;
  onToggleReminder: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: session.id });

  return (
    <Card ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <CardContent className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{session.title}</p>
          <p className="text-xs text-muted-foreground">
            {DAYS[session.dayOfWeek]} · {session.startTime} · {session.durationMinutes}min · {subjectName}
          </p>
        </div>
        <Switch checked={session.reminder} onCheckedChange={onToggleReminder} />
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlannerPage() {
  const { subjects, sessions, addSession, deleteSession, updateSession, reorderSessions } = usePlanner();
  const [form, setForm] = useState({
    title: '',
    subjectId: subjects[0]?.id ?? '',
    dayOfWeek: 1,
    startTime: '09:00',
    durationMinutes: 60,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAdd = () => {
    if (!form.title.trim() || !form.subjectId) return;
    addSession({ ...form, reminder: true });
    setForm({ ...form, title: '' });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sessions.findIndex((s) => s.id === active.id);
    const newIndex = sessions.findIndex((s) => s.id === over.id);
    reorderSessions(arrayMove(sessions, oldIndex, newIndex).map((s) => s.id));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Study Planner</h1>
        <p className="text-sm text-muted-foreground">Schedule and organize your study sessions</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <Badge key={s.id} variant="outline" style={{ borderColor: s.color, color: s.color }}>
            {s.name} · {s.hoursPerWeek}h/wk
          </Badge>
        ))}
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-base">Add Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            placeholder="Session title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="min-w-[140px] flex-1"
          />
          <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(form.dayOfWeek)} onValueChange={(v) => setForm({ ...form, dayOfWeek: Number(v) })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d, i) => (
                <SelectItem key={d} value={String(i)}>{d.slice(0, 3)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="w-32"
          />
          <Button onClick={handleAdd}>
            <Plus size={16} />
          </Button>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sessions.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sessions.map((session) => (
              <SortableSession
                key={session.id}
                session={session}
                subjectName={subjects.find((s) => s.id === session.subjectId)?.name ?? 'Unknown'}
                onDelete={() => deleteSession(session.id)}
                onToggleReminder={(v) => updateSession(session.id, { reminder: v })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sessions.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No study sessions scheduled.</p>
      )}
    </div>
  );
}
