import { useState, useCallback, useEffect } from "react";
import { getCurrentUserProfileAction } from "@/app/actions/user-actions";
import { getPostsAction, getUserPostsAction } from "@/app/actions/post-actions";
import {
  getUserAtrioItemsAction,
  getUserAtrioListsAction,
  AtrioItemData,
  AtrioListData,
} from "@/app/actions/atrio-actions";
import { Friend } from "@aletis/domain";
import { getUserCommunitiesAction } from "@/app/actions/community-actions";
import {
  getFollowersAction,
  getFollowingAction,
  getFriendsAction,
  getPendingRequestsAction,
  acceptFriendshipAction,
} from "@/app/actions/connection-actions";

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  username: string;
  status: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  vibesCount: number;
  tipoPerfil?: "comum" | "ancora" | "verificado";
  phone?: string;
  countryCode?: string;
}

export interface UserCommunityItem {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  bannerUrl?: string;
  privacy?: string;
  role: "OWNER" | "MODERATOR" | "MEMBER";
  isSuspended: boolean;
}

export function useProfile() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [atrioItems, setAtrioItems] = useState<AtrioItemData[]>([]);
  const [atrioLists, setAtrioLists] = useState<AtrioListData[]>([]);
  const [userCommunities, setUserCommunities] = useState<UserCommunityItem[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "atrio" | "groups" | "followers" | "following" | "connections" | "vibes" | "reels" | "saved">("posts");
  const [activeSubTab, setActiveSubTab] = useState<"all" | "media" | "anonymous">("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const authUser = await getCurrentUserProfileAction();
      if (!authUser) return;

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.name,
        username: authUser.username,
        status: authUser.status || "Em busca de equilíbrio em paz",
        bio: authUser.bio || "Compartilhando vibes de harmonia.",
        avatarUrl: authUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`,
        bannerUrl: authUser.bannerUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
        vibesCount: authUser.vibes || 0,
        tipoPerfil: authUser.tipoPerfil || "comum",
        phone: authUser.phone || "",
        countryCode: authUser.countryCode || "+55",
      });

      const userPosts = await getUserPostsAction(authUser.id);
      setPosts(userPosts || []);

      const atrioData = await getUserAtrioItemsAction(authUser.id);
      setAtrioItems(atrioData);

      const listsData = await getUserAtrioListsAction();
      setAtrioLists(listsData);

      const comms = await getUserCommunitiesAction(authUser.id);
      setUserCommunities(
        comms.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          avatarUrl: c.avatarUrl,
          bannerUrl: c.bannerUrl,
          privacy: c.privacy,
          role: "MEMBER",
          isSuspended: false,
        }))
      );

      const [fwers, fwing, frnds, pnding] = await Promise.all([
        getFollowersAction(authUser.id),
        getFollowingAction(authUser.id),
        getFriendsAction(authUser.id),
        getPendingRequestsAction(authUser.id),
      ]);

      setFollowers(fwers);
      setFollowing(fwing);
      setFriends(frnds);
      setPendingRequests(pnding);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const filteredPosts = posts.filter((p) => {
    if (activeSubTab === "media") return Boolean(p.media_url || p.mediaUrl);
    if (activeSubTab === "anonymous") return Boolean(p.is_author_anonymous || p.isAuthorAnonymous);
    return true;
  });

  const handleAcceptFriendship = async (requesterId: string) => {
    try {
      const res = await acceptFriendshipAction(requesterId);
      if (res.success) {
        await fetchProfileData();
      }
    } catch (err) {
      console.error("Erro ao aceitar amizade:", err);
    }
  };

  return {
    user,
    posts: filteredPosts,
    atrioItems,
    atrioLists,
    userCommunities,
    followers,
    following,
    friends,
    pendingRequests,
    allPostsCount: posts.length,
    isLoading,
    activeTab,
    activeSubTab,
    isSettingsOpen,
    isCreateOpen,
    editingPost,
    selectedPost,
    setActiveTab,
    setActiveSubTab,
    setIsSettingsOpen,
    setIsCreateOpen,
    setEditingPost,
    setSelectedPost,
    handleAcceptFriendship,
    reload: fetchProfileData,
  };
}
