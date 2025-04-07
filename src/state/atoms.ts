import { MathlerGameRecord } from '@/types/mathler';
import { UserMetadata } from '@/types/user';
import { UserProfile } from '@dynamic-labs/sdk-react-core';
import { Client } from '@xmtp/browser-sdk';
import { atom } from 'jotai';

/* Global Puzzle Atoms */
export const isLoadingPuzzleAtom = atom<boolean>(false); // loading state for puzzle
export const puzzleAtom = atom<string[]>([]); // current puzzle (tokenized)
export const dailyTargetValueAtom = atom<number | null>(null); // the result to reach

/* User Atoms */
export const userDataIsLoadingAtom = atom<boolean>(false); // loading state for user data
export const userMetadataAtom = atom<UserMetadata>(); // user metadata
export const userGamesHistoryAtom = atom<MathlerGameRecord[]>([]); // user game history
export const userAtom = atom<UserProfile>(); // user object from dynamic

/* Active Game Atoms */
export const activeGameAtom = atom<MathlerGameRecord | null>(null); // current game in progress
export const activeRowAtom = atom<number>(0); // which row user is on

/* XMTP Atoms */
export const xmtpClientAtom = atom<Client | null>(null);
export const xmtpStatusAtom = atom<'idle' | 'connecting' | 'connected' | 'error'>('idle');
export const xmtpErrorAtom = atom<string | null>(null); 
export const xmtpGameToShareAtom = atom<MathlerGameRecord>();
export const xmtpShareModalOpen = atom<Boolean>(false);