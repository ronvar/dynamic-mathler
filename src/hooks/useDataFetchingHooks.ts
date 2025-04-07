import { usePuzzleGrabber } from "./usePuzzleGrabber";
import { useUserData } from "./useUserData";

export function useDataFetchingHooks() {
  usePuzzleGrabber(true);
  useUserData(true);

  return null;
}
