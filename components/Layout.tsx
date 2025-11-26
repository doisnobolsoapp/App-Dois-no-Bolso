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
  | "transactions"
  | "calendar"
  | "banks"
  | "cards"
  | "chat"
  | "settings";

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
  currentView: ViewState;
  onViewChange: (v: ViewState) => void;
  onLogout: () => void;
}

export default function Layout({
  currentView,
  onViewChange,
  onLogout
}: LayoutProps) {
  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Visão Geral", icon: Home },
    { id: "transactions", label: "Transações", icon: CreditCard },
    { id: "calendar", label: "Calendário", icon: Calendar },

    {
      id: "banks",
      label: "Configurações de Contas",
      icon: List,
      children: [
        { id: "banks", label: "Bancos", icon: Landmark },
        { id: "banks", label: "Carteira", icon: Wallet },
        { id: "cards", label: "Cartões", icon: PieChart }
      ]
    },

    { id: "chat", label: "Assistente IA", icon: Bot },
    { id: "settings", label: "Configurações do App", icon: Settings }
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => onViewChange(item.id)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors
          ${currentView === item.id ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          <Icon size={20} />
          <span>{item.label}</span>
        </button>

        {item.children && (
          <div className="pl-10 flex flex-col gap-1 mt-1">
            {item.children.map(child => {
              const ChildIcon = child.icon;
              return (
                <button
                  key={child.label}
                  onClick={() => onViewChange(child.id)}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
                >
                  <ChildIcon size={16} />
                  <span>{child.label}</span>
                </button>
              );
            })}

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
      <aside className="bg-white border-r p-4 flex flex-col gap-2 w-64">
        {menuItems.map(renderMenuItem)}

        <button
          onClick={onLogout}
          className="mt-auto py-2 px-3 bg-red-50 text-red-600 rounded hover:bg-red-100"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
        {/* Conteúdo é renderizado pelo App.tsx */}
      </main>
    </div>
  );
}
