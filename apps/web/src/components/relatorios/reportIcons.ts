import {
  BarChart3,
  CalendarClock,
  FileBarChart,
  Landmark,
  PieChart,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * O catálogo de relatórios pode sugerir um ícone por nome. A resolução é por allowlist, e não por
 * import dinâmico, para não arrastar o pacote inteiro de ícones para o bundle.
 */
const REPORT_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  CalendarClock,
  FileBarChart,
  Landmark,
  PieChart,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Wallet,
};

export const DEFAULT_REPORT_ICON: LucideIcon = FileBarChart;

export const resolveReportIcon = (icone?: string): LucideIcon =>
  (icone && REPORT_ICONS[icone]) || DEFAULT_REPORT_ICON;
