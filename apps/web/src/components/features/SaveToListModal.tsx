"use client";

import { useState, useEffect } from "react";
import { X, Bookmark, Plus, Loader2, Check, Sparkles } from "lucide-react";
import {
  getUserAtrioListsAction,
  getItemSavedListIdsAction,
  saveItemToAtrioListsAction,
  createAtrioListAction,
  AtrioListData,
} from "@/app/actions/atrio-actions";

interface SaveToListModalProps {
  itemId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SaveToListModal({ itemId, onClose, onSuccess }: SaveToListModalProps) {
  const [lists, setLists] = useState<AtrioListData[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadListsAndState = async () => {
      setIsLoading(true);
      try {
        const userLists = await getUserAtrioListsAction();
        const savedIds = await getItemSavedListIdsAction(itemId);
        setLists(userLists);
        setSelectedListIds(savedIds);
      } catch (err) {
        console.error("SaveToListModal load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadListsAndState();
  }, [itemId]);

  const handleToggleList = (listId: string) => {
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setIsCreatingList(true);
    setError(null);
    try {
      const res = await createAtrioListAction(newListName.trim(), "", itemId);
      if (res.success && res.list) {
        setLists((prev) => [
          {
            id: res.list.id,
            userId: "",
            name: res.list.name,
            itemsCount: 1,
          },
          ...prev,
        ]);
        setSelectedListIds((prev) => [...prev, res.list.id]);
        setNewListName("");
        setIsCreatingNew(false);
      } else {
        setError(res.message || "Erro ao criar lista.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar lista.");
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await saveItemToAtrioListsAction(itemId, selectedListIds);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || "Erro ao salvar nas listas.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar nas listas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/30">
              <Bookmark size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-white font-display">Salvar no Santuário</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 flex justify-center text-[#2dd4bf]">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <>
              {lists.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Selecione as listas do seu Santuário:
                  </p>
                  {lists.map((l) => {
                    const isChecked = selectedListIds.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleToggleList(l.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                          isChecked
                            ? "bg-[#2dd4bf]/10 border-[#2dd4bf]/50 text-white"
                            : "bg-slate-900/40 border-slate-700/80 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#2dd4bf] border-[#2dd4bf] text-slate-950"
                                : "border-slate-600 bg-slate-900"
                            }`}
                          >
                            {isChecked && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{l.name}</p>
                            <p className="text-[10px] text-slate-400">{l.itemsCount} itens</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Você ainda não criou nenhuma lista de favoritos.</p>
                  <p className="text-[10px] text-slate-500">Crie sua primeira lista abaixo para guardar esta obra.</p>
                </div>
              )}

              {/* Form de Criar Nova Lista Inline */}
              {isCreatingNew ? (
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-2 animate-in fade-in">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Nova Lista de Favoritos</p>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Ex: Inspirações, Paz Interior..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateList}
                      disabled={isCreatingList || !newListName.trim()}
                      className="px-3 py-1.5 bg-[#2dd4bf] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50"
                    >
                      {isCreatingList ? <Loader2 size={13} className="animate-spin" /> : "Criar Lista"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-[#2dd4bf] font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Criar Nova Lista</span>
                </button>
              )}

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || isLoading}
            className="px-5 py-2 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Confirmar e Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
