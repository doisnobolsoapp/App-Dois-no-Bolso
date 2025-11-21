import { Transaction, TransactionType } from "../types";
import { updateTransactionNotification } from "./storageService";

const _ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
        // Filter for Expenses/Loans that are pending, not notified yet, and due tomorrow
        if (
            (t.type === TransactionType.EXPENSE || t.type === TransactionType.LOAN) &&
            !t.paid &&
            !t.notificationSent &&
            (t.dueDate === tomorrowStr || t.date === tomorrowStr)
        ) {
            sendNotification(t);
            updateTransactionNotification(t.id, true);
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
