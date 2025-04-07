"use client";

import { GameGrid } from "@/components/gameGrid/gameGrid";
import { useMathler } from "@/hooks/useMathler";
import { usePuzzleGrabber } from "@/hooks/usePuzzleGrabber";
import { Button, Center, Stack, Text } from "@mantine/core";
import React from "react";

const PlayGame: React.FC = () => {
  const { todaysPuzzle, puzzleTargetValue } = usePuzzleGrabber(true);
  const { activeGame, activeRow, createNewGame, submitAttempt } = useMathler();

  let title = "Try to solve the puzzle!";
  if (activeGame?.status === "won") {
    title = "Hell yea, you did it. Congrats!";
  } else if (activeGame?.status === "lost") {
    title = "Game Over! Better luck next time!";
  }

  return (
    <Center h={"100%"}>
      <Stack>
        <Center>
          <Stack align="center" spacing={2}>
            <Text size={30} weight={700}>
              {title}
            </Text>
            <Text size={26} weight={500}>
              Your equation should equal: <b>{puzzleTargetValue}</b>
            </Text>
            <Text size={14}>
              Use <b>Space</b> or <b>Tab</b> to jump to the next tile <br />
              Use <b>Enter</b> to submit your answer <br />
              Use <b>Backspace</b> to delete a tile
            </Text>
        {!activeGame && <Button variant="outline" color="green" size="lg" onClick={createNewGame} w={"min-content"} my={6}>Start</Button>}
          </Stack>
        </Center>
        <GameGrid
          puzzle={todaysPuzzle}
          activeGame={activeGame}
          activeRowIndex={activeRow}
          onAttemptComplete={submitAttempt}
        />
      </Stack>
    </Center>
  );
};

export default PlayGame;
