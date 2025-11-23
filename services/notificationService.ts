import { Transaction } from "../types";

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações de desktop.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const checkAndSendNotifications = (transactions: Transaction[]) => {
    if (Notification.permission !== "granted") return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    transactions.forEach(t => {
        // Filter for Expenses that are pending, not notified yet, and due tomorrow
        // Usar type como string em vez de TransactionType.EXPENSE
        if (
            (t.type === 'expense' || t.type === 'loan') &&
            !t.paid &&
            !t.notificationSent &&
            (t.dueDate === tomorrowStr || t.date === tomorrowStr)
        ) {
            sendNotification(t);
            // Removida a chamada para updateTransactionNotification que não existe
            // Você precisará implementar essa função no storageService se necessário
        }
    });
};

const sendNotification = (t: Transaction) => {
    try {
        new Notification("🔔 Lembrete Financeiro - Dois no Bolso", {
            body: `A conta ${t.description} vence amanhã (R$ ${t.amount.toFixed(2)}). Não esqueça!`,
            icon: "/icon.png", // Assuming generic icon or PWA icon
            tag: `bill-${t.id}` // Prevent duplicate notifications for same bill
        });
    } catch (e) {
        console.error("Erro ao enviar notificação", e);
    }
};

// Função auxiliar para atualizar notificação (se necessário)
export const updateTransactionNotification = (transactionId: string, notificationSent: boolean) => {
    // Implementação básica - você precisará integrar com seu storageService
    console.log(`Atualizando notificação para transação ${transactionId}: ${notificationSent}`);
    
    // Exemplo de implementação:
    try {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const updatedTransactions = transactions.map((t: Transaction) => 
            t.id === transactionId ? { ...t, notificationSent } : t
        );
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    } catch (error) {
        console.error('Erro ao atualizar notificação da transação:', error);
    }
};
