"use client";

import {
  dailyTargetValueAtom,
  isLoadingPuzzleAtom,
  puzzleAtom,
} from "@/state/atoms";
import { AttemptItem } from "@/types/mathler";
import { evaluateEquationArray, normalizeOperator } from "@/utils/mathler";
import { useAtom } from "jotai";
import { useEffect } from "react";

export function usePuzzleGrabber(fetchData?: boolean) {
  const [isLoading, setIsLoading] = useAtom(isLoadingPuzzleAtom);
  const [todaysPuzzle, setTodaysPuzzle] = useAtom(puzzleAtom);
  const [puzzleTargetValue, setPuzzleTargetValue] =
    useAtom(dailyTargetValueAtom);

  useEffect(() => {
    if (fetchData) fetchPuzzles();
  }, [fetchData]);

  // 

  const fetchPuzzles = async () => {
    if (isLoading)
      return; // prevent multiple fetches
  
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://gist.githubusercontent.com/fredericboivin/79520252fc89cf861485f88d6492c78d/raw/66a222d51a5b3f171144d00a7afcf286efcc0245/mathler.txt"
      );
      const data = await response.text();
      const lines = data.split("\n");
      // lines should be split by spaces
      const newPuzzles: string[][] = [];
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // skip empty lines

        const tokens = line.split(" ").map(normalizeOperator);
        if (tokens.length > 0) {
          newPuzzles.push(tokens);
        }
      }
      const currentPuzzle = getTodaysPuzzle(newPuzzles);
      const puzzleEval = evaluateEquationArray(currentPuzzle);
      setTodaysPuzzle(currentPuzzle);
      setPuzzleTargetValue(puzzleEval);
    } catch (error) {
      console.error("Error fetching puzzles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodaysPuzzle = (puzzles: string[][]) => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    return puzzles[dayOfYear % puzzles.length];
  };

  return {
    isLoading,
    todaysPuzzle,
    puzzleTargetValue,
  };
}
