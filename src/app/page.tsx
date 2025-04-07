'use client';

import styles from "./page.module.css";
import { usePuzzleGrabber } from "@/hooks/usePuzzleGrabber";
import { Flex, Text } from "@mantine/core";
import { useUserData } from "@/hooks/useUserData";

export default function Home() {
  usePuzzleGrabber(true);
  useUserData(true); // Fetch user data on page load

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <Flex direction="column" align="start" justify="center" gap={2}>
        <Text size={30} weight={700} align="center" w={"100%"}>
          Welcome to<br />
          <Text 
          className={styles.rotatingGradient}
          fz={66}
          >M 4 + H L 3 R</Text>
        </Text>
        <Text size={16} weight={400} align="center">
          A math puzzle game where you can solve math wordles and spread the word!
        </Text>
      </Flex>
      </main>
    </div>
  );
}
