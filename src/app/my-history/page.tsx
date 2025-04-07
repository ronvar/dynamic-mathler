"use client";

import { GameGrid } from "@/components/gameGrid/gameGrid";
import { useMathler } from "@/hooks/useMathler";
import { usePuzzleGrabber } from "@/hooks/usePuzzleGrabber";
import { useUserData } from "@/hooks/useUserData";
import { evaluateEquationArray } from "@/utils/mathler";
import { Button, Center, Group, ScrollArea, Stack, Text } from "@mantine/core";
import React from "react";
import styles from "./page.module.scss";

const MyHistory: React.FC = () => {
  const { todaysPuzzle, puzzleTargetValue } = usePuzzleGrabber(false);
  const { userMetadata } = useUserData();
  const { activeGame, activeRow, createNewGame, submitAttempt } = useMathler();

  const history = [...(userMetadata?.history || [])];
  
  let title = "My Game History";
  if (!history.length) {
    title = "Play a game to start recording your history!";
  }

  // total time played should be xx Hrs xx Mins
  const totalTimePlayed = userMetadata?.totalTimePlayed || 0;
  const totalTimePlayedHours = Math.floor(totalTimePlayed / 3600);
  const totalTimePlayedMinutes = Math.floor((totalTimePlayed % 3600) / 60);
  const totalTimePlayedString = `${totalTimePlayedHours} Hrs ${totalTimePlayedMinutes} Mins`;

  return (
    <Stack>
      <Center>
        <Stack align="center" spacing={2}>
          <Text size={30} weight={700}>
            {title}
          </Text>
          <Group>
            <Text size={16} weight={500}>
              Total Games Played: <b>{history.length}</b>
            </Text>
            <Text size={16} weight={500}>
              Games Won: <b>{history.filter((game) => game.status === "won").length}</b>
            </Text>
            <Text size={16} weight={500}>
              Games Lost: <b>{history.filter((game) => game.status === "lost").length}</b>
            </Text>
          </Group>
          <Group>
            <Text size={16} weight={500}>
              Total Time Played: <b>{totalTimePlayedString}</b>
            </Text>
          </Group>
        </Stack>
      </Center>
      <ScrollArea
        style={{ height: "calc(90vh - 200px)" }}
        type="always"
        offsetScrollbars={false}
        >
          <Stack align="center">
            {history.map((game, index) => (
              <Stack className={styles.gameHistoryContainer} key={index} spacing={4} mb={10}>
                <Stack align="center" spacing={0} mb={12}>
                  <Text size={20} weight={700}>
                    Game {index + 1}
                  </Text>
                  <Text size={16} weight={500}>
                    Status: <b>{game.status}</b>
                  </Text>
                  <Text size={16} weight={500}>
                    Your equation should equal: <b>{evaluateEquationArray(game.puzzle)}</b>
                  </Text>
                  <Text size={16} weight={500}>
                    {new Date(game.finishedAt).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    </Text>
                </Stack>
                <GameGrid
                  puzzle={todaysPuzzle}
                  activeGame={game}
                  activeRowIndex={activeRow}
                  viewOnly
                  compact
                />
              </Stack>
            ))}
          </Stack>
        </ScrollArea>
    </Stack>
  );
};

export default MyHistory;
