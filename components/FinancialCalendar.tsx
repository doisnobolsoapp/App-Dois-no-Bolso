import React, { useState, useMemo } from 'react';
import { AppData, Transaction, TransactionType } from '../types';
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Clock, X, Filter, CalendarDays } from 'lucide-react';
// Removido: AlertCircle

interface FinancialCalendarProps {
  data: AppData;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  currentUserId: string;
}
export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ data, onAddTransaction, onDeleteTransaction, currentUserId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterOwner, setFilterOwner] = useState<'ALL' | 'ME' | 'PARTNER'>('ALL');

  // Helpers for Date Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  // Generate Calendar Grid
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null); // Empty slots
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate, daysInMonth, firstDayOfMonth]);

  // Filter Transactions for this view
  const monthTransactions = useMemo(() => {
    return data.transactions.filter(t => {
      // Only expenses/loans show as bills
      if (t.type !== TransactionType.EXPENSE && t.type !== TransactionType.LOAN) return false;
      
      // Date check (Use Due Date if available, otherwise Transaction Date)
      const dateStr = t.dueDate || t.date;
      const tDate = new Date(dateStr + 'T00:00:00');
      
      const matchesMonth = tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
      if (!matchesMonth) return false;

      // Owner Filter
      if (data.userMode === 'COUPLE') {
         if (filterOwner === 'ME' && t.createdBy && t.createdBy !== currentUserId) return false;
         if (filterOwner === 'PARTNER' && t.createdBy && t.createdBy === currentUserId) return false;
      }

      return true;
    });
  }, [data.transactions, currentDate, filterOwner, data.userMode, currentUserId]);

  const getDayStatus = (day: number, transactions: Transaction[]) => {
    if (transactions.length === 0) return null;

    // Check highest priority status
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];

    const hasOverdue = transactions.some(t => !t.paid && dateStr < todayStr);
    if (hasOverdue) return 'OVERDUE';

    const hasDueToday = transactions.some(t => !t.paid && dateStr === todayStr);
    if (hasDueToday) return 'DUE_TODAY';

    const hasDueTomorrow = transactions.some(t => !t.paid && dateStr === tomorrowStr);
    if (hasDueTomorrow) return 'DUE_TOMORROW';

    const allPaid = transactions.every(t => t.paid);
    if (allPaid) return 'PAID';

    return 'NORMAL';
  };

  const renderDayCell = (day: number | null) => {
    if (!day) return <div className="bg-slate-50/50 h-24 md:h-32"></div>;

    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    const dayTrans = monthTransactions.filter(t => (t.dueDate || t.date) === dateStr);
    const status = getDayStatus(day, dayTrans);

    let bgColor = 'bg-white hover:bg-slate-50';
    let indicatorColor = '';

    switch (status) {
        case 'OVERDUE': indicatorColor = 'bg-red-500'; break;
        case 'DUE_TODAY': indicatorColor = 'bg-yellow-500'; break;
        case 'DUE_TOMORROW': indicatorColor = 'bg-blue-500'; break;
        case 'PAID': indicatorColor = 'bg-green-500'; break;
        case 'NORMAL': indicatorColor = 'bg-slate-300'; break;
    }

    const totalAmount = dayTrans.reduce((acc, t) => acc + t.amount, 0);

    return (
      <div 
        onClick={() => { setSelectedDate(dateStr); }}
        className={`h-24 md:h-32 border border-slate-100 p-2 relative transition-colors cursor-pointer flex flex-col justify-between ${bgColor}`}
      >
        <div className="flex justify-between items-start">
            <span className={`text-sm font-bold ${status === 'DUE_TODAY' ? 'text-brand-600' : 'text-slate-700'}`}>{day}</span>
            {dayTrans.length > 0 && (
                <div className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></div>
            )}
        </div>
        
        {dayTrans.length > 0 && (
            <div className="text-[10px] text-slate-500">
                <p className="font-semibold truncate">{dayTrans.length} conta{dayTrans.length > 1 ? 's' : ''}</p>
                <p className="truncate">R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</p>
            </div>
        )}
      </div>
    );
  };

  const selectedDateTransactions = useMemo(() => {
      if (!selectedDate) return [];
      return data.transactions.filter(t => (t.dueDate || t.date) === selectedDate && (t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN));
  }, [selectedDate, data.transactions]);

  return (
    <div className="pb-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <CalendarDays className="mr-2 text-brand-600" />
                    Calendário Financeiro
                </h2>
                <p className="text-slate-500 text-sm">Organize seus vencimentos mensalmente.</p>
            </div>
            
            <button 
                onClick={() => onAddTransaction({
                    type: TransactionType.EXPENSE,
                    description: '',
                    amount: 0,
                    category: 'Contas Fixas',
                    date: new Date().toISOString().split('T')[0],
                    paid: false,
                    paymentMethod: 'CASH' as any
                })}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
            >
                <Plus size={18} className="mr-2" />
                Nova Conta
            </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
             <div className="flex items-center gap-4">
                 <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20}/></button>
                 <span className="font-bold text-lg w-40 text-center capitalize">
                     {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight size={20}/></button>
             </div>

             {data.userMode === 'COUPLE' && (
                 <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                     <Filter size={16} className="text-slate-400 ml-2"/>
                     <select 
                        className="bg-transparent text-sm outline-none text-slate-600 font-medium pr-2"
                        value={filterOwner}
                        onChange={(e) => setFilterOwner(e.target.value as any)}
                     >
                         <option value="ALL">Todas as Contas</option>
                         <option value="ME">Minhas Contas</option>
                         <option value="PARTNER">Contas do Parceiro</option>
                     </select>
                 </div>
             )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 justify-center md:justify-start">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div> Vencidas</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div> Vence Hoje</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div> Vence Amanhã</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div> Pagas</div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => (
                    <React.Fragment key={idx}>
                        {renderDayCell(day)}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* Detail Modal */}
        {selectedDate && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                 <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                     <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                         <h3 className="font-bold text-lg text-slate-800 flex items-center">
                             <CalendarDays className="mr-2" size={18}/>
                             {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                         </h3>
                         <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                     </div>
                     
                     <div className="p-6 overflow-y-auto flex-1">
                         {selectedDateTransactions.length === 0 ? (
                             <p className="text-center text-slate-400 py-4">Nenhuma conta para este dia.</p>
                         ) : (
                             <div className="space-y-3">
                                 {selectedDateTransactions.map(t => {
                                     const isPaid = t.paid;
                                     return (
                                         <div key={t.id} className={`p-3 rounded-lg border ${isPaid ? 'border-green-100 bg-green-50' : 'border-slate-100 bg-white'} flex justify-between items-center`}>
                                             <div>
                                                 <p className="font-bold text-slate-800">{t.description}</p>
                                                 <p className="text-xs text-slate-500">{t.category} • R$ {t.amount.toFixed(2)}</p>
                                                 <div className="mt-1">
                                                     {isPaid ? (
                                                         <span className="inline-flex items-center text-[10px] text-green-700 font-bold"><CheckCircle size={10} className="mr-1"/> Paga</span>
                                                     ) : (
                                                         <span className="inline-flex items-center text-[10px] text-amber-600 font-bold"><Clock size={10} className="mr-1"/> Pendente</span>
                                                     )}
                                                 </div>
                                             </div>
                                             <button 
                                                 onClick={() => onDeleteTransaction(t.id)} 
                                                 className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                             >
                                                 <X size={16} />
                                             </button>
                                         </div>
                                     )
                                 })}
                             </div>
                         )}
                         <div className="mt-6 text-center">
                            <button 
                                onClick={() => {
                                    onAddTransaction({
                                        type: TransactionType.EXPENSE,
                                        description: '',
                                        amount: 0,
                                        category: 'Outros Gastos',
                                        date: selectedDate,
                                        paid: false,
                                        paymentMethod: 'CASH' as any
                                    });
                                    setSelectedDate(null);
                                }}
                                className="text-brand-600 font-medium text-sm hover:underline"
                            >
                                + Adicionar conta neste dia
                            </button>
                         </div>
                     </div>
                 </div>
             </div>
        )}
    </div>
  );
};
