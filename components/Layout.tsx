import React from "react";
import {
  List,
  Wallet,
  Bot
} from "lucide-react";

type ViewState =
  | "dashboard"
  | "transacoes"
  | "metas"
  | "controle"
  | "chat"
  | "resumo";

interface MenuItem {
  id: ViewState;
  label: string;
  icon: React.ElementType;
}

interface LayoutProps {
  menuItems: MenuItem[];
  onViewChange: (v: ViewState) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (v: boolean) => void;
}

export default function Layout({
  menuItems,
  onViewChange,
  showMobileMenu,
  setShowMobileMenu,
}: LayoutProps) {

  // 👉 Função para renderizar cada item do menu
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => {
          onViewChange(item.id);
          setShowMobileMenu(false);
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
      >
        <Icon size={20} className="text-gray-700" />
        <span className="text-sm font-medium text-gray-800">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen">

      {/* MENU LATERAL */}
      <aside
        className={`
          bg-white border-r p-4 flex flex-col gap-2
          ${showMobileMenu ? "block" : "hidden md:block"}
        `}
      >
        {menuItems.map(renderMenuItem)}
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Conteúdo aqui */}
      </main>

    </div>
  );
}
