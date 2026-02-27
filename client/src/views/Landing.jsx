import React, { useEffect, useMemo, useState } from "react";
import { NavLink as Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useToasts } from "react-toast-notifications";

import { login, loadUser } from "../actions/auth";
import {
  getSolanaAuthMessage,
  verifySolanaAuth,
  updateSolanaProfile,
  getSolanaWalletBalance,
} from "../services/api.service";

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
  title: { margin: 0, fontSize: "2.3rem", lineHeight: 1.2 },
  subtitle: { marginTop: "0.9rem", color: "#c7d2ea", lineHeight: 1.6, maxWidth: 760 },
  walletCard: {
    marginTop: "1.8rem",
    background: "rgba(14, 20, 32, 0.7)",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "1.1rem",
  },
  walletText: { margin: "0.5rem 0 1rem", color: "#b4c2e0", fontSize: "0.92rem" },
  actions: { display: "flex", gap: "0.8rem", flexWrap: "wrap" },
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
  field: {
    marginBottom: "1rem",
  },
}));

const shortenAddress = address => `${address.slice(0, 4)}...${address.slice(-4)}`;
const uint8ToBase64 = uint8Array => btoa(String.fromCharCode(...uint8Array));

const Landing = ({ isAuthenticated, user, login, loadUser }) => {
  const classes = useStyles();
  const { addToast } = useToasts();

  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [onChainBalance, setOnChainBalance] = useState(null);
  const [balanceData, setBalanceData] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const walletStatus = useMemo(() => {
    if (walletLoading) {
      return "Awaiting wallet signature...";
    }
    if (isAuthenticated && user?.solanaAddress) {
      return `Connected wallet: ${shortenAddress(user.solanaAddress)}`;
    }
    if (walletAddress) {
      return `Connected wallet: ${shortenAddress(walletAddress)}`;
    }
    if (walletError) {
      return walletError;
    }
    return "Connect Phantom to sign in, then complete your username and email to unlock full web3 casino access.";
  }, [walletLoading, isAuthenticated, user, walletAddress, walletError]);

  const refreshBalanceData = async () => {
    try {
      const data = await getSolanaWalletBalance();
      setBalanceData(data);
    } catch (error) {
      setWalletError(error?.response?.data?.error || "Unable to fetch wallet balance right now.");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.solanaAddress) {
        setWalletAddress(user.solanaAddress);
      }
      if (user.email) {
        setEmail(user.email);
      }
      if (user.username) {
        setUsername(user.username);
      }
      refreshBalanceData();
    }
  }, [isAuthenticated, user]);

  const connectWallet = async () => {
    setWalletError("");
    setWalletLoading(true);

    if (!window.solana || !window.solana.isPhantom) {
      setWalletLoading(false);
      setWalletError("Phantom wallet not detected. Install Phantom to continue.");
      return;
    }

    try {
      const connectResponse = await window.solana.connect();
      const selectedWallet = connectResponse.publicKey.toString();
      setWalletAddress(selectedWallet);

      const { message } = await getSolanaAuthMessage(selectedWallet);
      const encodedMessage = new TextEncoder().encode(message);
      const signed = await window.solana.signMessage(encodedMessage, "utf8");
      const signatureBase64 = uint8ToBase64(signed.signature);

      const verifyData = await verifySolanaAuth(selectedWallet, signatureBase64);
      await login({ token: verifyData.token });
      await loadUser();

      setOnChainBalance(verifyData.onChainBalance);
      if (verifyData.needsProfileSetup) {
        setProfileModalOpen(true);
        addToast("Wallet connected. Complete username and email to finish signup.", { appearance: "info" });
      } else {
        addToast("Wallet connected and signed in successfully.", { appearance: "success" });
      }
    } catch (error) {
      setWalletError(error?.response?.data?.error || error?.message || "Wallet connection failed.");
      addToast("Failed to connect wallet.", { appearance: "error" });
    } finally {
      setWalletLoading(false);
    }
  };

  const submitProfile = async () => {
    setProfileSubmitting(true);
    setWalletError("");

    try {
      await updateSolanaProfile({ username, email });
      await loadUser();
      setProfileModalOpen(false);
      addToast("Profile completed. You can now use deposits and withdrawals.", { appearance: "success" });
    } catch (error) {
      setWalletError(error?.response?.data?.error || "Could not save profile.");
      addToast("Profile setup failed.", { appearance: "error" });
    } finally {
      setProfileSubmitting(false);
    }
  };

  return (
    <Box className={classes.page}>
      <Dialog open={profileModalOpen} disableBackdropClick disableEscapeKeyDown>
        <DialogTitle>Complete your Solana account</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={event => setUsername(event.target.value)}
            className={classes.field}
          />
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={submitProfile} color="primary" disabled={profileSubmitting}>
            {profileSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box className={classes.hero}>
        <span className={classes.badge}>Now live on Solana</span>
        <h1 className={classes.title}>Soluxe: Web3 Casino Powered by SOL</h1>
        <p className={classes.subtitle}>
          Sign in with Phantom, finalize your profile, and use on-chain balance checks before
          depositing or withdrawing. This now ties wallet authentication directly into casino
          account state.
        </p>

        <Box className={classes.walletCard}>
          <strong>Wallet Gateway</strong>
          <p className={classes.walletText}>{walletStatus}</p>
          <Box className={classes.actions}>
            <Button className={classes.primary} onClick={connectWallet} disabled={walletLoading}>
              {walletLoading ? <CircularProgress size={20} /> : "Connect Phantom"}
            </Button>
            <Button className={classes.secondary} component={Link} to="/home">
              Enter Casino Lobby
            </Button>
          </Box>
        </Box>

        <Box className={classes.list}>
          <Box className={classes.listItem}>⚡ Fast finality with Solana transactions.</Box>
          <Box className={classes.listItem}>🔐 Phantom signature creates authenticated session.</Box>
          <Box className={classes.listItem}>🧾 Username + email popup now completes first-time wallet signup.</Box>
          <Box className={classes.listItem}>
            💰 On-chain SOL: {balanceData ? balanceData.onChainBalance.toFixed(4) : onChainBalance !== null ? onChainBalance.toFixed(4) : "--"}
          </Box>
          <Box className={classes.listItem}>
            📥 Deposit ready: {balanceData ? (balanceData.canDeposit ? "Yes" : "No") : "--"}
          </Box>
          <Box className={classes.listItem}>
            📤 Withdraw ready: {balanceData ? (balanceData.canWithdraw ? "Yes" : "No") : "--"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object,
  login: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
});

export default connect(mapStateToProps, { login, loadUser })(Landing);
