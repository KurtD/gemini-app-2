import React from 'react';
import { ArrowLeft, Settings, LogOut, MessageSquare } from 'lucide-react';
import { MOCK_SIDEBAR_CHATS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-30
        fixed inset-y-0 left-0 w-[280px] md:relative md:transform-none md:w-72 md:flex
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'} 
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b h-14 flex items-center justify-between bg-gray-50/80 backdrop-blur-xl">
          <span className="font-semibold text-xs tracking-wider text-gray-500 uppercase">My Agents</span>
          <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded-md">
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
           {/* Active Chat Item */}
           <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm cursor-pointer group">
             <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:bg-purple-700 transition-colors">
                C
             </div>
             <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">Charles</div>
                <div className="text-xs text-gray-500 truncate">Active now</div>
             </div>
           </div>

           {/* History Header */}
           <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
             Recent Conversations
           </div>

           {/* Previous Chats */}
           {MOCK_SIDEBAR_CHATS.map(chat => (
             <div 
                key={chat.id} 
                className="p-2.5 text-sm text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3"
             >
               <MessageSquare size={16} className="text-gray-400" />
               <span className="truncate">{chat.title}</span>
             </div>
           ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t bg-gray-100/50 space-y-1">
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
             <Settings size={18} /> 
             <span>User Preferences</span>
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:shadow-sm rounded-lg transition-all">
             <LogOut size={18} /> 
             <span>Log Out</span>
           </button>
           
           <div className="mt-4 px-3 text-xs text-gray-400">
             kd@abc.com
           </div>
        </div>
      </aside>
    </>
  );
}