import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  acknowledgeLocalNotice,
  markEpisodeSeen,
  mergeProfiles,
  recordEpisodeOpened,
  replaceProfile,
  resetProfile,
  serializeProfile,
  toggleBookmark,
  unmarkEpisodeSeen,
  validateProfileImport,
  type Profile,
  type ProfileImportPreview,
  type ProfileLoadStatus,
} from "../domain/profile";
import { LocalProfileRepository } from "../infrastructure/profileRepository";

interface ProfileContextValue {
  profile: Profile;
  status: ProfileLoadStatus;
  error: string | null;
  updateProfile: (recipe: (profile: Profile) => Profile) => void;
  markSeen: (episodeId: string) => void;
  unmarkSeen: (episodeId: string) => void;
  toggleSaved: (episodeId: string) => void;
  recordOpened: (episodeId: string) => void;
  acknowledgeNotice: () => void;
  reset: () => void;
  exportJson: () => string;
  previewImport: (value: unknown, knownEpisodeIds: string[]) => ProfileImportPreview;
  mergeImport: (value: unknown) => void;
  replaceImport: (value: unknown) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const repositoryRef = useRef(new LocalProfileRepository());
  const initialLoad = useMemo(() => repositoryRef.current.load(), []);
  const [profile, setProfile] = useState(initialLoad.profile);
  const [status] = useState<ProfileLoadStatus>(initialLoad.status);
  const [error, setError] = useState<string | null>(initialLoad.error ?? null);

  const persist = useCallback((nextProfile: Profile) => {
    try {
      repositoryRef.current.save(nextProfile);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Profil konnte nicht gespeichert werden.",
      );
    }
  }, []);

  const updateProfile = useCallback(
    (recipe: (current: Profile) => Profile) => {
      setProfile((current) => {
        const next = recipe(current);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      status,
      error,
      updateProfile,
      markSeen: (episodeId) => updateProfile((current) => markEpisodeSeen(current, episodeId)),
      unmarkSeen: (episodeId) => updateProfile((current) => unmarkEpisodeSeen(current, episodeId)),
      toggleSaved: (episodeId) => updateProfile((current) => toggleBookmark(current, episodeId)),
      recordOpened: (episodeId) =>
        updateProfile((current) => recordEpisodeOpened(current, episodeId)),
      acknowledgeNotice: () => updateProfile((current) => acknowledgeLocalNotice(current)),
      reset: () => updateProfile(() => resetProfile()),
      exportJson: () => serializeProfile(profile),
      previewImport: (valueToImport, knownEpisodeIds) =>
        validateProfileImport(valueToImport, knownEpisodeIds),
      mergeImport: (valueToImport) =>
        updateProfile((current) => mergeProfiles(current, valueToImport)),
      replaceImport: (valueToImport) => updateProfile(() => replaceProfile(valueToImport)),
    }),
    [error, profile, status, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfile muss innerhalb von ProfileProvider verwendet werden.");
  }
  return value;
}
