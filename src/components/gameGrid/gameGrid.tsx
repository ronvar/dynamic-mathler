"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Center,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { AttemptItem, MathlerGameRecord } from "@/types/mathler";
import styles from "./gameGrid.module.scss";
import { isNumber, isOperator } from "@/utils/mathler";

type GameGridProps = {
  puzzle: string[];
  activeGame: MathlerGameRecord | null;
  activeRowIndex: number;
  onAttemptComplete?: (attempt: AttemptItem[]) => Promise<void>;
  viewOnly?: boolean;
  compact?: boolean;
};

export const GameGrid: React.FC<GameGridProps> = ({
  puzzle,
  activeGame,
  activeRowIndex,
  viewOnly,
  compact,
  onAttemptComplete,
}) => {
  const [attempts, setAttempts] = useState<AttemptItem[][]>(
    activeGame?.attemptsGrid || []
  );
  const isSolved = activeGame?.status === "won";
  const currentRow = attempts[activeRowIndex] || [];
  const rowLength = puzzle.length;
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const inputRef = useRef<(HTMLInputElement | null)[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [rowFeedback, setRowFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);

  useEffect(() => {
    setAttempts(activeGame?.attemptsGrid || []);
    setActiveColumnIndex(0);
  }, [activeGame]);

  useEffect(() => {
    const inputElement =
      inputRef.current?.[activeRowIndex]?.[activeColumnIndex];
    if (inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  }, [activeColumnIndex, activeRowIndex]);

  const handleKeyPress = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>, colIndex: number) => {
      const keyPressed = e.key;

      if (
        keyPressed === " " ||
        keyPressed === "ArrowRight" ||
        keyPressed === "Tab"
      ) {
        e.preventDefault();
        if (isSolved || !currentRow[colIndex].value) {
          return;
        }

        if (colIndex < rowLength - 1) {
          setActiveColumnIndex(colIndex + 1);
        }
      } else if (keyPressed === "Backspace") {
        if (!currentRow[colIndex].value && colIndex > 0) {
          setActiveColumnIndex(colIndex - 1);
        }
      } else if (keyPressed === "Enter" || keyPressed === "NumpadEnter") {
        const guess = [...(attempts[activeRowIndex] || [])];
        if (guess.length === rowLength && guess.every((t) => t.value)) {
          e.preventDefault();
          setIsSubmitting(true);
          onAttemptComplete && await onAttemptComplete(guess);
          const wasCorrect = guess.every((t) => t.color === "green");
          setRowFeedback(wasCorrect ? "correct" : "incorrect");
          if (wasCorrect) {
            setShowSolvedModal(true);
          }
          setTimeout(() => {
            setRowFeedback(null);
          }, 1_000);
          setIsSubmitting(false);
          setActiveColumnIndex(0);
        }
      }
    },
    [
      attempts,
      activeRowIndex,
      onAttemptComplete,
      rowLength,
      currentRow,
      activeColumnIndex,
      setActiveColumnIndex,
    ]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, colIndex: number) => {
      const value = e.target.value;
      const isValidInput = isNumber(value) || isOperator(value);
      if (!isValidInput && value !== "") {
        e.preventDefault();
        return;
      }

      const newRow = [...currentRow];
      newRow[colIndex] = {
        value: value,
        color: null,
      };

      setAttempts((prev) => {
        const newAttempts = [...prev];
        newAttempts[activeRowIndex] = newRow;
        return newAttempts;
      });
    },
    [currentRow, activeRowIndex]
  );

  const onHandleInputRef = useCallback(
    (element: HTMLInputElement | null, rowIndex: number, colIndex: number) => {
      if (!inputRef.current[rowIndex]) {
        inputRef.current[rowIndex] = [];
      }
      inputRef.current[rowIndex][colIndex] = element;
    },
    []
  );

  return (
    <SimpleGrid
      cols={1}
      spacing="xs"
      style={{ margin: "0 auto" }}
      className={`${isSubmitting ? styles.gridSubmit : ""}`}
    >
      <Modal
        opened={showSolvedModal}
        onClose={() => setShowSolvedModal(false)}
        withCloseButton={false}
        radius={16}
        centered
      >
        <Center w={"100%"}>
          <Stack w={"100%"}>
            <Stack w={"100%"} align="center" spacing={0}>
              <Text
                className={`${styles.finishedText} ${
                  isSolved ? styles.solved : ""
                }`}
              >
                {isSolved ? "Congrats!" : "Aw, man!"}
              </Text>
              <Text align="center" w={"85%"}>
                {isSolved
                  ? "You solved the puzzle! Why not share your results with your buds?"
                  : "You didn't get it this time. Try again tomorrow! You can always share your loss... beware of criticism."}
              </Text>
              <Group spacing={4} mt={8}>
                <Text align="center" fz="xs">
                    Powered by
                </Text>
                    <Image src={"img/xmtp-logo.png"}
                    height={12}
                    width={"auto"}
                    style={{
                        filter: 'invert(1)'
                    }}
                    alt="XMTP Logo"
                    />
              </Group>
            </Stack>
            <Group position="right" spacing={12} w={"100%"} pr={8} py={8}>
              <Button
                variant="filled"
                color="gray"
                onClick={() => {
                  setShowSolvedModal(false);
                  setActiveColumnIndex(0);
                }}
              >
                Close
              </Button>
              <Button
                variant="filled"
                style={{
                  backgroundColor: "#2ecc71",
                  color: "#222",
                }}
                onClick={() => {
                  setShowSolvedModal(false);
                  setActiveColumnIndex(0);
                }}
              >
                Share
              </Button>
            </Group>
          </Stack>
        </Center>
      </Modal>
      {attempts.map((row, rowIndex) => (
        <SimpleGrid
          cols={rowLength}
          key={rowIndex}
          spacing={compact ? 6 : undefined}
          className={
            rowIndex === activeRowIndex - 1 && rowFeedback
              ? styles[
                  `row${
                    rowFeedback.charAt(0).toUpperCase() + rowFeedback.slice(1)
                  }`
                ]
              : ""
          }
        >
          {Array.from({ length: rowLength }, (_, colIndex) => {
            const isActiveRow = rowIndex === activeRowIndex;
            const isActiveColumn = colIndex === activeColumnIndex;
            let className = `${styles.tile}`;
            if (isActiveRow && isActiveColumn && !isSolved && !viewOnly) {
              className += ` ${styles.activeTile}`;
            } else if (isActiveRow && !viewOnly) {
              className += ` ${styles.unsolvedTile}`;
            } else if (row[colIndex]?.color) {
              className += ` ${styles[row[colIndex].color]}`;
            } else {
              className += ` ${styles.unsolvedTile}`;
            }

            if (compact) {
              className += ` ${styles.compact}`;
            }

            return (
              <TextInput
                className={className}
                key={colIndex}
                ref={(element) => onHandleInputRef(element, rowIndex, colIndex)}
                value={row[colIndex].value || ""}
                onKeyDown={(e) => handleKeyPress(e, colIndex)}
                onChange={(e) => handleTextChange(e, colIndex)}
              />
            );
          })}
        </SimpleGrid>
      ))}
    </SimpleGrid>
  );
};
