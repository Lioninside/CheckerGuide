import {
  createProfile,
  parseStoredProfile,
  serializeProfile,
  type Profile,
  type ProfileLoadResult,
} from "../domain/profile";

const PROFILE_KEY = "checker-guide.profile.v1";

export interface ProfileRepository {
  load(): ProfileLoadResult;
  save(profile: Profile): void;
  clear(): void;
}

export class LocalProfileRepository implements ProfileRepository {
  constructor(private readonly storage: Storage | null = safeStorage()) {}

  load(): ProfileLoadResult {
    if (!this.storage) {
      return {
        profile: createProfile(),
        status: "created",
        error: "localStorage ist nicht verfügbar.",
      };
    }

    return parseStoredProfile(this.storage.getItem(PROFILE_KEY));
  }

  save(profile: Profile): void {
    if (!this.storage) {
      throw new Error("Export nicht möglich: localStorage ist nicht verfügbar.");
    }
    this.storage.setItem(PROFILE_KEY, serializeProfile(profile));
  }

  clear(): void {
    this.storage?.removeItem(PROFILE_KEY);
  }
}

export function safeStorage(): Storage | null {
  try {
    const testKey = "checker-guide.storage-test";
    globalThis.localStorage.setItem(testKey, "1");
    globalThis.localStorage.removeItem(testKey);
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
