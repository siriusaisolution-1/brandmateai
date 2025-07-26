'use client';

import { useRemoteConfigAll } from 'reactfire';

/**
 * A custom hook to check the value of a feature flag from Firebase Remote Config.
 * It provides a streamlined way to conditionally render features.
 *
 * @param key The key of the feature flag to check.
 * @returns `true` if the flag is enabled, `false` otherwise. Returns `false` during initial load or if the key doesn't exist.
 */
export function useFeatureFlag(key: string): boolean {
  // useRemoteConfigAll() returns an object with all remote config values.
  // It's reactive, so the component will re-render when values change.
  const allConfig = useRemoteConfigAll();
  
  const flagValue = allConfig[key];

  // Default to false if the flag isn't loaded or doesn't exist
  if (!flagValue) {
    return false;
  }

  return flagValue.asBoolean();
}
