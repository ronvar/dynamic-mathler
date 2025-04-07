import { xmtpClientAtom, xmtpErrorAtom, xmtpGameToShareAtom, xmtpShareModalOpen, xmtpStatusAtom } from "@/state/atoms";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAtom } from "jotai";
import { Client, Signer as XmtpSigner } from "@xmtp/xmtp-js";
import { useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { MathlerGameRecord } from "@/types/mathler";

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
    const xmtpSigner: XmtpSigner = {
      getAddress: async () => primaryWallet.address!,
      signMessage: async (message: Uint8Array | string) => {
        if (typeof message !== "string") {
          message = new TextDecoder().decode(message);
        }
        const signedMessage = await primaryWallet.signMessage(message);
        if (!signedMessage) {
          throw new Error("Failed to sign message");
        }
        return signedMessage;
      },
    };
    const xmtp = await Client.create(xmtpSigner, {
      env: "dev",
      // env: "production",
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
        if (currentError) setError(null)
    }, 5_000)

    return () => clearTimeout(timeout)
  }, [currentError])

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
        const isValidXmtpAddress = client.canMessage(address);
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

      const canMessage = await client.canMessage(recipient);
      if (!canMessage) {
        setError("Recipient cannot receive messages");
        return;
      }

      try {
        const conversation = await client.conversations.newConversation(
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
  }, [])

  const setGameScoreToShare = useCallback((game: MathlerGameRecord) => {
    setGameToShare(game);
    setModalOpen(true);
  }, [])

  return {
    modalOpen,
    currentError,
    closeXMTPModal,
    setGameScoreToShare,
    isValidXmtpAddress,
    sendMessage,
  };
};

export default useXMTPMessenger;
