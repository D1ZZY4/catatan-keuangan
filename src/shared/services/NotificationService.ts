import { db } from "@/shared/db/db";
import { formatCurrency } from "@/shared/utils/format";
import type { Budget, Category, Reminder, Transaction } from "@/shared/types";

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }

  get isSupported(): boolean {
    return "Notification" in window;
  }

  get isGranted(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }

  private async wasAlreadySent(key: string): Promise<boolean> {
    const startOfPeriod = new Date();
    startOfPeriod.setDate(1);
    startOfPeriod.setHours(0, 0, 0, 0);
    const rows = await db.notifications_sent
      .where("key")
      .equals(key)
      .filter((r) => r.sentAt >= startOfPeriod.getTime())
      .count();
    return rows > 0;
  }

  private async markSent(key: string): Promise<void> {
    await db.notifications_sent.add({ key, sentAt: Date.now() } as Omit<
      import("@/shared/db/db").NotificationSentRow,
      "id"
    > & { id: number });
  }

  private send(title: string, body: string): void {
    if (!this.isGranted) return;
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
    } catch {
      // ignore
    }
  }

  async checkBudgets(
    budgets: Budget[],
    transactions: Transaction[],
    categories: Category[],
  ): Promise<void> {
    if (!this.isGranted) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    for (const budget of budgets) {
      const spent = transactions
        .filter(
          (tx) =>
            tx.categoryId === budget.categoryId &&
            tx.date >= startOfMonth &&
            ["expense", "transfer_external"].includes(tx.type),
        )
        .reduce((s, tx) => s + tx.amount, 0);

      const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      if (pct < budget.notifyAt) continue;

      const notifKey = `budget:${budget.id}:${now.getFullYear()}-${now.getMonth()}`;
      if (await this.wasAlreadySent(notifKey)) continue;

      const cat = categories.find((c) => c.id === budget.categoryId);
      const catName = cat?.name ?? "Anggaran";

      this.send(
        `Anggaran ${catName} hampir habis`,
        `${Math.round(pct)}% dari ${formatCurrency(budget.amount, budget.currency)} telah digunakan`,
      );
      await this.markSent(notifKey);
    }
  }

  async checkReminders(reminders: Reminder[]): Promise<void> {
    if (!this.isGranted) return;

    const now = Date.now();
    const today = new Date();

    for (const reminder of reminders) {
      if (!reminder.isActive) continue;

      let dueDate: Date;
      if (reminder.period === "monthly") {
        dueDate = new Date(today.getFullYear(), today.getMonth(), reminder.dueDay);
        if (dueDate.getTime() < now) {
          dueDate = new Date(today.getFullYear(), today.getMonth() + 1, reminder.dueDay);
        }
      } else {
        const dayOfWeek = today.getDay();
        const diff = (reminder.dueDay - dayOfWeek + 7) % 7;
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + diff);
      }

      const notifyTime = dueDate.getTime() - reminder.notifyDaysBefore * 86400000;
      if (now < notifyTime) continue;

      const periodKey = `${today.getFullYear()}-${today.getMonth()}-w${Math.floor(today.getDate() / 7)}`;
      const notifKey = `reminder:${reminder.id}:${periodKey}`;
      if (await this.wasAlreadySent(notifKey)) continue;

      const dueInDays = Math.round((dueDate.getTime() - now) / 86400000);
      const whenStr =
        dueInDays === 0
          ? "hari ini"
          : dueInDays === 1
            ? "besok"
            : `dalam ${dueInDays} hari`;
      const amountStr =
        reminder.amount !== undefined
          ? ` — ${formatCurrency(reminder.amount, reminder.currency)}`
          : "";

      this.send(reminder.name, `Jatuh tempo ${whenStr}${amountStr}`);
      await this.markSent(notifKey);
    }
  }
}

export const notificationService = new NotificationService();
