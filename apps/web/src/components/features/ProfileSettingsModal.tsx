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
} from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile-actions";
import { logoutAction, deleteUserAccountAction } from "@/app/actions/user-actions";
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
    phone?: string;
    countryCode?: string;
    notifications?: boolean;
    isSuspended?: boolean;
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
  const [activeTab, setActiveTab] = useState<"edit" | "public" | "data" | "security" | "privacy">("edit");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form fields
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [status, setStatus] = useState(profile.status);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);

  // Security & Privacy fields
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [countryCode, setCountryCode] = useState(profile.countryCode || "+55");
  const [notifications, setNotifications] = useState(profile.notifications ?? true);
  const [isSuspended, setIsSuspended] = useState(profile.isSuspended ?? false);
  const [defaultPrivacy, setDefaultPrivacy] = useState<string>("ANONYMOUS");

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
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setCountryCode(profile.countryCode || "+55");
      setErrorMsg("");
      setSuccessMsg("");
      setCopiedLink(false);

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("aletis_default_privacy");
        if (stored) setDefaultPrivacy(stored);
      }
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const publicProfileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${username || profile.username}`
    : `https://aletis.life/u/${username || profile.username}`;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message);
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
        setUploadingBanner(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message);
      setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
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

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (confirm("Tem certeza de que deseja excluir permanentemente sua conta e todas as memórias vetoriais? Esta ação é IRREVERSÍVEL.")) {
      setSaving(true);
      const res = await deleteUserAccountAction();
      if (res.success) {
        window.location.href = "/";
      } else {
        setErrorMsg(res.message || "Erro ao excluir conta.");
        setSaving(false);
      }
    }
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
                <Lock size={18} /> Segurança
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
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold">
                {successMsg}
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
                    onClick={handleSave}
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
                <h2 className="text-2xl font-bold text-white mb-6 hidden md:block font-display">
                  Dados Pessoais
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Endereço de E-mail
                    </label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white">
                      <Mail size={18} className="text-[#50c878] shrink-0" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="bg-transparent w-full focus:outline-none text-slate-300 cursor-not-allowed text-sm font-semibold"
                      />
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
                      onClick={handleSave}
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

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <div className="max-w-2xl mx-auto pb-20 md:pb-0 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 hidden md:block font-display">
                  Segurança & Acesso
                </h2>

                <div className="space-y-6 mb-10">
                  <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6">
                    <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                      <AlertTriangle size={16} /> ZONA DE PERIGO
                    </h3>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-white font-bold text-sm">Suspender Conta</p>
                        <p className="text-slate-400 text-xs font-medium">Oculta seu perfil público temporariamente.</p>
                      </div>
                      <div
                        className="relative inline-block w-12 align-middle select-none cursor-pointer"
                        onClick={() => setIsSuspended(!isSuspended)}
                      >
                        <div className={`w-12 h-6 rounded-full transition-colors ${isSuspended ? "bg-red-500" : "bg-slate-700"}`} />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isSuspended ? "translate-x-7" : "translate-x-1"}`} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                      <span>Excluir Conta Permanentemente</span>
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
                    onClick={handleSave}
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
