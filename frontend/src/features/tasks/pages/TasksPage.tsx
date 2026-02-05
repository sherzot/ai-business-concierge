import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layout,
  List as ListIcon,
  User,
  Paperclip,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { createTask, getTasks } from "../api/tasksApi";
import { useI18n } from "../../../app/providers/I18nProvider";

// Actually, I'll stick to a clean UI without complex dnd libraries first to ensure stability, 
// but I will design it to LOOK like a Kanban board.

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type TaskPriority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: { name: string; avatar?: string };
  dueDate?: string | Date; // API returns string
  tags: string[];
  comments: number;
}

export function TasksPage({ tenant }: { tenant: any }) {
  const { translate } = useI18n();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadTasks();
  }, [tenant.id]);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(tenant.id);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
      setError(translate("tasks.loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMockTask() {
    const newTask = {
      title: translate("tasks.demoTitle"),
      status: 'todo',
      priority: 'medium',
      tags: ['Demo'],
      comments: 0
    };
    try {
      const created = await createTask(tenant.id, newTask);
      setTasks(prev => [...prev, created]);
    } catch (err) {
      console.error("Error creating task", err);
      setError(translate("tasks.createError"));
    }
  }

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: translate("tasks.column.todo"), color: 'bg-slate-500' },
    { id: 'in_progress', label: translate("tasks.column.inProgress"), color: 'bg-indigo-500' },
    { id: 'review', label: translate("tasks.column.review"), color: 'bg-amber-500' },
    { id: 'done', label: translate("tasks.column.done"), color: 'bg-emerald-500' }
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-indigo-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-rose-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={translate("tasks.search")} 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('board')}
              className={clsx("p-1.5 rounded-md transition-all", viewMode === 'board' ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50")}
            >
              <Layout size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={clsx("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50")}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
             <Filter size={16} /> {translate("tasks.filter")}
           </button>
           <button 
             onClick={handleCreateMockTask}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
           >
             <Plus size={18} /> {translate("tasks.newTask")}
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            {translate("tasks.empty")}
          </div>
        ) : viewMode === 'board' ? (
          <div className="flex gap-6 h-full min-w-[1000px] pb-4">
            {columns.map(col => (
              <div key={col.id} className="flex-1 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/60">
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {tasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Tasks List */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg border border-dashed border-slate-300 hover:border-indigo-300 text-sm transition-all">
                    <Plus size={16} /> {translate("tasks.addTask")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{translate("tasks.table.task")}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{translate("tasks.table.status")}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{translate("tasks.table.assignee")}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{translate("tasks.table.dueDate")}</th>
                   <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{translate("tasks.table.priority")}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {tasks.map(task => (
                   <tr key={task.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                     <td className="px-6 py-4">
                       <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                       <div className="flex gap-2 mt-1">
                         {task.tags.map(tag => (
                           <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">#{tag}</span>
                         ))}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <StatusBadge status={task.status} />
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         {task.assignee ? (
                           <>
                             <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                               {task.assignee.name.charAt(0)}
                             </div>
                             <span className="text-sm text-slate-600">{task.assignee.name}</span>
                           </>
                         ) : (
                           <span className="text-sm text-slate-400 italic">{translate("tasks.assign")}</span>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        {task.dueDate && (
                          <div className={clsx("flex items-center gap-1.5 text-sm", 
                            new Date(task.dueDate) < new Date() && task.status !== 'done' ? "text-rose-600 font-medium" : "text-slate-600"
                          )}>
                            <Calendar size={14} />
                            {format(new Date(task.dueDate), 'dd MMM')}
                          </div>
                        )}
                     </td>
                     <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <div className={clsx("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded", 
             new Date(task.dueDate) < new Date() ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
          )}>
            <Clock size={10} />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        )}
      </div>
      
      <h4 className="text-sm font-medium text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2">
           {task.assignee ? (
             <div className="flex items-center gap-1.5" title={task.assignee.name}>
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                  {task.assignee.name.charAt(0)}
                </div>
                <span className="text-xs text-slate-500 truncate max-w-[60px]">{task.assignee.name}</span>
             </div>
           ) : (
             <span className="text-xs text-slate-400 flex items-center gap-1"><User size={12} /> {translate("tasks.assign")}</span>
           )}
        </div>
        
        <div className="flex items-center gap-3 text-slate-400">
           {task.tags.length > 0 && (
              <span className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                {task.tags[0]}
              </span>
           )}
           <div className="flex items-center gap-1 text-xs">
              <Paperclip size={12} />
              <span>{task.comments}</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const { translate } = useI18n();
  const styles = {
    todo: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    review: 'bg-amber-50 text-amber-700 border-amber-200',
    done: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
  
  const labels = {
    todo: translate("tasks.status.todo"),
    in_progress: translate("tasks.status.in_progress"),
    review: translate("tasks.status.review"),
    done: translate("tasks.status.done"),
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { translate } = useI18n();
  const styles = {
    high: 'text-rose-600 bg-rose-50 border-rose-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-blue-600 bg-blue-50 border-blue-100'
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${styles[priority]}`}>
      {translate(`tasks.priority.${priority}`)}
    </span>
  );
}
