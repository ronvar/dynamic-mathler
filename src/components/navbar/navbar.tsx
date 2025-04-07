import { Button, Group, Navbar } from "@mantine/core";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { GiCubes } from "react-icons/gi";
import styles from "./navbar.module.scss";

const AppNavBar: React.FC = () => {
  const router = useRouter();
  const currentRoute = usePathname();
  const [isHome, isPlay, isHistory] = [
    currentRoute === "/",
    currentRoute === "/play",
    currentRoute === "/my-history",
  ];

  const onClickPlay = () => {
    router.push("/play");
  };
  const onClickHistory = () => {
    router.push("/my-history");
  };
  const onClickHome = () => {
    router.push("/");
  };

  return (
    <Navbar
      className={styles.navbar}
      width={{ base: 230 }}
      height={"100%"}
      p="md"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* create buttons with routes to "/play", "/my-history", and back home */}
      <Navbar.Section grow mt="xs">
        <Button
          variant="gradient"
          fullWidth
          mb="xs"
          onClick={onClickHome}
          disabled={isHome}
        >
          <Group position="apart" spacing={4} w={"100%"}>
            <FaHome size={20} />
            <span>Home</span>
          </Group>
        </Button>
        <Button
          variant="gradient"
          fullWidth
          mb="xs"
          onClick={onClickPlay}
          disabled={isPlay}
        >
          <Group position="apart" spacing={4} w={"100%"}>
            <BsFillGrid3X3GapFill size={20} />
            <span>Play</span>
          </Group>
        </Button>
        <Button
          variant="gradient"
          fullWidth
          mb="xs"
          onClick={onClickHistory}
          disabled={isHistory}
        >
          <Group position="apart" spacing={4} w={"100%"}>
            <GiCubes size={20} />
            <span>My History</span>
          </Group>
        </Button>
      </Navbar.Section>
    </Navbar>
  );
};

export default AppNavBar;
