
import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import Loader from './Loader';
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
        confirmado: 'bg-green-500/20 text-green-300',
        pendente: 'bg-yellow-500/20 text-yellow-300',
        cancelado: 'bg-red-500/20 text-red-300',
    }

    const formatDate = (dateString: string) => {
        const [y,m,d] = dateString.split("-"); 
        return `${d}/${m}/${y}`; 
    }

    return (
        <div className="appointment-card">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 font-medium text-white-pure">
                    <Clock size={16} />
                    <span>{appointment.horario}</span>
                </div>
                <span className={`status-badge ${statusClasses[appointment.status]}`}>
                    {appointment.status}
                </span>
            </div>
             <div className="mb-4">
                <h3 className="font-medium text-lg text-white-pure">{appointment.nome}</h3>
                <p className="text-sm text-gray-300">{formatDate(appointment.data)}</p>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-400 border-t border-black-light pt-3">
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
                    <button onClick={() => onStatusChange(appointment.id, 'confirmado')} className="btn text-xs px-3 py-1.5 bg-green-500/80 text-white hover:bg-green-500">
                        <Check size={16} /> Confirmar
                    </button>
                )}
                {appointment.status !== 'cancelado' && (
                     <button onClick={() => onStatusChange(appointment.id, 'cancelado')} className="btn text-xs px-3 py-1.5 bg-red-500/80 text-white hover:bg-red-500">
                        <X size={16} /> Cancelar
                    </button>
                )}
                <button onClick={() => onRescheduleClick(appointment)} className="btn text-xs px-3 py-1.5 bg-blue-500/80 text-white hover:bg-blue-500">
                    <Edit size={16} /> Reagendar
                </button>
            </div>
        </div>
    );
};


const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, loading, onStatusChange, onReschedule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dayFilter, setDayFilter] = useState(new Date().getDay());
    
    const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(a => {
                const searchMatch = searchTerm === '' ||
                    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.email.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === '' || a.status === statusFilter;
                const appointmentDate = new Date(a.data + 'T00:00:00');
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
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full form-input-group">
                        <Search className="form-input-icon" size={20} />
                        <input type="text" placeholder="Pesquisar..."
                               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                               className="form-input" />
                    </div>
                    <div className="w-full md:w-56 form-input-group">
                        <Filter className="form-input-icon" size={20} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="form-input appearance-none">
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
                            className={`px-4 py-2 text-sm rounded-lg transition-all font-medium whitespace-nowrap ${dayFilter === index ? 'bg-blue-600 text-white' : 'bg-black-light hover:bg-black-deep'}`}>
                        {day}
                    </button>
                ))}
                <button onClick={() => setDayFilter(-1)}
                        className={`px-4 py-2 text-sm rounded-lg transition-all font-medium whitespace-nowrap ${dayFilter === -1 ? 'bg-blue-600 text-white' : 'bg-black-light hover:bg-black-deep'}`}>
                    Todos
                </button>
            </div>
        </div>

        <div className="glass-card p-4 sm:p-6 max-h-[60vh] overflow-y-auto" data-aos="fade-up">
            {loading ? (
                <div className="flex justify-center items-center h-40"><Loader /></div>
            ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => (
                    <AppointmentCard key={app.id} appointment={app} onStatusChange={onStatusChange} onRescheduleClick={setReschedulingAppointment} />
                ))
            ) : (
                <div className='text-center py-12'>
                    <CalendarIcon className="w-12 h-12 text-gray-steel mx-auto mb-4" />
                    <p className="text-gray-steel">Nenhum agendamento encontrado.</p>
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
