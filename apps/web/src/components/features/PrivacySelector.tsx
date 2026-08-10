"use client";

import React, { useState, useEffect } from "react";
import { Star, Shield, Users, User, Globe } from "lucide-react";
import { getFriendsAction } from "@/app/actions/connection-actions";
import { getCommunitiesAction } from "@/app/actions/community-actions";

export interface PrivacyConfig {
  isAuthorAnonymous: boolean;
  authorVisibilityLevel: "PUBLIC" | "FRIENDS_ONLY" | "FRIENDS_OF_FRIENDS" | "SELECTED_FRIENDS" | "SPECIFIC_GROUPS";
  allowedGroupIds: string[];
  allowedUserIds: string[];
}

interface PrivacySelectorProps {
  onChange: (config: PrivacyConfig) => void;
  defaultOption?: string;
}

export function PrivacySelector({ onChange, defaultOption }: PrivacySelectorProps) {
  const [option, setOption] = useState<string>(() => {
    if (defaultOption) return defaultOption;
    if (typeof window !== "undefined") {
      return localStorage.getItem("aletis_default_privacy") || "ANONYMOUS";
    }
    return "ANONYMOUS";
  });
  const [friends, setFriends] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (option === "SELECTED_FRIENDS") {
      getFriendsAction().then(setFriends).catch(console.error);
    } else if (option === "SPECIFIC_GROUPS") {
      getCommunitiesAction().then(setCommunities).catch(console.error);
    }
  }, [option]);

  useEffect(() => {
    let isAuthorAnonymous = false;
    let authorVisibilityLevel: PrivacyConfig["authorVisibilityLevel"] = "PUBLIC";

    if (option === "ANONYMOUS") {
      isAuthorAnonymous = true;
    } else {
      authorVisibilityLevel = option as PrivacyConfig["authorVisibilityLevel"];
    }

    onChange({
      isAuthorAnonymous,
      authorVisibilityLevel,
      allowedGroupIds: option === "SPECIFIC_GROUPS" ? selectedGroupIds : [],
      allowedUserIds: option === "SELECTED_FRIENDS" ? selectedUserIds : [],
    });
  }, [option, selectedUserIds, selectedGroupIds]);

  const toggleFriend = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCommunity = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        borderRadius: "16px",
        padding: "16px",
        color: "#f8fafc",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: "bold",
          color: "#e2e8f0",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}
      >
        Quem pode ver que foi você? (Visibilidade da Autoria)
      </label>

      <select
        value={option}
        onChange={(e) => setOption(e.target.value)}
        style={{
          width: "100%",
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          color: "#e2e8f0",
          padding: "10px 14px",
          borderRadius: "12px",
          fontSize: "13px",
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="ANONYMOUS">👤 Totalmente Anônimo (Sem autoria visível)</option>
        <option value="PUBLIC">🌍 Público (Todos podem ver seu nome)</option>
        <option value="FRIENDS_ONLY">👥 Apenas Amigos</option>
        <option value="FRIENDS_OF_FRIENDS">🔄 Amigos de Amigos</option>
        <option value="SELECTED_FRIENDS">⭐ Amigos Selecionados...</option>
        <option value="SPECIFIC_GROUPS">🏰 Comunidades Específicas...</option>
      </select>

      {option === "SELECTED_FRIENDS" && (
        <div style={{ marginTop: "12px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>Selecione os amigos permitidos:</p>
          {friends.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>Carregando amigos ou nenhum amigo disponível.</p>
          ) : (
            friends.map((friend) => (
              <label
                key={friend.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  backgroundColor: selectedUserIds.includes(friend.id) ? "rgba(80, 200, 120, 0.1)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(friend.id)}
                  onChange={() => toggleFriend(friend.id)}
                  style={{ accentColor: "#50c878" }}
                />
                <img
                  src={friend.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name}`}
                  alt={friend.name}
                  style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                />
                <span>{friend.name}</span>
              </label>
            ))
          )}
        </div>
      )}

      {option === "SPECIFIC_GROUPS" && (
        <div style={{ marginTop: "12px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>Selecione as comunidades permitidas:</p>
          {communities.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>Carregando comunidades ou nenhuma comunidade disponível.</p>
          ) : (
            communities.map((comm) => (
              <label
                key={comm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  backgroundColor: selectedGroupIds.includes(comm.id) ? "rgba(80, 200, 120, 0.1)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(comm.id)}
                  onChange={() => toggleCommunity(comm.id)}
                  style={{ accentColor: "#50c878" }}
                />
                <span>{comm.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
