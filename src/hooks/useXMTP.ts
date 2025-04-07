import {
  xmtpClientAtom,
  xmtpErrorAtom,
  xmtpGameToShareAtom,
  xmtpShareModalOpen,
  xmtpStatusAtom,
} from "@/state/atoms";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAtom } from "jotai";
import { Client, Identifier, Signer } from "@xmtp/browser-sdk";
import { useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { MathlerGameRecord } from "@/types/mathler";
import { getEmojiGridFromGame } from "@/utils/mathler";

const useXMTPMessenger = () => {
  const { primaryWallet } = useDynamicContext();
  const [client, setClient] = useAtom(xmtpClientAtom);
  const [currentStatus, setStatus] = useAtom(xmtpStatusAtom);
  const [currentError, setError] = useAtom(xmtpErrorAtom);
  const [gameToShare, setGameToShare] = useAtom(xmtpGameToShareAtom);
  const [modalOpen, setModalOpen] = useAtom(xmtpShareModalOpen);

  const initXMTP = async () => {
    if (currentStatus === "connecting") return;
    if (!primaryWallet?.signMessage || !primaryWallet?.address) {
      console.log("No primary wallet found");
      return;
    }

    if (client) {
      console.log("XMTP client already initialized");
      return;
    }

    try {
      setStatus("connecting");
      const accountIdentifier: Identifier = {
        identifier: primaryWallet.address,
        identifierKind: "Ethereum",
      };

      const xmtpSigner: Signer = {
        type: "EOA",
        getIdentifier: async () => accountIdentifier,
        signMessage: async (message: Uint8Array | string): Promise<Uint8Array> => {
          if (typeof message !== "string") {
            message = new TextDecoder().decode(message);
          }
      
          const signature = await primaryWallet.signMessage(message);
      
          // Convert hex string to Uint8Array
          return Uint8Array.from(Buffer.from(signature!.slice(2), 'hex'));
        },
      };
      const encryptionKey = window.crypto.getRandomValues(new Uint8Array(32));
      const xmtp = await Client.create(xmtpSigner, encryptionKey, {
        env: "dev",
      });
      setClient(xmtp);
      setStatus("connected");
    } catch (error: any) {
      console.error("Error initializing XMTP:", error);
      setError(error.message || "Unknown error");
      setStatus("error");
    }
  };

  useEffect(() => {
    initXMTP();
  }, [primaryWallet]);

  useEffect(() => {
    // clear the error after 5 seconds
    const timeout = setTimeout(() => {
      if (currentError) setError(null);
    }, 5_000);

    return () => clearTimeout(timeout);
  }, [currentError]);

  const isValidXmtpAddress = useCallback(
    (address: string) => {
      // Basic validation for Ethereum addresses
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      if (!isValid) return false;
      // Check if the address is a valid Ethereum address
      try {
        ethers.getAddress(address);
      } catch (error) {
        console.error("Invalid Ethereum address:", error);
        return false;
      }

      // Check if the address is a valid xmtp address
      if (!client) {
        console.error("XMTP client not initialized");
        return false;
      }

      try {
        const recipientIdentifier: Identifier = {
          identifier: address,
          identifierKind: "Ethereum",
        };
        const isValidXmtpAddress = client.canMessage([recipientIdentifier]);
        return isValidXmtpAddress;
      } catch (error) {
        console.error("Error validating XMTP address:", error);
        return false;
      }
    },
    [setError, client]
  );

  const sendMessage = useCallback(
    async (recipient: string, message: string) => {
      if (!client) {
        console.error("XMTP client not initialized");
        return;
      }
      const recipientIdentifier: Identifier = {
        identifier: recipient,
        identifierKind: "Ethereum",
      };

      const canMessage = await client.canMessage([recipientIdentifier]);
      if (!canMessage) {
        setError("Recipient cannot receive messages");
        return;
      }

      try {
        const conversation = await client.conversations.newDm(
          recipient
        );
        await conversation.send(message);
        return true;
      } catch (error: any) {
        console.error("Error sending message:", error);
        setError(error.message || "Unknown error");
        return false;
      }
    },
    [client, setError]
  );

  const closeXMTPModal = useCallback(() => {
    setModalOpen(false);
    setGameToShare(undefined);
  }, []);

  const setGameScoreToShare = useCallback((game: MathlerGameRecord) => {
    setGameToShare(game);
    setModalOpen(true);
  }, []);

  const generateMessage = useCallback((game: MathlerGameRecord) => {
    const { puzzle, status } = game;
    const emojiGrid = getEmojiGridFromGame(game);

    const intro =
      status === "won"
        ? "I solved the puzzle! 🎉"
        : "I couldn't solve the puzzle. 😢";

    const puzzleString = `Puzzle: ${puzzle.join(" ")}`;
    const message = `${intro}\n\n${puzzleString}\n\n${emojiGrid}`;
    return message;
  }, []);

  return {
    modalOpen,
    currentError,
    closeXMTPModal,
    setGameScoreToShare,
    isValidXmtpAddress,
    sendMessage,
    generateMessage,
  };
};

export default useXMTPMessenger;
