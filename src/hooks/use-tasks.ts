import { usePersistence } from './use-persistence';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  important: boolean;
  dueDate?: string;
  urgent?: boolean;
}

export function useTasks() {
  const [tasks, setTasks] = usePersistence<Task[]>('nexora-tasks', [
    { id: '1', text: 'Design Nexora UI', completed: true, important: true, dueDate: 'Today', urgent: true },
    { id: '2', text: 'Implement Chat Logic', completed: false, important: true, dueDate: 'Today', urgent: false },
    { id: '3', text: 'Add Persistence Layer', completed: false, important: false, dueDate: 'Today', urgent: false },
  ]);

  const addTask = (text: string) => {
    const task: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      important: false,
      dueDate: 'Today'
    };
    setTasks([task, ...tasks]);
    return task;
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleImportant = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, important: !t.important } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  return {
    tasks,
    addTask,
    toggleTask,
    toggleImportant,
    deleteTask,
    reorderTasks
  };
}
