"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Globe,
  Lock,
  Shield,
  X,
  Save,
  Camera,
  LogOut,
  Upload,
  Loader2,
  Mail,
  AlertTriangle,
  Power,
  Bell,
  Copy,
  Share2,
  Menu,
  FileText,
  Key,
  Smartphone,
  ShieldCheck,
  Info,
  CheckCircle2,
  Download,
  ShieldAlert,
} from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile-actions";
import {
  logoutAction,
  deleteUserAccountAction,
  changePasswordAction,
  changeAccessEmailAction,
  toggleTwoFactorAction,
  exportUserDataAction,
} from "@/app/actions/user-actions";
import { PhoneInputWithCountry } from "@/components/atoms/PhoneInputWithCountry";
import { PrivacySelector } from "@/components/features/PrivacySelector";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    username: string;
    bio: string;
    status: string;
    avatarUrl: string;
    bannerUrl: string;
    vibes: number;
    email?: string;
    contactEmail?: string;
    phone?: string;
    countryCode?: string;
    notifications?: boolean;
    isSuspended?: boolean;
    isTwoFactorEnabled?: boolean;
  };
  onUpdate: (updatedData: {
    name: string;
    username: string;
    bio: string;
    status: string;
    avatarUrl: string;
    bannerUrl: string;
  }) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onUpdate,
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "public" | "data" | "security" | "account" | "privacy">("edit");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form fields (Edit profile)
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [status, setStatus] = useState(profile.status);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);

  // Personal data
  const [contactEmail, setContactEmail] = useState(profile.contactEmail || profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [countryCode, setCountryCode] = useState(profile.countryCode || "+55");

  // Security fields
  const [accessEmail, setAccessEmail] = useState(profile.email || "");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(profile.isTwoFactorEnabled ?? false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // Account & Privacy fields
  const [notifications, setNotifications] = useState(profile.notifications ?? true);
  const [isSuspended, setIsSuspended] = useState(profile.isSuspended ?? false);
  const [defaultPrivacy, setDefaultPrivacy] = useState<string>("ANONYMOUS");

  // Data Export & Deletion state
  const [zipPassword, setZipPassword] = useState("");
  const [exportingData, setExportingData] = useState(false);
  const [hasDownloadedData, setHasDownloadedData] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setUsername((profile.username || "").trim().replace(/\s+/g, "_"));
      setBio(profile.bio);
      setStatus(profile.status);
      setAvatarUrl(profile.avatarUrl);
      setBannerUrl(profile.bannerUrl);

      setContactEmail(profile.contactEmail || profile.email || "");
      setAccessEmail(profile.email || "");
      setEmailConfirmPassword("");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setZipPassword("");
      setExportingData(false);
      setHasDownloadedData(false);

      setPhone(profile.phone || "");
      setCountryCode(profile.countryCode || "+55");
      setIsSuspended(profile.isSuspended ?? false);
      setIsTwoFactorEnabled(profile.isTwoFactorEnabled ?? false);

      setErrorMsg("");
      setSuccessMsg("");
      setCopiedLink(false);

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("aletis_default_privacy");
        if (stored) setDefaultPrivacy(stored);
      }
    }
  }, [isOpen, profile]);

  const handleExportData = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!zipPassword || zipPassword.length < 4) {
      setErrorMsg("Por favor, defina uma senha de proteção para o arquivo ZIP (mínimo 4 caracteres).");
      return;
    }

    setExportingData(true);
    try {
      const res = await exportUserDataAction(zipPassword);
      if (res.success && res.dataBase64) {
        const byteCharacters = atob(res.dataBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/zip" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = res.fileName || `aletis_dados_${username}_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setHasDownloadedData(true);
        setSuccessMsg("Dados exportados e baixados com sucesso! Agora você pode confirmar a exclusão permanente da sua conta.");
      } else {
        setErrorMsg(res.message || "Erro ao exportar dados.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao exportar arquivo ZIP.");
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!hasDownloadedData) {
      setErrorMsg("Conforme a Política de Direitos dos Próprios Dados, você precisa primeiro baixar a cópia de seus dados em formato .ZIP antes de confirmar a exclusão permanente.");
      return;
    }

    if (confirm("Tem certeza de que deseja excluir permanentemente sua conta e todas as memórias vetoriais? Esta ação é IRREVERSÍVEL.")) {
      setSaving(true);
      const res = await deleteUserAccountAction();
      if (res.success) {
        window.location.href = "/?sentinelaFarewell=true";
      } else {
        setErrorMsg(res.message || "Erro ao excluir conta.");
        setSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  const publicProfileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${username || profile.username}`
    : `https://aletis.life/u/${username || profile.username}`;

  const compressImageFile = (file: File, maxWidth: number, maxHeight: number, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Erro ao carregar imagem para compressão."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo de imagem."));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const compressed = await compressImageFile(file, 600, 600, 0.85);
      setAvatarUrl(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao carregar avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const compressed = await compressImageFile(file, 1400, 600, 0.85);
      setBannerUrl(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao carregar capa.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aletis_default_privacy", defaultPrivacy);
      }

      const sanitizedUsername = username.trim().replace(/\s+/g, "_");

      const result = await updateProfileAction({
        name,
        username: sanitizedUsername,
        bio,
        status,
        avatarUrl,
        bannerUrl,
        phone,
        countryCode,
        isAnonymousDefault: defaultPrivacy === "ANONYMOUS",
        isSuspended,
      });

      if (!result.success && result.message) {
        setErrorMsg(result.message);
        return;
      }

      onUpdate({
        name,
        username: sanitizedUsername,
        bio,
        status,
        avatarUrl,
        bannerUrl,
      });

      setSuccessMsg("Todas as alterações foram salvas!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao gravar dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAccessEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!accessEmail.trim()) {
      setErrorMsg("Informe o novo e-mail de acesso.");
      return;
    }
    if (!emailConfirmPassword) {
      setErrorMsg("Digite sua senha atual para confirmar a alteração do e-mail de acesso.");
      return;
    }

    setChangingEmail(true);
    try {
      const res = await changeAccessEmailAction(accessEmail, emailConfirmPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        setEmailConfirmPassword("");
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao alterar e-mail de acesso.");
    } finally {
      setChangingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword) {
      setErrorMsg("Informe sua senha atual.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("A nova senha e a confirmação não coincidem.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao alterar senha.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setToggling2FA(true);
    const targetStatus = !isTwoFactorEnabled;

    try {
      const res = await toggleTwoFactorAction(targetStatus);
      if (res.success) {
        setIsTwoFactorEnabled(res.isTwoFactorEnabled ?? targetStatus);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao atualizar 2FA.");
    } finally {
      setToggling2FA(false);
    }
  };

  const handleSaveAccountStatus = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const result = await updateProfileAction({
        name,
        username,
        bio,
        status,
        avatarUrl,
        bannerUrl,
        phone,
        countryCode,
        isAnonymousDefault: defaultPrivacy === "ANONYMOUS",
        isSuspended,
      });

      if (result.success) {
        setSuccessMsg(isSuspended ? "Conta suspensa temporariamente." : "Status da conta atualizado para ativa.");
      } else {
        setErrorMsg(result.message || "Erro ao atualizar status da conta.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar status da conta.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/";
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full h-full md:max-w-5xl md:h-[85vh] md:rounded-3xl border-0 md:border border-slate-700 shadow-2xl flex relative overflow-hidden">

        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-background border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-lg">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white p-2">
            <Menu size={24} />
          </button>
          <span className="font-bold text-white text-lg">Configurações</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        {/* Left Sidebar Navigation */}
        <div className={`
          absolute inset-y-0 left-0 w-72 bg-background border-r border-slate-800 z-30 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-col md:justify-between md:shrink-0 md:shadow-none
          pt-16 md:pt-0
        `}>
          <div>
            <div className="hidden md:block p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                <Settings className="text-[#50c878]" size={22} /> Configurações
              </h2>
            </div>

            <nav className="p-4 space-y-2">
              <button
                onClick={() => { setActiveTab("edit"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "edit" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <User size={18} /> Editar Perfil
              </button>

              <button
                onClick={() => { setActiveTab("public"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "public" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Globe size={18} /> Perfil Público
              </button>

              <button
                onClick={() => { setActiveTab("data"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "data" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <FileText size={18} /> Dados Pessoais
              </button>

              <button
                onClick={() => { setActiveTab("security"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "security" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Lock size={18} /> Segurança & Acesso
              </button>

              <button
                onClick={() => { setActiveTab("account"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "account" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Power size={18} /> Conta
              </button>

              <button
                onClick={() => { setActiveTab("privacy"); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${activeTab === "privacy" ? "bg-[#50c878]/10 text-[#50c878]" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Shield size={18} /> Privacidade
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Right Main Content */}
        <div className="flex-1 flex flex-col bg-[#1e293b] relative w-full h-full pt-16 md:pt-0 overflow-hidden">
          <div className="hidden md:block absolute top-6 right-6 z-10">
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {errorMsg && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB: EDIT PROFILE */}
            {activeTab === "edit" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 hidden md:block font-display">
                  Informações Públicas
                </h2>

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 group-hover:border-[#50c878] transition-colors bg-slate-800"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <Loader2 className="text-white animate-spin" size={24} />
                      ) : (
                        <Camera className="text-white" size={24} />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-3">Toque para alterar foto</p>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Banner Section */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    Capa do Perfil
                  </label>
                  <div
                    className="h-32 w-full rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden cursor-pointer group"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <img
                      src={bannerUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80"}
                      alt="Capa"
                      className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingBanner ? (
                        <Loader2 className="text-white animate-spin" size={22} />
                      ) : (
                        <span className="text-white text-sm font-bold flex items-center gap-2">
                          <Upload size={16} /> Alterar Capa
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerUpload}
                  />
                </div>

                {/* Form fields */}
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Nome de Exibição (Full Name)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] transition-colors text-sm font-medium"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Nome de Usuário (@username)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                        className="w-full bg-slate-900 border rounded-xl p-3 text-white focus:outline-none transition-colors text-sm font-medium border-slate-700 focus:border-[#50c878]"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Status
                    </label>
                    <input
                      type="text"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] transition-colors text-sm font-medium"
                      placeholder="Ex: Em busca de equilíbrio em paz"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Bio / Descrição
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] transition-colors resize-none text-sm font-medium"
                      placeholder="Compartilhando vibes de harmonia."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3.5 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PUBLIC PROFILE */}
            {activeTab === "public" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0">
                <h2 className="text-2xl font-bold text-white mb-8 hidden md:block font-display">
                  Perfil Público
                </h2>

                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-center mb-8 shadow-xl">
                  <Globe size={48} className="text-[#50c878] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-display">
                    Compartilhe sua Jornada
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Este é o link direto para o seu perfil público no Aletis.
                  </p>

                  <div className="bg-black/30 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 mb-4">
                    <span className="text-slate-300 font-mono text-sm truncate">
                      {publicProfileUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Copiar Link"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  {copiedLink && (
                    <p className="text-xs text-[#50c878] font-bold mb-2">Link copiado para a área de transferência!</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: "Perfil no Aletis", url: publicProfileUrl });
                      } else {
                        handleCopyLink();
                      }
                    }}
                    className="text-[#50c878] font-bold text-sm flex items-center justify-center gap-2 hover:underline cursor-pointer mx-auto"
                  >
                    <Share2 size={16} /> Compartilhar em outras redes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PERSONAL DATA */}
            {activeTab === "data" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-2 hidden md:block font-display">
                  Dados Pessoais
                </h2>
                <p className="text-slate-400 text-xs mb-6 hidden md:block">
                  Informações de contato e dados pessoais do seu cadastro.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      E-mail para Contato
                    </label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white">
                      <Mail size={18} className="text-[#50c878] shrink-0" />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-200 text-sm font-semibold"
                        placeholder="seu-email-de-contato@exemplo.com"
                      />
                    </div>
                    <div className="mt-2.5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-slate-300 text-xs flex items-start gap-2.5 leading-relaxed">
                      <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Este e-mail é utilizado unicamente para comunicações, avisos e contato. Para alterar seu e-mail de <strong>login/acesso</strong> à sua conta, acesse a aba <strong>Segurança & Acesso</strong>.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Telefone Principal
                    </label>
                    <PhoneInputWithCountry
                      value={phone}
                      countryDialCode={countryCode}
                      onChange={(formatted, dial) => {
                        setPhone(formatted);
                        setCountryCode(dial);
                      }}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full md:w-auto px-8 py-3.5 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      <span>Salvar Dados Pessoais</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY & ACCESS */}
            {activeTab === "security" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 hidden md:block font-display">
                    Segurança & Acesso
                  </h2>
                  <p className="text-slate-400 text-xs hidden md:block">
                    Gerencie suas credenciais de login, senhas e camadas extras de proteção.
                  </p>
                </div>

                {/* Section 1: Access Email */}
                <form onSubmit={handleChangeAccessEmail} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="p-2.5 bg-[#50c878]/10 text-[#50c878] rounded-xl">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">E-mail de Acesso (Login)</h3>
                      <p className="text-slate-400 text-xs">Pré-preenchido com o e-mail cadastrado ao criar sua conta.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Novo E-mail de Acesso
                      </label>
                      <input
                        type="email"
                        value={accessEmail}
                        onChange={(e) => setAccessEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-semibold"
                        placeholder="seu-email-acesso@exemplo.com"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Confirmar com Senha Atual
                      </label>
                      <input
                        type="password"
                        value={emailConfirmPassword}
                        onChange={(e) => setEmailConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-medium"
                        placeholder="Digite sua senha atual"
                      />
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs flex items-start gap-2 leading-relaxed">
                      <Info size={16} className="text-[#50c878] shrink-0 mt-0.5" />
                      <span>
                        Este é o seu e-mail oficial para login na plataforma. O e-mail de contato pode ser gerenciado separadamente em <strong>Dados Pessoais</strong>.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={changingEmail}
                      className="px-6 py-2.5 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {changingEmail ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      <span>Atualizar E-mail de Acesso</span>
                    </button>
                  </div>
                </form>

                {/* Section 2: Change Password */}
                <form onSubmit={handleChangePassword} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="p-2.5 bg-[#50c878]/10 text-[#50c878] rounded-xl">
                      <Key size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Alterar Senha</h3>
                      <p className="text-slate-400 text-xs">Mantenha sua conta protegida com uma senha forte.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-medium"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-medium"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-medium"
                          placeholder="Repita a nova senha"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-6 py-2.5 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      <span>Atualizar Senha</span>
                    </button>
                  </div>
                </form>

                {/* Section 3: Two-Factor Authentication (2FA) */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#50c878]/10 text-[#50c878] rounded-xl">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">Segurança de 2 Fatores (2FA)</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isTwoFactorEnabled ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                            {isTwoFactorEnabled ? "Ativado" : "Desativado"}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">Proteção adicional contra acessos não autorizados.</p>
                      </div>
                    </div>

                    <div
                      className="relative inline-block w-12 align-middle select-none cursor-pointer"
                      onClick={handleToggle2FA}
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${isTwoFactorEnabled ? "bg-[#50c878]" : "bg-slate-700"}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isTwoFactorEnabled ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">
                      A Autenticação de Dois Fatores (2FA) adiciona uma camada de verificação extra à sua conta. Ao fazer login em novos dispositivos, um código de segurança temporário será solicitado.
                    </p>

                    {isTwoFactorEnabled && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <ShieldCheck size={16} />
                          <span>2FA Ativo e Protegendo sua Conta</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Sua conta está protegida. Guarde suas chaves de recuperação em um local seguro.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACCOUNT MANAGEMENT */}
            {activeTab === "account" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 hidden md:block font-display">
                    Gerenciamento da Conta
                  </h2>
                  <p className="text-slate-400 text-xs hidden md:block">
                    Direito dos dados, exportação em arquivo ZIP, suspensão temporária e exclusão permanente.
                  </p>
                </div>

                {/* Section 1: Data Rights & Export */}
                <form onSubmit={handleExportData} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="p-2.5 bg-[#50c878]/10 text-[#50c878] rounded-xl">
                      <Download size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Política de Direitos dos Próprios Dados</h3>
                      <p className="text-slate-400 text-xs">Exporte e baixe uma cópia completa de todas as suas publicações, mensagens e memórias.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">
                      Em conformidade com a nossa política de privacidade e transparência, você tem o direito inalienável de baixar 100% do seu conteúdo cadastrado no Aletis (posts, conversas salvas, obras do Átrio e memórias do Sentinela) compactado em um arquivo <strong>.ZIP</strong> protegido por senha.
                    </p>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Senha de Proteção para o Arquivo ZIP
                      </label>
                      <input
                        type="password"
                        value={zipPassword}
                        onChange={(e) => setZipPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#50c878] text-sm font-medium"
                        placeholder="Crie uma senha para abrir seu arquivo ZIP"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
                      <button
                        type="submit"
                        disabled={exportingData}
                        className="px-6 py-3 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                      >
                        {exportingData ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>Baixar Cópia dos Meus Dados (.ZIP)</span>
                      </button>

                      {hasDownloadedData && (
                        <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          <span>Dados exportados e baixados com sucesso!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </form>

                {/* Section 2: Suspend Account */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <Power size={18} className="text-amber-400" /> Suspender Conta Temporariamente
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                        Oculta seu perfil público e suas atividades temporariamente. Você pode reativar a qualquer momento salvando novamente.
                      </p>
                    </div>
                    <div
                      className="relative inline-block w-12 align-middle select-none cursor-pointer shrink-0"
                      onClick={() => setIsSuspended(!isSuspended)}
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${isSuspended ? "bg-amber-500" : "bg-slate-700"}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isSuspended ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAccountStatus}
                      disabled={saving}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      <span>Salvar Status da Conta</span>
                    </button>
                  </div>
                </div>

                {/* Section 3: Danger Zone - Delete Account */}
                <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={18} /> ZONA DE PERIGO
                  </h3>

                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    Excluir sua conta desativará seu perfil, removerá todas as suas publicações e destruirá permanentemente todas as suas memórias vetoriais do Sentinela. Esta ação é <strong>IRREVERSÍVEL</strong>.
                  </p>

                  {!hasDownloadedData ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 leading-relaxed">
                      <Info size={16} className="shrink-0 text-amber-400" />
                      <span>
                        Por garantia dos seus direitos, solicite e faça o download da cópia dos seus dados no bloco acima para liberar a confirmação de exclusão permanente.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                      <span>Confirmação liberada: Seus dados já foram baixados. Ao prosseguir, sua conta será removida.</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={saving || !hasDownloadedData}
                      className={`px-6 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${hasDownloadedData
                          ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                        }`}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                      <span>Confirmar Exclusão Permanente dos Dados</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {activeTab === "privacy" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 hidden md:block font-display">
                  Preferências de Privacidade
                </h2>

                <div className="space-y-4">
                  <PrivacySelector
                    defaultOption={defaultPrivacy}
                    onChange={(cfg) => {
                      const option = cfg.isAuthorAnonymous ? "ANONYMOUS" : cfg.authorVisibilityLevel;
                      setDefaultPrivacy(option);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#50c878]/10 rounded-full text-[#50c878]">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Notificações Push</p>
                      </div>
                    </div>
                    <div
                      className="relative inline-block w-12 align-middle select-none cursor-pointer"
                      onClick={() => setNotifications(!notifications)}
                    >
                      <div className={`w-12 h-6 rounded-full transition-colors ${notifications ? "bg-[#50c878]" : "bg-slate-600"}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${notifications ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3.5 bg-[#50c878] hover:bg-[#3eb566] text-[#0f172a] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Salvar Preferências de Privacidade</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
