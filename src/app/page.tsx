'use client';

import styles from "./page.module.css";
import { Button, Flex, Text } from "@mantine/core";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Home() {
  const { user, setShowAuthFlow } = useUserData();
  const router = useRouter();

  const onPlayClick = useCallback(() => {
    router.push("/play");
  }, []);

  const onSignInClick = useCallback(() => {
    setShowAuthFlow(true);
  }
  , [setShowAuthFlow]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <Flex direction="column" align="center" justify="center" gap={2}>
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
        {!!user ? (
          <Button
            variant="outline"
            color="green"
            size="lg"
            mt={16}
            onClick={onPlayClick}
            w={"min-content"}
          >
            Play
          </Button>
        ) : (
          <Button
            variant="outline"
            color="green"
            size="lg"
            mt={16}
            onClick={onSignInClick}
            w={"min-content"}
          >
            Sign In or Sign Up to Start
          </Button>
        )}
      </Flex>
      </main>
    </div>
  );
}
