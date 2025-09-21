// src/hooks/use-feature-flag.ts
"use client";

import { useEffect, useState } from "react";
import { getRemoteConfig, getValue } from "firebase/remote-config";
import { FirebaseApp, getApp } from "firebase/app";

export function useFeatureFlag(key: string, fallback: boolean = false) {
  const [value, setValue] = useState<boolean>(fallback);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const app: FirebaseApp = getApp();
        const rc = getRemoteConfig(app);
        const v = getValue(rc, key);
        // preferiraj asBoolean ako postoji; fallback na asString
        const boolVal =
          typeof v.asBoolean === "function"
            ? v.asBoolean()
            : (v.asString?.() ?? "").toLowerCase() === "true";

        if (mounted) setValue(Boolean(boolVal));
      } catch {
        if (mounted) setValue(fallback);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [key, fallback]);

  return value;
}