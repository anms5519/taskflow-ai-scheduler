
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Check if we have the required values
if (!supabaseUrl || supabaseUrl === 'https://your-supabase-url.supabase.co') {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey || supabaseKey === 'your-supabase-anon-key') {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completed: boolean;
  user_id?: string;
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTasks();
    
    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (userId) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        setTasks(data || []);
      }
    }
    
    setLoading(false);
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return;
    }
    
    const { error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userId }]);
    
    if (error) {
      console.error('Error adding task:', error);
    } else {
      await fetchTasks();
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating task:', error);
    } else {
      await fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
    } else {
      await fetchTasks();
    }
  };

  return (
    <TasksContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
