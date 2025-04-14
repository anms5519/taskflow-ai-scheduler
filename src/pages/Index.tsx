
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import TaskModal from '@/components/TaskModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';

const Index = () => {
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<typeof tasks[0] | undefined>(undefined);

  const handleAddTask = () => {
    setCurrentTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: typeof tasks[0]) => {
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleToggleComplete = async (task: typeof tasks[0]) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      toast.success(`Task ${task.completed ? 'uncompleted' : 'completed'}`);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] flex flex-col">
      <header className="bg-[#9b87f5] text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">TaskFlow AI</h1>
      </header>
      
      <main className="flex-grow p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1A1F2C]">Your Tasks</h2>
            <Button 
              onClick={handleAddTask} 
              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No tasks yet. Let's get started!</p>
              <Button 
                onClick={handleAddTask} 
                className="w-full sm:w-auto bg-[#9b87f5] hover:bg-[#7E69AB]"
              >
                <Plus className="mr-2" /> Add Your First Task
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className={task.completed ? 'bg-gray-50' : ''}>
                      <TableCell>
                        <button onClick={() => handleToggleComplete(task)} className="p-1">
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className={task.completed ? 'line-through text-gray-500' : ''}>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      
      <TaskModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
        currentTask={currentTask} 
      />
    </div>
  );
};

export default Index;
