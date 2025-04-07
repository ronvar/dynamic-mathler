import { AttemptItem, MathlerGameRecord } from "@/types/mathler";
import { useCallback, useEffect, useState } from "react";
import { useUserData } from "./useUserData";
import { evaluateTileRow, wasStartedToday } from "@/utils/mathler";
import { useAtom } from "jotai";
import { activeGameAtom, activeRowAtom, puzzleAtom, userGamesHistoryAtom } from "@/state/atoms";
import { usePuzzleGrabber } from "./usePuzzleGrabber";
import { v4 as uuidV4 } from "uuid";

export function useMathler() {
  const { userMetadata, updateUserMetadata } = useUserData();
  const { todaysPuzzle, isLoading } = usePuzzleGrabber();
  const [activeGame, setActiveGame] = useAtom(activeGameAtom);
  const [activeRow, setActiveRow] = useAtom(activeRowAtom);

  useEffect(() => {
    if (userMetadata) {
      // check if old games exists in history, isnt complete, and is not older than 24h
      const lastGame = userMetadata?.history?.[userMetadata.history.length - 1];
      console.log('lastGame', lastGame);
      if (lastGame) {
        // if the last game was started today, set it as the active game
        if (wasStartedToday(lastGame)) {
          setActiveGame(lastGame);
          setActiveRow(lastGame.attemptsGrid.findIndex((row) => row.every((attempt) => attempt.value === "")));
        }
      }
    } else {
      console.log("No user metadata found", userMetadata);
    }
  }, [userMetadata, todaysPuzzle]);

  const resetGame = useCallback(() => {
    setActiveGame(null);
    setActiveRow(0);
  }, []);

  const createNewGame = useCallback(async () => {
    if (isLoading) {
      console.log("Puzzle is still loading");
      return;
    }

    const lastGame = userMetadata?.history?.[userMetadata.history.length - 1];
    if (activeGame && wasStartedToday(activeGame)) {
        console.log("Current game already started today");

        return;
      
    } else if (!activeGame && !!lastGame && wasStartedToday(lastGame)) {
      console.log("Last game already started at an earlier time today");
      if (lastGame.status === "playing") {
        // the last active row is the first row that has empty values
        const lastActiveRow = lastGame.attemptsGrid.findIndex((row) =>
          row.every((attempt) => attempt.value === "")
        );
        setActiveGame(lastGame);
        setActiveRow(lastActiveRow);
      }
      return;
    }

    // create an empty 2d array with 6 rows and x columns, where x is the length of the puzzle
    const emptyAttempts: AttemptItem[][] = Array.from({ length: 6 }, () =>
      Array.from({ length: todaysPuzzle.length }, () => ({
        value: "",
        color: null,
      }))
    );

    const newGame: MathlerGameRecord = {
      id: uuidV4(),
      status: "playing",
      startedAt: Date.now(),
      finishedAt: 0,
      attemptsGrid: emptyAttempts,
      puzzle: todaysPuzzle,
    };
    setActiveGame(newGame);
    setActiveRow(0);
    await updateUserMetadata(newGame);
  }, [
    activeGame,
    todaysPuzzle,
    setActiveGame,
    setActiveRow,
    updateUserMetadata,
    userMetadata,
  ]);

  const submitAttempt = useCallback(
    async (attempt: AttemptItem[]) => {
        if (!activeGame) return;

        const gradedAttempt = evaluateTileRow(todaysPuzzle, attempt)
        const activeGameCopy = { ...activeGame };
        activeGameCopy.attemptsGrid[activeRow] = gradedAttempt;

        // set active row to next if possible
        const nextRow = (activeRow + 1) % 6; 
        await updateUserMetadata(activeGameCopy);
        setActiveRow(nextRow);
    }, [
        activeGame,
        activeRow,
        todaysPuzzle,
        updateUserMetadata,
    ])

  return {
    activeGame,
    activeRow,
    createNewGame,
    resetGame,
    submitAttempt,
  };
}
