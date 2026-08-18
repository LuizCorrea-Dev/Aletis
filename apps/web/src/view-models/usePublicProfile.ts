"use client";

import { useState, useCallback, useEffect } from "react";
import { getCurrentUserProfileAction, getPublicProfileByUsernameAction } from "@/app/actions/user-actions";
import { getUserPostsAction } from "@/app/actions/post-actions";
import { getUserAtrioItemsAction } from "@/app/actions/atrio-actions";
import { getUserCommunitiesAction } from "@/app/actions/community-actions";
import {
  getFollowStateAction,
  getFollowersAction,
  getFriendsAction,
  getFriendshipStatusAction,
  requestFriendshipAction,
  toggleFollowAction,
} from "@/app/actions/connection-actions";

export interface PublicProfileUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  status: string;
  vibesCount: number;
  tipoPerfil?: "comum" | "ancora" | "verificado";
}

export interface AtrioItemData {
  id: string;
  title: string;
  url: string;
  description?: string;
  media_type?: string;
}

export interface GroupData {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  role: string;
}

export function usePublicProfile(username: string) {
  const [profile, setProfile] = useState<PublicProfileUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [atrioItems, setAtrioItems] = useState<AtrioItemData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted">("none");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"posts" | "atrio" | "groups">("posts");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const fetchPublicProfile = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);

    try {
      const authUser = await getCurrentUserProfileAction();
      if (authUser) {
        setCurrentUserId(authUser.id);
      }

      const dbProfile = await getPublicProfileByUsernameAction(username);
      if (dbProfile) {
        setProfile({
          id: dbProfile.id,
          username: dbProfile.username,
          name: dbProfile.name,
          avatarUrl: dbProfile.avatarUrl,
          bannerUrl: dbProfile.bannerUrl,
          bio: dbProfile.bio,
          status: dbProfile.status,
          vibesCount: dbProfile.vibesCount ?? dbProfile.vibes ?? 50,
          tipoPerfil: dbProfile.tipoPerfil || "comum",
        });

        const userPosts = await getUserPostsAction(dbProfile.id);
        setPosts(userPosts || []);

        const atrioData = await getUserAtrioItemsAction(dbProfile.id);
        setAtrioItems(
          atrioData.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            description: item.description,
          }))
        );

        const comms = await getUserCommunitiesAction(dbProfile.id);
        setGroups(
          comms.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            avatarUrl: c.avatarUrl,
            role: c.currentUserRole || "Membro",
          }))
        );
      } else {
        setProfile(null);
      }

      const followersList = await getFollowersAction();
      const friendsList = await getFriendsAction();
      const followState = await getFollowStateAction("current_user");
      const fStatusRaw = await getFriendshipStatusAction("current_user");

      setFollowersCount(followersList.length);
      setFriendsCount(friendsList.length);
      setIsFollowing(followState);

      const mappedFriendStatus =
        fStatusRaw === "pending_sent" || fStatusRaw === "pending_received"
          ? "pending"
          : fStatusRaw === "accepted"
            ? "accepted"
            : "none";
      setFriendStatus(mappedFriendStatus);

    } catch (err) {
      console.error("Erro ao carregar perfil público:", err);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const isOwnProfile = Boolean(currentUserId && profile && currentUserId === profile.id);

  const handleFollowToggle = async () => {
    if (!profile || isOwnProfile || isProcessing) return;
    setIsProcessing(true);

    const result = await toggleFollowAction(profile.id);
    if (result.success) {
      setIsFollowing(result.isFollowing);
      setFollowersCount((prev) => (result.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
    }
    setIsProcessing(false);
  };

  const handleAddFriend = async () => {
    if (!profile || isOwnProfile || friendStatus !== "none" || isProcessing) return;
    setIsProcessing(true);

    const res = await requestFriendshipAction(profile.id);
    if (res.success) {
      setFriendStatus("pending");
    }
    setIsProcessing(false);
  };

  return {
    profile,
    currentUserId,
    isOwnProfile,
    posts,
    atrioItems,
    groups,
    followersCount,
    friendsCount,
    isFollowing,
    friendStatus,
    isLoading,
    isProcessing,
    activeTab,
    selectedPost,
    setActiveTab,
    setSelectedPost,
    handleFollowToggle,
    handleAddFriend,
    reload: fetchPublicProfile,
  };
}
