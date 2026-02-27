import React, { useMemo, useState } from "react";
import { NavLink as Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  page: {
    minHeight: "calc(100vh - 90px)",
    background: "radial-gradient(circle at top, #262f53 0%, #121720 45%, #0b0f16 100%)",
    color: "#eef3ff",
    padding: "2.5rem 2rem 3rem",
    [theme.breakpoints.down("sm")]: {
      padding: "1.5rem 1rem 2rem",
    },
  },
  hero: {
    maxWidth: 920,
    margin: "0 auto",
    border: "1px solid rgba(120, 170, 255, 0.2)",
    borderRadius: 16,
    background: "linear-gradient(140deg, rgba(38, 89, 255, 0.18), rgba(0, 255, 163, 0.1))",
    padding: "2.5rem",
    boxShadow: "0 20px 50px rgba(6, 10, 20, 0.6)",
    [theme.breakpoints.down("sm")]: {
      padding: "1.5rem",
    },
  },
  badge: {
    display: "inline-block",
    border: "1px solid rgba(0, 255, 163, 0.35)",
    borderRadius: 999,
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    letterSpacing: ".08em",
    marginBottom: "1.2rem",
    textTransform: "uppercase",
    color: "#74ffd0",
  },
  title: {
    margin: 0,
    fontSize: "2.3rem",
    lineHeight: 1.2,
  },
  subtitle: {
    marginTop: "0.9rem",
    color: "#c7d2ea",
    lineHeight: 1.6,
    maxWidth: 760,
  },
  walletCard: {
    marginTop: "1.8rem",
    background: "rgba(14, 20, 32, 0.7)",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "1.1rem",
  },
  walletText: {
    margin: "0.5rem 0 1rem",
    color: "#b4c2e0",
    fontSize: "0.92rem",
  },
  actions: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  primary: {
    background: "linear-gradient(135deg, #6f80ff, #23d9a8)",
    color: "#0a0f16",
    fontWeight: 700,
    padding: "0.65rem 1.1rem",
  },
  secondary: {
    border: "1px solid rgba(130, 176, 255, 0.6)",
    color: "#d4e3ff",
    padding: "0.65rem 1.1rem",
  },
  list: {
    marginTop: "1.3rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "0.8rem",
  },
  listItem: {
    background: "rgba(11, 15, 26, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    padding: "0.9rem",
    color: "#cdd8f2",
    fontSize: "0.9rem",
  },
}));

const shortenAddress = address => `${address.slice(0, 4)}...${address.slice(-4)}`;

const Landing = () => {
  const classes = useStyles();
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");

  const walletStatus = useMemo(() => {
    if (walletAddress) {
      return `Connected wallet: ${shortenAddress(walletAddress)}`;
    }

    if (walletError) {
      return walletError;
    }

    return "Connect Phantom to use SOL deposits, instant on-chain withdrawals, and provable game outcomes.";
  }, [walletAddress, walletError]);

  const connectWallet = async () => {
    setWalletError("");

    if (!window.solana || !window.solana.isPhantom) {
      setWalletError("Phantom wallet not detected. Install Phantom to continue.");
      return;
    }

    try {
      const response = await window.solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      setWalletError(error?.message || "Wallet connection was rejected.");
    }
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.hero}>
        <span className={classes.badge}>Now live on Solana</span>
        <h1 className={classes.title}>Soluxe: Web3 Casino Powered by SOL</h1>
        <p className={classes.subtitle}>
          Your casino is now positioned as a Solana-native experience with wallet-based access,
          transparent gameplay and low-fee, high-speed transactions. Launch directly from your
          wallet and move from deposit to game in seconds.
        </p>

        <Box className={classes.walletCard}>
          <strong>Wallet Gateway</strong>
          <p className={classes.walletText}>{walletStatus}</p>
          <Box className={classes.actions}>
            <Button className={classes.primary} onClick={connectWallet}>
              Connect Phantom
            </Button>
            <Button className={classes.secondary} component={Link} to="/home">
              Enter Casino Lobby
            </Button>
          </Box>
        </Box>

        <Box className={classes.list}>
          <Box className={classes.listItem}>⚡ Fast finality with Solana transactions.</Box>
          <Box className={classes.listItem}>🔐 Wallet-first identity instead of Web2-only auth.</Box>
          <Box className={classes.listItem}>🎲 Existing games available in one web3-ready lobby.</Box>
          <Box className={classes.listItem}>📈 Designed for token rewards, staking and NFT perks.</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
