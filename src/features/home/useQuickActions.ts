import { liveQuery } from "dexie";
import { useCallback, useEffect, useState } from "react";
import { db } from "@/shared/db/db";
import { DEFAULT_QUICK_ACTIONS, type QuickActionConfig } from "./quickActionsConfig";

const SETTINGS_KEY = "quickActions";

export function useQuickActions() {
  const [actions, setActions] = useState<QuickActionConfig[]>(DEFAULT_QUICK_ACTIONS);

  useEffect(() => {
    const subscription = liveQuery(() => db.settings.get(SETTINGS_KEY)).subscribe({
      next: (row) => {
        if (row?.value && Array.isArray(row.value) && (row.value as unknown[]).length > 0) {
          setActions(row.value as QuickActionConfig[]);
        } else {
          setActions(DEFAULT_QUICK_ACTIONS);
        }
      },
      error: () => {
        setActions(DEFAULT_QUICK_ACTIONS);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  const saveActions = useCallback(async (next: QuickActionConfig[]) => {
    await db.settings.put({ key: SETTINGS_KEY, value: next });
  }, []);

  return { actions, saveActions };
}
