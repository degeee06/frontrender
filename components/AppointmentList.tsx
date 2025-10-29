
import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import Loader from './Loader';
// Fix: Import missing icons (Clock, Mail, Phone) from react-feather.
import { Search, Filter, Calendar as CalendarIcon, Edit, Check, X, Clock, Mail, Phone } from 'react-feather';
import RescheduleModal from './RescheduleModal';

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  onStatusChange: (id: number, status: AppointmentStatus) => void;
  onReschedule: (id: number, newDate: string, newTime: string) => void;
}

const AppointmentCard: React.FC<{ appointment: Appointment; onStatusChange: AppointmentListProps['onStatusChange']; onRescheduleClick: (appointment: Appointment) => void }> = ({ appointment, onStatusChange, onRescheduleClick }) => {
    
    const statusClasses: Record<AppointmentStatus, string> = {
        confirmado: 'bg-green-900/30 text-green-300',
        pendente: 'bg-yellow-900/30 text-yellow-300',
        cancelado: 'bg-red-900/30 text-red-300',
    }

    const formatDate = (dateString: string) => {
        const [y,m,d] = dateString.split("-"); 
        return `${d}/${m}/${y}`; 
    }

    return (
        <div className="agendamento-card glass-card rounded-xl p-5 mb-4 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 font-medium">
                    <Clock size={16} className="text-gray-300" />
                    <span>{appointment.horario}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClasses[appointment.status]}`}>
                    {appointment.status}
                </span>
            </div>
             <div className="flex items-center gap-3 mb-3">
                <div>
                    <h3 className="font-medium text-lg">{appointment.nome}</h3>
                    <p className="text-sm text-gray-300">{formatDate(appointment.data)}</p>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                <div className="flex items-center gap-2 truncate">
                    <Mail size={16} />
                    <span className="truncate">{appointment.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{appointment.telefone}</span>
                </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
                {appointment.status !== 'confirmado' && (
                    <button onClick={() => onStatusChange(appointment.id, 'confirmado')} className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center gap-1 shadow-md hover:opacity-90 transition-all">
                        <Check size={16} /> Confirmar
                    </button>
                )}
                {appointment.status !== 'cancelado' && (
                     <button onClick={() => onStatusChange(appointment.id, 'cancelado')} className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center gap-1 shadow-md hover:opacity-90 transition-all">
                        <X size={16} /> Cancelar
                    </button>
                )}
                <button onClick={() => onRescheduleClick(appointment)} className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center gap-1 shadow-md hover:opacity-90 transition-all">
                    <Edit size={16} /> Reagendar
                </button>
            </div>
        </div>
    );
};


const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, loading, onStatusChange, onReschedule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dayFilter, setDayFilter] = useState(new Date().getDay()); // Default to today
    
    const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(a => {
                const searchMatch = searchTerm === '' ||
                    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.email.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === '' || a.status === statusFilter;
                const appointmentDate = new Date(a.data + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
                const dayMatch = dayFilter === -1 || appointmentDate.getDay() === dayFilter;

                return searchMatch && statusMatch && dayMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.data}T${a.horario}`);
                const dateB = new Date(`${b.data}T${b.horario}`);
                return dateA.getTime() - dateB.getTime();
            });
    }, [appointments, searchTerm, statusFilter, dayFilter]);
    
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <>
        <div data-aos="fade-up">
            <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-steel" />
                        <input type="text" placeholder="Pesquisar por nome ou email"
                               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                               className="w-full pl-10 pr-4 py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-white" />
                    </div>
                    <div className="w-full md:w-48 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-steel" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-10 pr-4 py-3 rounded-lg bg-black-medium border border-black-light text-white-ice focus:outline-none input-field">
                            <option value="">Todos os status</option>
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {daysOfWeek.map((day, index) => (
                    <button key={index} onClick={() => setDayFilter(index)}
                            className={`tab-dia px-5 py-2.5 rounded-xl transition-all font-medium whitespace-nowrap ${dayFilter === index ? 'active' : 'bg-black-medium hover:bg-black-light'}`}>
                        {day}
                    </button>
                ))}
                <button onClick={() => setDayFilter(-1)}
                        className={`tab-dia px-5 py-2.5 rounded-xl transition-all font-medium whitespace-nowrap ${dayFilter === -1 ? 'active' : 'bg-black-medium hover:bg-black-light'}`}>
                    Todos
                </button>
            </div>
        </div>

        <div className="glass-card p-6 max-h-[500px] overflow-y-auto" data-aos="fade-up">
            {loading ? (
                <div className="flex justify-center items-center h-40"><Loader /></div>
            ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => (
                    <AppointmentCard key={app.id} appointment={app} onStatusChange={onStatusChange} onRescheduleClick={setReschedulingAppointment} />
                ))
            ) : (
                <div className='text-center py-8'>
                    <CalendarIcon className="w-12 h-12 text-gray-steel mx-auto mb-4" />
                    <p className="text-gray-steel">Nenhum agendamento encontrado para os filtros selecionados.</p>
                </div>
            )}
        </div>
        
        {reschedulingAppointment && (
            <RescheduleModal 
                appointment={reschedulingAppointment}
                onClose={() => setReschedulingAppointment(null)}
                onConfirm={onReschedule}
            />
        )}
        </>
    );
};

export default AppointmentList;
