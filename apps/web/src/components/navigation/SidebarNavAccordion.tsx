import React, { useEffect, useState } from "react";
import { Accordion, SidebarGroup, SidebarGroupContent } from "@gestao-compra/ui";
import SidebarNavGroup, { type SidebarNavGroupItem } from "./SidebarNavGroup";
import { readSidebarExpandedGroups, writeSidebarExpandedGroups } from "./sidebarPreference";

export interface SidebarNavSection {
  id: string;
  title: string;
  items: SidebarNavGroupItem[];
}

interface SidebarNavAccordionProps {
  sections: SidebarNavSection[];
  onNavigate?: () => void;
}

const SidebarNavAccordion: React.FC<SidebarNavAccordionProps> = ({ sections, onNavigate }) => {
  const sectionKey = sections.map((section) => section.id).join("|");
  const [expandedGroups, setExpandedGroups] = useState(() =>
    readSidebarExpandedGroups(sections.map((section) => section.id)),
  );

  useEffect(() => {
    const sectionIds = sectionKey ? sectionKey.split("|") : [];
    const allowed = new Set(sectionIds);
    setExpandedGroups((current) => {
      const next = current.filter((id) => allowed.has(id));
      const same =
        next.length === current.length && next.every((id, index) => id === current[index]);
      return same ? current : next;
    });
  }, [sectionKey]);

  const handleExpandedChange = (value: string[]) => {
    setExpandedGroups(value);
    writeSidebarExpandedGroups(value);
  };

  if (sections.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <p className="px-2 py-3 text-xs text-sidebar-foreground/70">
            Nenhuma rotina disponível para o seu usuário.
          </p>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Accordion
          type="multiple"
          value={expandedGroups}
          onValueChange={handleExpandedChange}
          className="w-full space-y-1"
        >
          {sections.map((section) => (
            <SidebarNavGroup
              key={section.id}
              id={section.id}
              title={section.title}
              items={section.items}
              onNavigate={onNavigate}
            />
          ))}
        </Accordion>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavAccordion;
