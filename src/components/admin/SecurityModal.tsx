import React, { useState, useEffect } from 'react';
import { KeyRound, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { apiRequest } from '../../api';
import { ADMIN_SESSION_KEY, DEFAULT_ADMIN_USER } from '../../utils/constants';

interface SecurityModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SecurityModal({ open, onClose }: SecurityModalProps) {
  const {
    adminToken,
    adminConfig,
    setAdminConfig,
    googleMapsApiKey,
    setGoogleMapsApiKey,
    notify
  } = useAdmin();

  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminPassConfirm, setNewAdminPassConfirm] = useState('');
  const [hideHintToggle, setHideHintToggle] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNewAdminUser(adminConfig?.username || DEFAULT_ADMIN_USER);
    setNewAdminPass('');
    setNewAdminPassConfirm('');
    setHideHintToggle(Boolean(adminConfig?.hideDefaultHint));
  }, [open, adminConfig]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = newAdminUser.trim();
    if (!username) {
      notify('El usuario de administrador no puede estar vacío.', 'warning');
      return;
    }
    if (newAdminPass && newAdminPass.length < 10) {
      notify('La nueva contraseña debe tener al menos 10 caracteres.', 'warning');
      return;
    }
    if (newAdminPass !== newAdminPassConfirm) {
      notify('Las contraseñas no coinciden.', 'error');
      return;
    }

    try {
      const result = await apiRequest('/api/admin/config', adminToken, {
        method: 'PUT',
        body: JSON.stringify({
          username,
          password: newAdminPass || undefined,
          hideDefaultHint: Boolean(hideHintToggle),
          remember: true
        })
      });
      setAdminConfig(result.adminConfig || { username, hideDefaultHint: Boolean(hideHintToggle) });
      if (result.token) {
        try {
          sessionStorage.setItem(ADMIN_SESSION_KEY, result.token);
          localStorage.setItem(ADMIN_SESSION_KEY, result.token);
        } catch {}
      }
      setNewAdminPass('');
      setNewAdminPassConfirm('');
      onClose();
      notify('Credenciales guardadas de forma segura en el servidor.');
    } catch (error: any) {
      notify(`No se pudieron guardar las credenciales: ${error.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
      >
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-zinc-800" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Seguridad y Credenciales de Administrador
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Usuario de Administrador</label>
            <input
              type="text"
              required
              value={newAdminUser}
              onChange={(e) => setNewAdminUser(e.target.value)}
              className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Nueva Contraseña Maestra (dejar en blanco para mantener actual)
            </label>
            <input
              type="password"
              value={newAdminPass}
              onChange={(e) => setNewAdminPass(e.target.value)}
              placeholder="Mínimo 10 caracteres..."
              className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={newAdminPassConfirm}
              onChange={(e) => setNewAdminPassConfirm(e.target.value)}
              placeholder="Repetir nueva contraseña..."
              className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 pt-1 text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={hideHintToggle}
              onChange={(e) => setHideHintToggle(e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span>Ocultar pista de credenciales iniciales en la pantalla de Login (/1620)</span>
          </label>

          <div className="pt-2 border-t border-zinc-200">
            <label className="block font-medium text-zinc-700 mb-1">
              Google Maps Geocoding API Key (Opcional)
            </label>
            <input
              type="password"
              value={googleMapsApiKey}
              onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              placeholder="AIzaSy... (Opcional)"
              className="w-full h-8 px-2.5 font-mono bg-zinc-50 border border-zinc-200 rounded-lg"
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-4 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 cursor-pointer"
          >
            Guardar Credenciales
          </button>
        </div>
      </form>
    </div>
  );
}