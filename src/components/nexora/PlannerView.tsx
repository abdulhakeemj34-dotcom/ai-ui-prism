import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, BookOpen, GraduationCap, GripVertical, CheckCircle2 } from 'lucide-react';
import { usePersistence } from '@/hooks/use-persistence';
import { Button } from '@/components/ui/button';
import { GlassCard } from './UI/GlassCard';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: string;
  completed: boolean;
}

function SortableItem({ id, task }: { id: string, task: StudyTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 last:mb-0">
      <GlassCard className={`p-4 flex items-center ${task.completed ? 'opacity-50' : ''}`}>
        <div {...attributes} {...listeners} className="mr-3 text-muted-foreground/50 hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
          <GripVertical size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
              {task.subject}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center">
              <Clock size={10} className="mr-1" /> {task.duration}
            </span>
          </div>
          <h4 className="text-sm font-bold">{task.topic}</h4>
        </div>
        <button className={`p-2 rounded-full transition-colors ${task.completed ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground/30 hover:bg-secondary'}`}>
          <CheckCircle2 size={20} />
        </button>
      </GlassCard>
    </div>
  );
}

export function PlannerView() {
  const [studyTasks, setStudyTasks] = usePersistence<StudyTask[]>('nexora-study-tasks', [
    { id: 's1', subject: 'Mathematics', topic: 'Calculus: Integration by Parts', duration: '45m', completed: false },
    { id: 's2', subject: 'Computer Science', topic: 'React 19 Hooks Deep Dive', duration: '1h 30m', completed: true },
    { id: 's3', subject: 'Design', topic: 'Futuristic UI Patterns', duration: '1h', completed: false },
    { id: 's4', subject: 'History', topic: 'Industrial Revolution Impacts', duration: '30m', completed: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = studyTasks.findIndex((t) => t.id === active.id);
      const newIndex = studyTasks.findIndex((t) => t.id === over.id);
      setStudyTasks(arrayMove(studyTasks, oldIndex, newIndex));
    }
  };

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDay = 2; // Wednesday

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold flex items-center">
          <Calendar className="mr-2 text-primary" size={20} />
          Study Schedule
        </h3>
        <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 border-primary/30 text-primary">
          Weekly View
        </Button>
      </div>

      <div className="flex justify-between px-2">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground mb-2">{day}</span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
              i === currentDay 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110' 
                : 'bg-card/40 border border-border/50 text-muted-foreground'
            }`}>
              {15 + i}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary/30 rounded-3xl p-6 border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <GraduationCap size={120} />
        </div>
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Focus Session</h4>
        <h3 className="text-2xl font-bold mb-4">React 19 Mastery</h3>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center text-xs font-medium bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
            <Clock size={12} className="mr-1.5 text-primary" />
            10:00 - 11:30 AM
          </div>
          <div className="flex items-center text-xs font-medium bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
            <BookOpen size={12} className="mr-1.5 text-blue-500" />
            Computer Science
          </div>
        </div>
        <Button className="w-full rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold h-12">
          Start Session
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold flex items-center">
          Upcoming Tasks
          <span className="ml-2 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">
            {studyTasks.filter(t => !t.completed).length}
          </span>
        </h3>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={studyTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {studyTasks.map((task) => (
              <SortableItem key={task.id} id={task.id} task={task} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
        <Plus size={20} className="mr-2" />
        Add Study Task
      </Button>
    </div>
  );
}
