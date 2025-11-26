import React from "react";
import {
  List,
  Wallet,
  Bot,
  Home,
  CreditCard,
  Calendar,
  Settings,
  Landmark,
  PieChart
} from "lucide-react";

type ViewState =
  | "dashboard"
  | "transacoes"
  | "calendario"
  | "configuracoesConta"
  | "chat"
  | "config";

interface MenuItem {
  id: ViewState;
  label: string;
  icon: React.ElementType;
  children?: {
    id: ViewState;
    label: string;
    icon: React.ElementType;
  }[];
}

interface LayoutProps {
  onViewChange: (v: ViewState) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (v: boolean) => void;
}

export default function Layout({
  onViewChange,
  showMobileMenu,
  setShowMobileMenu
}: LayoutProps) {

  // NOVO MENU, COMO VOCÊ PEDIU
  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Visão Geral", icon: Home },
    { id: "transacoes", label: "Transações", icon: CreditCard },
    { id: "calendario", label: "Calendário", icon: Calendar },

    {
      id: "configuracoesConta",
      label: "Configurações de Contas",
      icon: List,
      children: [
        { id: "configuracoesConta", label: "Bancos", icon: Landmark },
        { id: "configuracoesConta", label: "Carteira", icon: Wallet },
        { id: "configuracoesConta", label: "Cartões", icon: PieChart }
      ]
    },

    { id: "chat", label: "Assistente IA", icon: Bot },
    { id: "config", label: "Configurações do App", icon: Settings }
  ];

  // RENDERIZA CADA ITEM
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            onViewChange(item.id);
            setShowMobileMenu(false);
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
        >
          <Icon size={20} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-900">
            {item.label}
          </span>
        </button>

        {/* SUBMENU — Bancos / Carteira / Cartões */}
        {item.children && (
          <div className="pl-10 flex flex-col gap-1 mt-1">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <button
                  key={child.label}
                  onClick={() => {
                    onViewChange(child.id);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <ChildIcon size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {child.label}
                  </span>
                </button>
              );
            })}

            {/* BOTÃO DE ADICIONAR CONTA */}
            <button
              onClick={() => alert("Adicionar nova conta")}
              className="flex items-center gap-2 px-2 py-1 mt-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <List size={16} />
              <span className="text-sm font-medium">Adicionar conta</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* MENU LATERAL */}
      <aside
        className={`
          bg-white border-r p-4 flex flex-col gap-2 w-64
          ${showMobileMenu ? "block" : "hidden md:block"}
        `}
      >
        {menuItems.map(renderMenuItem)}
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Aqui entra o conteúdo da página atual */}
      </main>
    </div>
  );
}
