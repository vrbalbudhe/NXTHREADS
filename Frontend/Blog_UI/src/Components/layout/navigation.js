import {
  Bell,
  Bookmark,
  Compass,
  Home,
  Info,
  LayoutGrid,
  MessageSquare,
  PenSquare,
  Settings,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

export const mainNav = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/topics", label: "Topics", icon: LayoutGrid },
  { to: "/people", label: "People", icon: Users, auth: true },
  { to: "/messages", label: "Messages", icon: MessageSquare, auth: true, badge: "messages" },
  { to: "/notifications", label: "Notifications", icon: Bell, auth: true, badge: "notifications" },
  { to: "/saved", label: "Saved", icon: Bookmark, auth: true },
];

export const accountNav = (userId) => [
  { to: "/write", label: "Write a post", icon: PenSquare, auth: true },
  {
    to: userId ? `/profile/${userId}` : "/login",
    label: "My profile",
    icon: UserRound,
    auth: true,
  },
  { to: "/settings", label: "Settings", icon: Settings, auth: true },
];

export const infoNav = [
  { to: "/about", label: "About", icon: Info },
  { to: "/privacy", label: "Privacy", icon: Shield },
];
