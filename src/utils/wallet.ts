export const abbreviateWalletAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`.toUpperCase();
}