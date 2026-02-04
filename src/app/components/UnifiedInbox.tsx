import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageCircle, 
  FileText, 
  CheckSquare, 
  Clock, 
  Star, 
  Trash2, 
  MoreHorizontal,
  CornerUpLeft,
  Paperclip,
  User,
  Tag,
  Search,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { getInboxItems } from '../api';

type Tenant = {
  id: string;
  name: string;
};

// Mock Data Types
type InboxItem = {
  id: string;
  source: 'email' | 'telegram' | 'amocrm';
  sender: {
    name: string;
    avatar?: string;
    email?: string;
  };
  subject: string; // or first line of message
  preview: string;
  timestamp: string;
  isRead: boolean;
  category: 'Sales' | 'HR' | 'Support' | 'Billing' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
};

export function UnifiedInbox({ tenant }: { tenant: Tenant }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadInbox();
  }, [tenant.id]);

  async function loadInbox() {
    setLoading(true);
    try {
      const data = await getInboxItems(tenant.id);
      setItems(data);
      setSelectedItem(data[0] ?? null);
    } catch (err) {
      console.error("Failed to load inbox", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* LEFT: List View */}
      <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-700 px-2">Inbox</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">5</span>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <Filter size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-2 overflow-x-auto border-b border-slate-200 bg-white">
          {['All', 'HR', 'Sales', 'Support'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                filter === f 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={clsx(
                "p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition-colors group relative",
                selectedItem?.id === item.id ? "bg-white shadow-sm border-l-4 border-l-indigo-600" : "bg-transparent border-l-4 border-l-transparent",
                !item.isRead && "bg-indigo-50/40"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {item.source === 'telegram' && <MessageCircle size={14} className="text-blue-500" />}
                  {item.source === 'email' && <Mail size={14} className="text-amber-500" />}
                  {item.source === 'amocrm' && <User size={14} className="text-indigo-500" />}
                  <span className={clsx("text-xs font-medium", !item.isRead ? "text-slate-900 font-bold" : "text-slate-600")}>
                    {item.sender.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {format(new Date(item.timestamp), 'HH:mm')}
                </span>
              </div>
              
              <h4 className={clsx("text-sm mb-1 truncate", !item.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                {item.subject}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.preview}
              </p>

              <div className="flex gap-2 mt-2">
                <span className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium border",
                  item.category === 'HR' && "bg-pink-50 text-pink-700 border-pink-200",
                  item.category === 'Sales' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                  item.category === 'Billing' && "bg-amber-50 text-amber-700 border-amber-200",
                  item.category === 'Support' && "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                  {item.category}
                </span>
                {item.tags.map(tag => (
                   <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                     #{tag}
                   </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Detail View */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedItem ? (
          <>
            {/* Action Header */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-2 text-slate-500">
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Archive">
                  <CheckSquare size={18} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Snooze">
                  <Clock size={18} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                 <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-2">
                   <Tag size={14} /> AI Actions
                 </button>
                 <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                {/* Subject & Meta */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-slate-900">{selectedItem.subject}</h1>
                    <span className="text-xs text-slate-400 border border-slate-200 px-2 py-1 rounded">
                      ID: {selectedItem.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {selectedItem.sender.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedItem.sender.name}
                        <span className="text-slate-400 font-normal ml-2 text-sm">&lt;{selectedItem.sender.email || 'via ' + selectedItem.source}&gt;</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(selectedItem.timestamp), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="prose prose-slate max-w-none mb-8">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.preview}
                    <br/><br/>
                    {/* Fake extra content for visual balance */}
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>

                {/* AI Suggested Actions Block */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                      <Star size={12} className="text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">Concierge AI Suggestions</h3>
                  </div>
                  
                  <div className="grid gap-2">
                    {selectedItem.category === 'HR' && (
                       <button className="w-full text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <FileText size={16} className="text-indigo-500" />
                           <div>
                             <p className="text-sm font-medium text-slate-700">Approve Job Description</p>
                             <p className="text-xs text-slate-400">Trigger DocFlow approval workflow</p>
                           </div>
                        </div>
                        <ArrowRightIcon className="text-slate-300 group-hover:text-indigo-500" />
                      </button>
                    )}
                     <button className="w-full text-left p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg shadow-sm transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <CheckSquare size={16} className="text-emerald-500" />
                           <div>
                             <p className="text-sm font-medium text-slate-700">Create Task for HR Team</p>
                             <p className="text-xs text-slate-400">Due: Tomorrow 10:00 AM</p>
                           </div>
                        </div>
                        <ArrowRightIcon className="text-slate-300 group-hover:text-emerald-500" />
                      </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Reply Area */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
               <div className="flex gap-2 mb-2">
                 <button className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 hover:border-indigo-300">
                    ✨ Draft response (Professional)
                 </button>
                  <button className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 hover:border-indigo-300">
                    ✨ Draft response (Friendly)
                 </button>
               </div>
               <div className="relative">
                 <textarea 
                  className="w-full border border-slate-300 rounded-lg p-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                  placeholder="Javob yozing yoki AI'dan so'rang..."
                 />
                 <div className="absolute bottom-2 right-2 flex gap-1">
                   <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                     <Paperclip size={16} />
                   </button>
                   <button className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm">
                     <Send size={16} />
                   </button>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <Mail size={48} className="mb-4 opacity-20" />
             <p>Xabarni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
