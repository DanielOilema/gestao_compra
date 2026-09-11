import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "@gestao-compra/ui";
import { appModuleGroups } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { buildUserMenu } from "@/lib/buildUserMenu";
import { isRoutineActive } from "./isRoutineActive";
import type { SidebarNavSection } from "./SidebarNavAccordion";

export function useAppMenu() {
  const { permissions, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const groups = useMemo(
    () => buildUserMenu(appModuleGroups, permissions, isAdmin),
    [permissions, isAdmin],
  );

  const sections: SidebarNavSection[] = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        title: group.title,
        items: group.routines.map((routine) => ({
          id: routine.id,
          title: routine.title,
          icon: routine.icon,
          to: routine.path,
          active: isRoutineActive(pathname, routine.path),
        })),
      })),
    [groups, pathname],
  );

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return { sections, closeMobile };
}
