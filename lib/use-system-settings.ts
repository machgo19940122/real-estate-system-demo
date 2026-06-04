"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_SETTINGS_UPDATED_EVENT,
  type SystemSettings,
  getEffectiveInvoicePeriod,
  getTaxRateForDate,
  loadSystemSettings,
  saveSystemSettings,
} from "@/lib/system-settings";

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  useEffect(() => {
    setSettings(loadSystemSettings());
    const onUpdate = () => setSettings(loadSystemSettings());
    window.addEventListener(SYSTEM_SETTINGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SYSTEM_SETTINGS_UPDATED_EVENT, onUpdate);
  }, []);

  const save = useCallback((next: SystemSettings) => {
    const saved = saveSystemSettings(next);
    setSettings(saved);
    return saved;
  }, []);

  const taxRateForDate = useCallback(
    (dateYmd: string) => getTaxRateForDate(dateYmd, settings),
    [settings]
  );

  const effectivePeriod = useMemo(
    () => getEffectiveInvoicePeriod(undefined, settings),
    [settings]
  );

  return { settings, save, taxRateForDate, effectivePeriod };
}
