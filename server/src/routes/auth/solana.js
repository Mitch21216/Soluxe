const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const uuid = require("uuid");
const crypto = require("crypto");

const User = require("../../models/User");
const config = require("../../config");
const { validateJWT } = require("../../middleware/auth");

const NONCE_TTL_MS = 5 * 60 * 1000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const walletNonceState = new Map();
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const createDefaultAvatar = username =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D8ABC&color=fff`;

const base58Decode = value => {
  if (!value || typeof value !== "string") {
    throw new Error("Invalid base58 value.");
  }

  const bytes = [0];

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const charIndex = BASE58_ALPHABET.indexOf(char);
    if (charIndex < 0) {
      throw new Error("Invalid base58 character.");
    }

    for (let j = 0; j < bytes.length; j += 1) {
      bytes[j] *= 58;
    }

    bytes[0] += charIndex;

    let carry = 0;
    for (let j = 0; j < bytes.length; j += 1) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (let i = 0; i < value.length && value[i] === "1"; i += 1) {
    bytes.push(0);
  }

  return Buffer.from(bytes.reverse());
};

const verifySolanaSignature = ({ message, signatureBase64, walletAddress }) => {
  const signatureBuffer = Buffer.from(signatureBase64, "base64");
  const publicKeyBuffer = base58Decode(walletAddress);

  if (publicKeyBuffer.length !== 32) {
    throw new Error("Invalid Solana public key length.");
  }

  const ed25519SpkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const publicKey = crypto.createPublicKey({
    key: Buffer.concat([ed25519SpkiPrefix, publicKeyBuffer]),
    format: "der",
    type: "spki",
  });

  return crypto.verify(null, Buffer.from(message), publicKey, signatureBuffer);
};

const createJwtToken = userId =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { user: { id: userId } },
      config.authentication.jwtSecret,
      { expiresIn: config.authentication.jwtExpirationTime },
      (error, token) => {
        if (error) {
          return reject(error);
        }
        return resolve(token);
      }
    );
  });

const getSolanaBalance = async walletAddress => {
  const response = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress],
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Could not fetch SOL balance.");
  }

  const lamports = data?.result?.value || 0;
  return lamports / 1000000000;
};

router.post(
  "/nonce",
  check("walletAddress", "Wallet address is required").notEmpty().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const walletAddress = req.body.walletAddress.trim();
      const nonce = uuid.v4();
      const message = [
        "Sign this message to login to Soluxe.",
        `Wallet: ${walletAddress}`,
        `Nonce: ${nonce}`,
      ].join("\n");

      walletNonceState.set(walletAddress, {
        nonce,
        message,
        expiresAt: Date.now() + NONCE_TTL_MS,
      });

      return res.json({ message });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/verify",
  [
    check("walletAddress", "Wallet address is required").notEmpty().isString(),
    check("signature", "Signature is required").notEmpty().isString(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const walletAddress = req.body.walletAddress.trim();
      const signature = req.body.signature.trim();
      const state = walletNonceState.get(walletAddress);

      if (!state || state.expiresAt < Date.now()) {
        return res.status(400).json({ error: "Session expired. Request a new signature message." });
      }

      const isValid = verifySolanaSignature({
        message: state.message,
        signatureBase64: signature,
        walletAddress,
      });

      if (!isValid) {
        return res.status(401).json({ error: "Invalid wallet signature." });
      }

      walletNonceState.delete(walletAddress);

      let user = await User.findOne({ provider: "solana", providerId: walletAddress });

      if (!user) {
        const defaultUsername = `sol${walletAddress.slice(0, 6)}`;
        user = await User.create({
          provider: "solana",
          providerId: walletAddress,
          solanaAddress: walletAddress,
          username: defaultUsername,
          email: "",
          avatar: createDefaultAvatar(defaultUsername),
          hasCompletedSolanaProfile: false,
        });
      }

      if (!user.solanaAddress) {
        user.solanaAddress = walletAddress;
      }

      if (typeof user.hasCompletedSolanaProfile !== "boolean") {
        user.hasCompletedSolanaProfile = Boolean(user.username && user.email);
      }

      await user.save();

      const token = await createJwtToken(user.id);
      const onChainBalance = await getSolanaBalance(walletAddress);

      return res.json({
        token,
        needsProfileSetup: !user.hasCompletedSolanaProfile,
        walletAddress,
        onChainBalance,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  "/profile",
  [
    validateJWT,
    check("username", "Username must be 3-16 chars.").isLength({ min: 3, max: 16 }),
    check("email", "Valid email is required.").isEmail(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const username = req.body.username.trim();
      const email = req.body.email.trim().toLowerCase();

      const existingUsername = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" },
        _id: { $ne: user.id },
      });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken." });
      }

      const existingEmail = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
        _id: { $ne: user.id },
      });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use." });
      }

      user.username = username;
      user.email = email;
      user.hasCompletedSolanaProfile = true;
      if (!user.avatar) {
        user.avatar = createDefaultAvatar(username);
      }

      await user.save();

      return res.json({ success: true, user });
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/balance", validateJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const walletAddress = user.solanaAddress || user.providerId;
    if (!walletAddress || user.provider !== "solana") {
      return res.status(400).json({ error: "No Solana wallet linked." });
    }

    const onChainBalance = await getSolanaBalance(walletAddress);

    return res.json({
      walletAddress,
      onChainBalance,
      canDeposit: onChainBalance > 0,
      canWithdraw: user.wallet > 0,
      withdrawableBalance: user.wallet,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
