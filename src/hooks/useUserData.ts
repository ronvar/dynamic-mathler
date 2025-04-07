import {
  userAtom,
  userDataIsLoadingAtom,
  userMetadataAtom,
} from "@/state/atoms";
import { MathlerGameRecord } from "@/types/mathler";
import { UserMetadata } from "@/types/user";
import { compressMetadata, decompressMetadata } from "@/utils/compression";
import {
  useDynamicContext,
  useIsLoggedIn,
  useRefreshUser,
  useUserUpdateRequest,
} from "@dynamic-labs/sdk-react-core";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export function useUserData(fetchData = false) {
  const {
    primaryWallet,
    setShowAuthFlow,
    handleLogOut,
  } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();
  const refresh = useRefreshUser();
  // const { setGameScoreToShare } = useXMTPMessenger();
  const isLoggedIn = useIsLoggedIn();
  const [isLoading, setIsLoading] = useAtom(userDataIsLoadingAtom);
  const [userMetadata, setUserMetadata] = useAtom(userMetadataAtom);
  const [user, setUser] = useAtom(userAtom);

  const fetchUserAndMetadata = useCallback(async () => {
    if (isLoading || !isLoggedIn) return;
    setIsLoading(true);
    try {
      const data = await refresh();
      const metadata = data?.metadata as { mathler: string };
      
      if (metadata?.mathler) {
        const decompressedMetadata = decompressMetadata(metadata.mathler) as UserMetadata;
        setUserMetadata(decompressedMetadata);
      } else {
        setUserMetadata(undefined);
      }
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    isLoggedIn,
    fetchData,
    refresh,
    setIsLoading,
    setUser,
    setUserMetadata,
  ]);

  useEffect(() => {
    if (fetchData)
      if (isLoggedIn && !user && fetchData) {
        fetchUserAndMetadata();
      }
  }, [isLoggedIn, user]);

  useEffect(() => {
  }, [userMetadata]);

  const updateUserMetadata = useCallback(
    async (game: MathlerGameRecord) => {
      if (!user) return;
      const gameCopy = {
        ...game,
        finishedAt: Date.now(),
      };

      const history = userMetadata?.history || [];
      const totalTimePlayed = userMetadata?.totalTimePlayed || 0;
      const totalGamesPlayed = userMetadata?.totalGames || 0;
      const totalGamesWon = userMetadata?.totalWins || 0;

      const updatedMetadata: UserMetadata = {
        ...userMetadata,
        history,
        totalTimePlayed,
        totalGames: totalGamesPlayed,
        totalWins: totalGamesWon,
      };

      const gameInHistory = history?.find((g) => g.id === gameCopy.id);
      if (gameInHistory) {
        const updatedHistory = history.map((g) =>
          g.id === gameCopy.id ? gameCopy : g
        );
        Object.assign(updatedMetadata, {
          history: updatedHistory,
          totalTimePlayed:
            totalTimePlayed + (gameCopy.finishedAt - gameCopy.startedAt),
        });
      } else {
        Object.assign(updatedMetadata, {
          history: [...history, gameCopy],
        });
      }

      // update game copy finished at
      gameCopy.finishedAt = Date.now();

      // if all attempts have colors, but the game is not won, it means the game was lost
      const allAttemptsHaveColors = gameCopy.attemptsGrid.every((row) =>
        row.every((attempt) => attempt.color !== null)
      );
      const atLeastOneRowIsAllGreen = gameCopy.attemptsGrid.some((row) =>
        row.every((attempt) => attempt.color === "green")
      );
      if (allAttemptsHaveColors && !atLeastOneRowIsAllGreen) {
        Object.assign(gameCopy, {
          status: "lost",
        });
      } else if (atLeastOneRowIsAllGreen) {
        Object.assign(gameCopy, {
          status: "won",
        });
      }

      Object.assign(updatedMetadata, {
        totalTimePlayed:
          totalTimePlayed + (gameCopy.finishedAt - gameCopy.startedAt),
        totalGames: updatedMetadata.history.length,
        totalWins: atLeastOneRowIsAllGreen ? totalGamesWon + 1 : totalGamesWon,
      });

      // Only keep the last 5 games in history
      if (updatedMetadata.history.length > 5) {
        updatedMetadata.history = updatedMetadata.history.slice(-5);
      }
      setIsLoading(true);
      try {
        await updateUser({
          metadata: {
            mathler: compressMetadata(updatedMetadata),
          },
        });
        setIsLoading(false);
        await fetchUserAndMetadata();
      } catch (error) {
        console.error("Error updating user metadata:", error);
        setIsLoading(false);
      }
    },
    [user, userMetadata, refresh, updateUser, fetchUserAndMetadata]
  );

  // FOR DEBUGGING ONLY
  const resetHistory = useCallback(async () => {
    if (!user || isLoading) return;
    const updatedMetadata = {
      ...userMetadata,
      history: [],
      totalTimePlayed: 0,
      totalGames: 0,
      totalWins: 0,
    };
    setIsLoading(true);
    try {
      await updateUser({
        metadata: updatedMetadata,
      });
    } catch (error) {
      console.error("Error updating user metadata:", error);
    } finally {
      setIsLoading(false);
      await fetchUserAndMetadata();
    }
  }, [user, userMetadata, refresh, updateUser]);

  const shareScore = useCallback(async (game: MathlerGameRecord) => {
    console.log("Sharing score:", game);
    // setGameScoreToShare(game);
  }, []);

  const logOut = useCallback(async () => {
    await handleLogOut();
    setUser(undefined);
    setUserMetadata(undefined);
    setIsLoading(false);
  }, [handleLogOut]);

  return {
    user,
    primaryWallet,
    userMetadata,
    userDataIsLoading: isLoading,
    setShowAuthFlow,
    updateUserMetadata,
    shareScore,
    resetHistory,
    logOut,
  };
}
