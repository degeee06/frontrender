
import React, { useState } from 'react';
import { Appointment } from '../types';
import { X } from 'react-feather';

interface RescheduleModalProps {
    appointment: Appointment;
    onClose: () => void;
    onConfirm: (id: number, newDate: string, newTime: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
    const [newDate, setNewDate] = useState(appointment.data);
    const [newTime, setNewTime] = useState(appointment.horario);

    const handleConfirm = () => {
        onConfirm(appointment.id, newDate, newTime);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-black-medium border border-black-light rounded-xl p-6 w-full max-w-md relative animate-fade-in glass-card">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                <h2 className="text-lg font-medium mb-4 text-white">Reagendar para {appointment.nome}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Nova Data</label>
                        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                               className="w-full p-3 rounded-md bg-black-deep border border-black-light text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Novo Horário</label>
                        <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                               className="w-full p-3 rounded-md bg-black-deep border border-black-light text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all">Cancelar</button>
                    <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
