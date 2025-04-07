import { useUserData } from "@/hooks/useUserData";
import { abbreviateWalletAddress } from "@/utils/wallet";
import { Button, Group, Header, Image } from "@mantine/core"
import { useCallback } from "react";

const AppHeaderBar: React.FC = () => {
    const { user, primaryWallet, logOut, setShowAuthFlow } = useUserData();
    const userAddress = !!user ? primaryWallet?.address : "";

    console.log('user', user);
    console.log('primaryWallet', primaryWallet);

    const onLoginClick = useCallback(() => {
        if (!user) {
            setShowAuthFlow(true);
        } else {
            logOut();
        }
    }, [user, setShowAuthFlow, logOut]);

    return (<Header height={60} p="xs">
        <Group position="apart" w={"100%"} h="100%" px={10}>
            <Image
                src="img/logo.png"
                alt="File icon"
                height={32}
                width={"auto"}
                draggable={false}
            />
            <Button
                variant="gradient"
                onClick={onLoginClick}
            >
                {userAddress ? `Logout ${abbreviateWalletAddress(userAddress)}` : "Login"}
            </Button>
        </Group>
    </Header>)
}

export default AppHeaderBar;