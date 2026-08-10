"use client";

import React, { useState, useEffect } from "react";
import { Vote, Plus, Trash2, CheckCircle2, Clock, Loader2, Sparkles, X } from "lucide-react";
import { getPollsAction, createPollAction, votePollAction } from "@/app/actions/community-actions";

interface CommunityPollWidgetProps {
  communityId: string;
  channelId?: string;
  canCreatePolls?: boolean;
}

export default function CommunityPollWidget({
  communityId,
  channelId,
  canCreatePolls = true,
}: CommunityPollWidgetProps) {
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create Form State
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["Sim", "Não"]);
  const [durationHours, setDurationHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  const loadPolls = async () => {
    setIsLoading(true);
    try {
      const res = await getPollsAction(communityId, channelId);
      if (res.success && res.data) {
        setPolls(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [communityId, channelId]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) {
      alert("A enquete precisa de uma pergunta e pelo menos 2 opções.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPollAction(communityId, question.trim(), validOptions, channelId, durationHours);
      if (res.success && res.data) {
        setPolls((prev) => [res.data, ...prev]);
        setIsCreateOpen(false);
        setQuestion("");
        setOptions(["Sim", "Não"]);
      } else {
        alert(res.message || "Erro ao criar enquete.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    setVotingPollId(pollId);
    try {
      const res = await votePollAction(communityId, pollId, optionIndex);
      if (res.success) {
        await loadPolls();
      } else {
        alert(res.message || "Erro ao computar voto.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setVotingPollId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Vote size={18} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white font-display">Enquetes de Votação</h4>
            <p className="text-[11px] text-slate-400">Participe das decisões e consultas da comunidade.</p>
          </div>
        </div>

        {canCreatePolls && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus size={16} /> Nova Enquete
          </button>
        )}
      </div>

      {/* Modal de Criação */}
      {isCreateOpen && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h5 className="text-xs font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Criar Enquete
            </h5>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Pergunta da Enquete *</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Qual tema devemos debater no próximo encontro?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Opções de Resposta (mín 2, máx 6)</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Opção ${i + 1}`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus size={14} /> Adicionar Opção
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                >
                  <option value={1}>1 hora</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={72}>3 dias</option>
                  <option value={168}>7 dias</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Publicar Enquete"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Enquetes */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-amber-400" size={20} />
        </div>
      ) : polls.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-900/30 rounded-2xl border border-slate-800">
          Nenhuma enquete aberta no momento.
        </p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const total = poll.totalVotes || 0;
            const hasVoted = poll.userVotedOption !== null;

            return (
              <div
                key={poll.id}
                className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <h5 className="text-sm font-extrabold text-white font-display leading-snug">
                    {poll.question}
                  </h5>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                    {total} {total === 1 ? "voto" : "votos"}
                  </span>
                </div>

                <div className="space-y-2">
                  {poll.options.map((opt: string, idx: number) => {
                    const count = poll.votesCount[idx] || 0;
                    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isSelected = poll.userVotedOption === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={votingPollId === poll.id}
                        onClick={() => handleVote(poll.id, idx)}
                        className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                            : "border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {/* Percent Bar Fill */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-amber-500/20 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative flex items-center justify-between text-xs z-10">
                          <span className="flex items-center gap-2 font-medium">
                            {isSelected && <CheckCircle2 size={14} className="text-amber-400 shrink-0" />}
                            {opt}
                          </span>

                          <span className="text-[11px] font-bold text-slate-400">
                            {percent}% ({count})
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
