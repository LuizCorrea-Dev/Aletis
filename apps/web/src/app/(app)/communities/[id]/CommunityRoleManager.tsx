"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Crown,
  Star,
  Flame,
  Zap,
  Award,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Eye,
  UserCheck,
  UserX,
  VolumeX,
  Vote,
  UserCog,
} from "lucide-react";
import {
  getRolesAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/app/actions/community-actions";

interface CommunityRoleManagerProps {
  communityId: string;
}

const PRESET_COLORS = [
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
];

const PRESET_ICONS = [
  { name: "Shield", icon: Shield },
  { name: "Crown", icon: Crown },
  { name: "Star", icon: Star },
  { name: "Flame", icon: Flame },
  { name: "Zap", icon: Zap },
  { name: "Award", icon: Award },
  { name: "Heart", icon: Heart },
  { name: "Sparkles", icon: Sparkles },
];

export default function CommunityRoleManager({ communityId }: CommunityRoleManagerProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [icon, setIcon] = useState("Shield");
  const [permissions, setPermissions] = useState({
    canViewPrivateChannels: false,
    canChangeNicknames: false,
    canKickMembers: false,
    canManageJoinRequests: false,
    canBanMembers: false,
    canMuteMembers: false,
    canCreatePolls: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const res = await getRolesAction(communityId);
      if (res.success && res.data) {
        setRoles(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [communityId]);

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setName("");
    setColor("#a855f7");
    setIcon("Shield");
    setPermissions({
      canViewPrivateChannels: false,
      canChangeNicknames: false,
      canKickMembers: false,
      canManageJoinRequests: false,
      canBanMembers: false,
      canMuteMembers: false,
      canCreatePolls: false,
    });
    setErrorMsg("");
  };

  const handleOpenEdit = (role: any) => {
    setEditingRoleId(role.id);
    setName(role.name);
    setColor(role.color || "#a855f7");
    setIcon(role.icon || "Shield");
    setPermissions(role.permissions || {});
    setErrorMsg("");
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome do cargo é obrigatório.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      if (editingRoleId) {
        const res = await updateRoleAction(communityId, editingRoleId, {
          name: name.trim(),
          color,
          icon,
          permissions,
        });
        if (res.success) {
          await loadRoles();
          setEditingRoleId(null);
        } else {
          setErrorMsg(res.message || "Erro ao atualizar cargo.");
        }
      } else {
        const res = await createRoleAction(communityId, {
          name: name.trim(),
          color,
          icon,
          permissions,
        });
        if (res.success) {
          await loadRoles();
          handleOpenCreate();
        } else {
          setErrorMsg(res.message || "Erro ao criar cargo.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao salvar cargo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) return;
    try {
      const res = await deleteRoleAction(communityId, roleId);
      if (res.success) {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
        if (editingRoleId === roleId) setEditingRoleId(null);
      } else {
        alert(res.message || "Erro ao excluir cargo.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const found = PRESET_ICONS.find((i) => i.name === iconName);
    const Comp = found ? found.icon : Shield;
    return <Comp size={16} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-white font-display flex items-center gap-2">
            <Crown size={18} className="text-[#a855f7]" />
            Gerenciamento de Cargos e Permissões
          </h3>
          <p className="text-xs text-slate-400">
            Crie cargos personalizados, selecione cores, ícones e habilite flags de permissões.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#a855f7] hover:bg-[#a855f7]/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus size={16} /> Novo Cargo
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#a855f7]" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de Cargos */}
          <div className="md:col-span-1 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Cargos Existentes ({roles.length})
            </h4>

            {roles.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                Nenhum cargo personalizado criado ainda.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-100 overflow-y-auto pr-1">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenEdit(r)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      editingRoleId === r.id
                        ? "bg-slate-800 border-[#a855f7] shadow-md"
                        : "bg-slate-900/50 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: r.color }}
                      >
                        {getIconComponent(r.icon)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{r.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {Object.values(r.permissions || {}).filter(Boolean).length} permissões
                        </p>
                      </div>
                    </div>

                    {!r.isSystem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(r.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form de Criar / Editar Cargo */}
          <form onSubmit={handleSaveRole} className="md:col-span-2 bg-slate-900/60 border border-slate-700/80 rounded-2xl p-5 space-y-5">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-display border-b border-slate-800 pb-2">
              {editingRoleId ? "Editar Cargo" : "Criar Novo Cargo"}
            </h4>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Nome do Cargo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Nome do Cargo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Guardião da Luz"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            {/* Cor e Ícone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seleção de Cor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cor do Cargo</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                        color === c ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Seleção de Ícone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Ícone do Cargo</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_ICONS.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          icon === item.name
                            ? "bg-[#a855f7] border-white text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <IconComp size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Permissões do Cargo (Flags Booleanas) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Permissões Granulares do Cargo
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <TogglePermissionItem
                  icon={<Eye size={14} className="text-blue-400" />}
                  label="Ver Canais Privados"
                  desc="Acesso a canais não públicos restritos."
                  value={permissions.canViewPrivateChannels}
                  onChange={(val) => setPermissions((p) => ({ ...p, canViewPrivateChannels: val }))}
                />

                <TogglePermissionItem
                  icon={<UserCog size={14} className="text-emerald-400" />}
                  label="Criar Apelidos"
                  desc="Definir apelidos para usuários no grupo."
                  value={permissions.canChangeNicknames}
                  onChange={(val) => setPermissions((p) => ({ ...p, canChangeNicknames: val }))}
                />

                <TogglePermissionItem
                  icon={<UserX size={14} className="text-amber-400" />}
                  label="Expulsar Membros"
                  desc="Remover usuários da tribo."
                  value={permissions.canKickMembers}
                  onChange={(val) => setPermissions((p) => ({ ...p, canKickMembers: val }))}
                />

                <TogglePermissionItem
                  icon={<UserCheck size={14} className="text-teal-400" />}
                  label="Aprovar / Rejeitar"
                  desc="Gerenciar solicitações de entrada."
                  value={permissions.canManageJoinRequests}
                  onChange={(val) => setPermissions((p) => ({ ...p, canManageJoinRequests: val }))}
                />

                <TogglePermissionItem
                  icon={<Shield size={14} className="text-rose-400" />}
                  label="Banir Permanentemente"
                  desc="Oculta o grupo completamente para o banido."
                  value={permissions.canBanMembers}
                  onChange={(val) => setPermissions((p) => ({ ...p, canBanMembers: val }))}
                />

                <TogglePermissionItem
                  icon={<VolumeX size={14} className="text-purple-400" />}
                  label="Silenciar Membros (Mute)"
                  desc="Aplicar castigo temporário de fala no chat."
                  value={permissions.canMuteMembers}
                  onChange={(val) => setPermissions((p) => ({ ...p, canMuteMembers: val }))}
                />

                <TogglePermissionItem
                  icon={<Vote size={14} className="text-yellow-400" />}
                  label="Criar Enquetes (CRUD)"
                  desc="Criar e gerenciar votações na tribo."
                  value={permissions.canCreatePolls}
                  onChange={(val) => setPermissions((p) => ({ ...p, canCreatePolls: val }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              {editingRoleId && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#50c878] hover:bg-[#50c878]/90 text-[#1e293b] font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>{editingRoleId ? "Atualizar Cargo" : "Salvar Cargo"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function TogglePermissionItem({
  icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        value
          ? "bg-slate-800/80 border-[#a855f7]/60"
          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2.5 pr-2">
        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-tight">{label}</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{desc}</p>
        </div>
      </div>

      <div
        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5 ${
          value ? "bg-[#a855f7]" : "bg-slate-700"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
