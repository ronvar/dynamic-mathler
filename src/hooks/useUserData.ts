import { userDataIsLoadingAtom, userMetadataAtom } from "@/state/atoms";
import { MathlerGameRecord } from "@/types/mathler";
import { UserMetadata } from "@/types/user";
import {
  useDynamicContext,
  useIsLoggedIn,
  useRefreshUser,
  useUserUpdateRequest,
} from "@dynamic-labs/sdk-react-core";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

export function useUserData(fetchData = false) {
  const {
    user: dynamicUser,
    primaryWallet,
    setShowAuthFlow,
    handleLogOut,
  } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();
  const refresh = useRefreshUser();
  const isLoggedIn = useIsLoggedIn();
  const [isLoading, setIsLoading] = useAtom(userDataIsLoadingAtom);
  const [userMetadata, setUserMetadata] = useAtom(userMetadataAtom);
  const [user, setUser] = useState(dynamicUser);

  const fetchUserAndMetadata = useCallback(async () => {
    if (isLoading || !isLoggedIn || !fetchData) return;
    setIsLoading(true);
    try {
      const data = await refresh();
      setUser(data);
      setUserMetadata(data?.metadata as UserMetadata);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isLoggedIn, fetchData, refresh, setIsLoading, setUser, setUserMetadata]);

  useEffect(() => {
    if (fetchData)
    if (isLoggedIn && !user && fetchData) {
      fetchUserAndMetadata();
    }
  }, [isLoggedIn, user]);

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

      let updatedMetadata: UserMetadata = {
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
          totalTimePlayed:
            totalTimePlayed + (gameCopy.finishedAt - gameCopy.startedAt),
          totalGamesPlayed: totalGamesPlayed + 1,
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

      if (gameCopy.status !== "playing") {
        Object.assign(updatedMetadata, {
          totalWins: game.status === "won" ? totalGamesWon + 1 : totalGamesWon,
        });
      }
      setIsLoading(true);
      try {
        await updateUser({
          metadata: updatedMetadata,
        });
        setIsLoading(false);
        fetchUserAndMetadata();
      } catch (error) {
        console.error("Error updating user metadata:", error);
        setIsLoading(false);
      }
    },
    [user, userMetadata]
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
      fetchUserAndMetadata();
    }
  }, [user, userMetadata, refresh, updateUser]);

  const shareScore = useCallback(async (game: MathlerGameRecord) => {
    console.log(" initiate xmtp modal");
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
