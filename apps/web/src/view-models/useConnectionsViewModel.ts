"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUserProfileAction } from "@/app/actions/user-actions";
import {
  getConversationsAction,
  getFriendsAction,
  getFavoriteFriendsAction,
  getMessagesAction,
  sendMessageAction,
  markMessagesAsReadAction,
  requestFriendshipAction,
  acceptFriendshipAction,
  removeFriendshipAction,
  toggleFollowAction,
  toggleCloseFriendAction,
} from "@/app/actions/connection-actions";
import { Friend, PrivateMessage, MessageType } from "@aletis/domain";

export type ConnectionsTab = "friends" | "dms" | "favorites";

export interface ConnectionsViewModelOptions {
  initialTab?: ConnectionsTab;
  initialUser?: string | null;
}

export function useConnectionsViewModel(options: ConnectionsViewModelOptions = {}) {
  const [activeTab, setActiveTab] = useState<ConnectionsTab>(options.initialTab || "friends");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [conversations, setConversations] = useState<Friend[]>([]);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [favoritesList, setFavoritesList] = useState<Friend[]>([]);
  const [activeChat, setActiveChat] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 1. Obter Usuário Autenticado
  useEffect(() => {
    getCurrentUserProfileAction().then((user) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // 2. Carregar Conexões, Amigos e Favoritos
  const loadConnectionsData = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const [convs, friends, favorites] = await Promise.all([
        getConversationsAction(),
        getFriendsAction(),
        getFavoriteFriendsAction(),
      ]);
      setConversations(convs);
      setFriendsList(friends);
      setFavoritesList(favorites);

      if (options.initialUser && !activeChat) {
        const found =
          convs.find((c) => c.id === options.initialUser) ||
          friends.find((f) => f.id === options.initialUser) ||
          favorites.find((fav) => fav.id === options.initialUser);
        if (found) {
          setActiveChat(found);
        }
      }
    } catch (err) {
      console.error("[ConnectionsViewModel] Error loading connections data:", err);
    } finally {
      setIsLoadingList(false);
    }
  }, [options.initialUser, activeChat]);

  useEffect(() => {
    loadConnectionsData();
  }, []);

  // 3. Buscar Mensagens do Chat Ativo
  const fetchMessages = useCallback(async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const msgs = await getMessagesAction(chatId);
      setMessages(msgs);
    } catch (err) {
      console.error("[ConnectionsViewModel] Error loading messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      markMessagesAsReadAction(activeChat.id);
    }
  }, [activeChat, fetchMessages]);

  const friendIds = new Set(friendsList.map((f) => f.id));

  const friendsTabItems: Friend[] = friendsList.map((friend) => {
    const conv = conversations.find((c) => c.id === friend.id);
    return conv ? { ...friend, ...conv, friendshipStatus: "accepted" as const } : friend;
  });

  const dmsTabItems: Friend[] = conversations.filter(
    (conv) => !friendIds.has(conv.id) && conv.friendshipStatus !== "accepted"
  );

  const favoritesTabItems: Friend[] = friendsTabItems.filter((f) => f.isCloseFriend === true);

  const getDisplayedList = () => {
    let baseList: Friend[] = [];
    if (activeTab === "friends") baseList = friendsTabItems;
    else if (activeTab === "dms") baseList = dmsTabItems;
    else if (activeTab === "favorites") baseList = favoritesTabItems;

    return baseList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const totalUnreadDMs = dmsTabItems.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const toggleFollow = async () => {
    if (!activeChat) return;
    const res = await toggleFollowAction(activeChat.id);
    if (res.success) {
      setActiveChat((prev) => (prev ? { ...prev, isFollowing: res.isFollowing } : null));
      loadConnectionsData();
    }
  };

  const requestFriendship = async () => {
    if (!activeChat) return;
    setActionLoading("friend");
    const res = await requestFriendshipAction(activeChat.id);
    if (res.success) {
      setActiveChat((prev) => (prev ? { ...prev, friendshipStatus: "pending_sent" } : null));
      loadConnectionsData();
    }
    setActionLoading(null);
  };

  const acceptFriendship = async () => {
    if (!activeChat) return;
    setActionLoading("friend");
    const res = await acceptFriendshipAction(activeChat.id);
    if (res.success) {
      setActiveChat((prev) => (prev ? { ...prev, friendshipStatus: "accepted" } : null));
      setActiveTab("friends");
      loadConnectionsData();
    }
    setActionLoading(null);
  };

  const removeFriendship = async () => {
    if (!activeChat) return;
    setActionLoading("friend");
    const res = await removeFriendshipAction(activeChat.id);
    if (res.success) {
      setActiveChat((prev) => (prev ? { ...prev, friendshipStatus: "none" } : null));
      loadConnectionsData();
    }
    setActionLoading(null);
  };

  const toggleFavoriteFriend = async (friendId?: string) => {
    const targetId = friendId || activeChat?.id;
    if (!targetId) return;

    setActionLoading("favorite");
    const res = await toggleCloseFriendAction(targetId);
    if (res.success) {
      if (activeChat?.id === targetId) {
        setActiveChat((prev) => (prev ? { ...prev, isCloseFriend: !prev.isCloseFriend } : null));
      }
      await loadConnectionsData();
    }
    setActionLoading(null);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText;
    setInputText("");

    const newMsg: PrivateMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: activeChat.id,
      content: textToSend,
      type: "text",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    const res = await sendMessageAction(activeChat.id, textToSend, "text");
    if (res.success && res.data) {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? res.data : m)));
      loadConnectionsData();
    }
  };

  const [fileError, setFileError] = useState<string | null>(null);

  const uploadMedia = async (file: File) => {
    if (!file || !activeChat) return;
    setFileError(null);

    const fileSizeMB = file.size / (1024 * 1024);
    const mimeType = file.type.toLowerCase();
    const filename = file.name;
    const extension = filename.includes(".") ? `.${filename.split(".").pop()?.toLowerCase()}` : "";

    const MAX_IMAGE_SIZE_MB = 25;
    const MAX_VIDEO_SIZE_MB = 200;
    const MAX_PDF_SIZE_MB = 50;

    const isImage = mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".bmp", ".svg"].includes(extension);
    const isVideo = mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v"].includes(extension);
    const isPdf = mimeType === "application/pdf" || extension === ".pdf";

    if (isImage) {
      if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
        setFileError(`Esta foto (${fileSizeMB.toFixed(1)} MB) é muito grande para enviar. O tamanho máximo permitido para fotos é de ${MAX_IMAGE_SIZE_MB} MB. Por favor, escolha uma imagem menor.`);
        return;
      }
    } else if (isVideo) {
      if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
        setFileError(`Este vídeo (${fileSizeMB.toFixed(1)} MB) é muito grande para enviar. O tamanho máximo permitido para vídeos é de ${MAX_VIDEO_SIZE_MB} MB. Por favor, escolha um vídeo menor.`);
        return;
      }
    } else if (isPdf) {
      if (fileSizeMB > MAX_PDF_SIZE_MB) {
        setFileError(`Este documento PDF (${fileSizeMB.toFixed(1)} MB) é muito grande para enviar. O tamanho máximo permitido para arquivos é de ${MAX_PDF_SIZE_MB} MB. Por favor, escolha um arquivo menor.`);
        return;
      }
    } else {
      setFileError(`O formato do arquivo "${filename}" não é suportado. Você pode enviar Fotos (até ${MAX_IMAGE_SIZE_MB}MB), Vídeos (até ${MAX_VIDEO_SIZE_MB}MB) ou Documentos PDF (até ${MAX_PDF_SIZE_MB}MB).`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("friendId", activeChat.id);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        fetchMessages(activeChat.id);
        loadConnectionsData();
      } else {
        setFileError(data.message || "Não foi possível enviar o arquivo no momento. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error("[ConnectionsViewModel] Error uploading media:", err);
      setFileError("Ocorreu uma falha ao carregar o arquivo. Verifique sua conexão e tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    currentUserId,
    activeChat,
    setActiveChat,
    messages,
    inputText,
    setInputText,
    isLoadingList,
    isLoadingMessages,
    isUploading,
    fileError,
    setFileError,
    actionLoading,
    totalUnreadDMs,
    friendsCount: friendsTabItems.length,
    favoritesCount: favoritesTabItems.length,
    displayedList: getDisplayedList(),
    toggleFollow,
    requestFriendship,
    acceptFriendship,
    removeFriendship,
    toggleFavoriteFriend,
    sendMessage,
    uploadMedia,
    refreshConnections: loadConnectionsData,
  };
}
