
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F1F0FB] flex flex-col">
      <header className="bg-[#9b87f5] text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">TaskFlow AI</h1>
      </header>
      
      <main className="flex-grow p-4">
        <section className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-[#1A1F2C] mb-4">Your Tasks</h2>
          <p className="text-gray-600 mb-4">No tasks yet. Let's get started!</p>
          
          <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
            <Plus className="mr-2" /> Add New Task
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Index;
