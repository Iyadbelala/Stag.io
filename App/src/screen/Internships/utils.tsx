import {
  HiOutlineGlobeAlt,
  HiOutlineRefresh,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";

export function typeLabel(type: string) {
  switch (type) {
    case "remote": return "Remote";
    case "hybrid": return "Hybrid";
    default: return "On-site";
  }
}

export function typeIcon(type: string) {
  switch (type) {
    case "remote": return <HiOutlineGlobeAlt size={12} />;
    case "hybrid": return <HiOutlineRefresh size={12} />;
    default: return <HiOutlineOfficeBuilding size={12} />;
  }
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
