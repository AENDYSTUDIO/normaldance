import { BarChart2, Home, Music, TrendingUp, User } from "@/components/icons";

export const mainNavigation = [
  {
    name: "Главная",
    href: "/",
    icon: Home,
    exact: true,
  },
  {
    name: "Треки",
    href: "/tracks",
    icon: Music,
    exact: false,
  },
  {
    name: "DEX",
    href: "/dex",
    icon: TrendingUp,
    exact: false,
  },
  {
    name: "Аналитика",
    href: "/analytics",
    icon: BarChart2,
    exact: false,
  },
  {
    name: "Профиль",
    href: "/profile",
    icon: User,
    exact: false,
  },
];
