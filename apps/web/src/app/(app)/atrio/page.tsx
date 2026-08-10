"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bookmark, Share2 } from "lucide-react";
import { getAtrioItemsAction, AtrioItemData } from "@/app/actions/atrio-actions";
import { SaveToListModal } from "@/components/features/SaveToListModal";
import { VibeZapButton, CommentSection } from "@/components/molecules";

interface AtrioItem {
  id: string;
  title: string;
  description: string;
  url: string;
  color?: string;
  vibes?: number;
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
}

export default function AtrioPage() {
  const [items, setItems] = useState<AtrioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AtrioItem | null>(null);
  const [savingItemToList, setSavingItemToList] = useState<AtrioItem | null>(null);
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    const fetchAtrioItems = async () => {
      setIsLoading(true);
      try {
        const atrioData = await getAtrioItemsAction();

        const mappedAtrio: AtrioItem[] = (atrioData || []).map((row) => ({
          id: row.id,
          title: row.title || "Contemplação",
          description: row.description || "",
          url: row.url,
          color: row.color || "bg-[#50c878]",
          vibes: row.vibesCount || 0,
          tags: row.tags || [],
          authorName: row.authorName || "Artista Aletis",
        }));

        if (mappedAtrio.length > 0) {
          setItems(mappedAtrio);
        } else {
          setItems([
            {
              id: "1",
              title: "Serenidade Matinal",
              description: "A paz que habita no silêncio da manhã transforma o olhar sobre a vida.",
              url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
              color: "bg-[#50c878]",
              vibes: 42,
              tags: ["paz", "silêncio", "manhã"],
              authorName: "Aletis Art",
            },
            {
              id: "2",
              title: "Luz entre as Árvores",
              description: "Mesmo nas florestas mais densas, a luz sempre encontra um caminho.",
              url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
              color: "bg-[#2dd4bf]",
              vibes: 28,
              tags: ["natureza", "esperança", "floresta"],
              authorName: "Alma Livre",
            },
            {
              id: "3",
              title: "Horizontes Infinitos",
              description: "Encontre espaço para respirar e contemplar a vastidão do universo.",
              url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
              color: "bg-[#3b82f6]",
              vibes: 56,
              tags: ["universo", "horizonte", "meditação"],
              authorName: "Horizonte",
            },
          ]);
        }
      } catch (err) {
        console.error("Erro ao carregar o Átrio:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtrioItems();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!tagFilter.trim()) return true;
    const search = tagFilter.trim().toLowerCase().replace(/^#/, "");
    const inTitle = item.title.toLowerCase().includes(search);
    const inDesc = item.description.toLowerCase().includes(search);
    const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(search));
    return inTitle || inDesc || inTags;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Fixo */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf]">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
              Átrio da <span className="text-[#2dd4bf]">Leveza</span>
            </h1>
            <p className="text-xs text-slate-400">
              Galeria imersiva de artes e reflexões contemplativas.
            </p>
          </div>
        </div>

        {/* Barra de Filtro por Tags */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-inner">
          <span className="text-xs text-[#2dd4bf] font-bold font-mono">#</span>
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filtrar por tag ou tema (ex: #paz, #natureza)..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          {tagFilter && (
            <button
              onClick={() => setTagFilter("")}
              className="text-xs text-slate-400 hover:text-white font-bold px-2 py-0.5 rounded-lg bg-slate-800"
            >
              Limpar
            </button>
          )}
        </div>
      </header>

      {/* Grid de Galeria Otimizada */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-slate-800/40 border border-slate-700/60 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative h-80 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer shadow-xl transition-all hover:border-[#2dd4bf]/50 hover:shadow-[0_0_24px_rgba(45,212,191,0.2)]"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent opacity-95 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40">
                    Contemplação
                  </span>
                  {(item.tags || []).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTagFilter(tag);
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-[#2dd4bf] hover:text-[#2dd4bf] transition-colors"
                    >
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-[#2dd4bf] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-90 text-justify">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-400">{item.authorName}</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <VibeZapButton
                      atrioId={item.id}
                      initialVibes={item.vibes || 0}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <p className="text-xs text-slate-400 font-medium mb-3">Nenhuma obra encontrada para a tag "{tagFilter}".</p>
          <button
            onClick={() => setTagFilter("")}
            className="px-4 py-2 bg-[#2dd4bf] text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer"
          >
            Ver Todas as Obras
          </button>
        </div>
      )}

      {/* Modal de Detalhe Imersivo */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#1e293b] w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 w-full overflow-hidden bg-black">
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-white">{selectedItem.title}</h2>
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedItem.tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2dd4bf]/15 text-[#2dd4bf] border border-[#2dd4bf]/30">
                        #{t.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-300 leading-relaxed text-justify space-y-3 font-medium">
                {selectedItem.description.split(/\n+/).map((para, idx) => (
                  <p key={idx} className="text-justify leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                <span className="text-xs font-bold text-slate-400">
                  Por: {selectedItem.authorName}
                </span>

                <div className="flex items-center gap-3">
                  <VibeZapButton
                    atrioId={selectedItem.id}
                    initialVibes={selectedItem.vibes || 0}
                    size="md"
                  />
                  <button
                    type="button"
                    onClick={() => setSavingItemToList(selectedItem)}
                    className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-[#2dd4bf] hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Salvar no Santuário"
                  >
                    <Bookmark size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-[#50c878] transition-colors cursor-pointer"
                    title="Compartilhar"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Bloco Único de Comentários do Átrio */}
              <div className="pt-2">
                <CommentSection atrioId={selectedItem.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Salvar em Listas do Santuário */}
      {savingItemToList && (
        <SaveToListModal
          itemId={savingItemToList.id}
          onClose={() => setSavingItemToList(null)}
        />
      )}
    </div>
  );
}
