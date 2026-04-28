import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ClipboardList, CreditCard as Edit2, X, Download } from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [
      { id: crypto.randomUUID(), text, completed: false, priority, createdAt: Date.now() },
      ...prev,
    ]);
    setInput('');
    setPriority('medium');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, text } : t))
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') cancelEdit();
  };

  const clearAllTodos = () => {
    setTodos([]);
    setShowClearConfirm(false);
  };

  const exportTodos = () => {
    const content = todos
      .map(todo => {
        const status = todo.completed ? '[✓]' : '[ ]';
        const priorityLabel = getPriorityLabel(todo.priority);
        return `${status} ${todo.text} (优先级: ${priorityLabel})`;
      })
      .join('\n');

    const header = `待办事项导出 - ${new Date().toLocaleString('zh-CN')}\n总计: ${todos.length} 项 | 完成: ${completedCount} 项 | 待完成: ${pendingCount} 项\n${'='.repeat(50)}\n`;
    const text = header + content;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `待办事项_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-100 before:bg-red-400';
      case 'medium':
        return 'bg-yellow-50 border-yellow-100 before:bg-yellow-400';
      case 'low':
        return 'bg-green-50 border-green-100 before:bg-green-400';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">待办事项</h1>
          <p className="text-gray-500 mt-1 text-sm">保持专注，完成每一件事</p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-blue-50 text-center">
            <div className="text-2xl font-bold text-blue-500">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">待完成</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-blue-50 text-center">
            <div className="text-2xl font-bold text-emerald-500">{completedCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">已完成</div>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-blue-50 text-center">
            <div className="text-2xl font-bold text-gray-700">{todos.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">全部</div>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3 mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="今天要做什么？"
              className="flex-1 bg-white border border-blue-100 rounded-2xl px-4 py-3 text-gray-700 placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all text-sm"
            />
            <button
              onClick={addTodo}
              disabled={!input.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 disabled:cursor-not-allowed text-white rounded-2xl px-4 py-3 shadow-sm shadow-blue-200 transition-all active:scale-95 flex items-center gap-1.5 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">添加</span>
            </button>
          </div>
          <div className="flex gap-2 justify-center">
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  priority === p
                    ? p === 'high'
                      ? 'bg-red-400 text-white'
                      : p === 'medium'
                        ? 'bg-yellow-400 text-white'
                        : 'bg-green-400 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {p === 'high' ? '高优先' : p === 'medium' ? '中优先' : '低优先'}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todos.length === 0 && (
            <div className="bg-white rounded-2xl px-6 py-12 text-center shadow-sm border border-blue-50">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6 text-blue-300" />
              </div>
              <p className="text-gray-400 text-sm">暂无任务，添加一个开始吧！</p>
            </div>
          )}

          {todos.map(todo => (
            <div
              key={todo.id}
              className={`group relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-2xl flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border transition-all duration-200 ${getPriorityColor(todo.priority)} ${
                todo.completed
                  ? 'opacity-70'
                  : 'hover:shadow-md hover:shadow-blue-50'
              }`}
            >
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => handleEditKeyDown(e, todo.id)}
                    autoFocus
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 transition-transform active:scale-90"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-blue-200 hover:text-blue-400 transition-colors" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm leading-relaxed transition-all cursor-pointer ${
                      todo.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.text}
                  </span>

                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-gray-300 hover:text-blue-400 transition-colors active:scale-90 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors active:scale-90 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {todos.length > 0 && (
            <button
              onClick={exportTodos}
              className="flex-1 min-w-fit text-xs text-gray-400 hover:text-blue-400 py-2 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
              className="flex-1 min-w-fit text-xs text-gray-400 hover:text-red-400 py-2 transition-colors"
            >
              清除已完成 ({completedCount})
            </button>
          )}
          {todos.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 min-w-fit text-xs text-gray-400 hover:text-red-500 py-2 transition-colors"
            >
              全部清空
            </button>
          )}
        </div>

        {/* Clear All Confirmation */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">确认清空所有任务？</h3>
              <p className="text-gray-500 text-sm mb-6">这个操作无法撤销，所有任务都将被删除。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={clearAllTodos}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  确认清空
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
