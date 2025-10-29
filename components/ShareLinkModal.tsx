import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { X, Copy } from 'react-feather';

interface ShareLinkModalProps {
    link: string;
    qrCodeUrl: string;
    onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ link, qrCodeUrl, onClose }) => {
    const { addToast } = useToast();

    const copyLink = () => {
        navigator.clipboard.writeText(link).then(() => {
            addToast("✅ Link copiado para a área de transferência!", "success");
        }).catch(() => {
            addToast("❌ Erro ao copiar link", "error");
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1002] p-4">
            <div className="glass-card rounded-xl p-6 w-full max-w-md mx-auto animate-fade-in relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X size={20}/>
                </button>
                
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">🔗 Seu Link de Agendamento</h3>
                    <p className="text-sm text-gray-300 mb-4">Compartilhe este link com seus clientes!</p>
                    
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                        <code className="text-xs break-all text-cyan-300">{link}</code>
                    </div>
                    
                    <button onClick={copyLink} 
                            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:scale-95 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2">
                        <Copy size={16}/> Copiar Link
                    </button>
                    
                    {qrCodeUrl && (
                        <div className="text-center border-t border-white/10 pt-4 mt-4">
                            <p className="text-sm text-gray-300 mb-2">Ou escaneie o QR Code:</p>
                            <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-lg border-2 border-white/20 w-32 h-32 bg-white p-1" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareLinkModal;