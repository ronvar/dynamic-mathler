"use client";

import { GameGrid } from "@/components/gameGrid/gameGrid";
import { useMathler } from "@/hooks/useMathler";
import { usePuzzleGrabber } from "@/hooks/usePuzzleGrabber";
import { Button, Center, Stack, Text } from "@mantine/core";
import React from "react";

const PlayGame: React.FC = () => {
  const { todaysPuzzle, puzzleTargetValue } = usePuzzleGrabber(true);
  const { activeGame, activeRow, createNewGame, submitAttempt } = useMathler();

  console.log('todaysPuzzle', todaysPuzzle);
  console.log('activeGame', activeGame);

  let title = "Try to solve the puzzle!";
  if (activeGame?.status === "won") {
    title = "Hell yea, you did it. Congrats!";
  } else if (activeGame?.status === "lost") {
    title = "Game Over! Better luck next time!";
  }

  return (
    <Stack>
      <Button onClick={createNewGame}>Create New Game</Button>
      <Center>
        <Stack align="center" spacing={2}>
          <Text size={30} weight={700}>
            {title}
          </Text>
          <Text size={26} weight={500}>
            Your equation should equal: <b>{puzzleTargetValue}</b>
          </Text>
        </Stack>
      </Center>
      <GameGrid
        puzzle={todaysPuzzle}
        activeGame={activeGame}
        activeRowIndex={activeRow}
        onAttemptComplete={submitAttempt}
      />
    </Stack>
  );
};

export default PlayGame;
