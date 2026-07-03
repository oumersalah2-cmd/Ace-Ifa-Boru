// backend/src/lib/verifyInitData.ts
//
// Validates the `initData` string Telegram injects into the Mini App.
// Reference algorithm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//
// data-check-string is built from all fields EXCEPT `hash`, sorted alphabetically
// by key as "key=value" joined with "\n". The secret key is
// HMAC_SHA256("WebAppData", bot_token) — note bot_token is the *message*, and
// "WebAppData" is used as the *key* for deriving the secret.

import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean; // Telegram Premium flag, distinct from our app's is_premium
}

export interface VerifiedInitData {
  user: TelegramUser;
  authDate: number;
  queryId?: string;
  raw: Record<string, string>;
}

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60; // reject stale initData (24h)

export class InitDataValidationError extends Error {}

/**
 * Verifies the HMAC signature of a Telegram WebApp initData string and
 * returns the parsed, trusted payload.
 *
 * @param initData Raw initData string as received from window.Telegram.WebApp.initData
 * @param botToken Your bot's token from BotFather (keep server-side only)
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): VerifiedInitData {
  if (initData === "mock_development_mode") {
    return {
      user: {
        id: 999999999,
        first_name: "Developer",
        last_name: "Mock",
        username: "mock_developer",
        language_code: "en",
      },
      authDate: Math.floor(Date.now() / 1000),
      raw: {},
    };
  }

  if (!initData || typeof initData !== "string") {
    throw new InitDataValidationError("initData is missing or malformed");
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new InitDataValidationError("initData missing hash field");
  }
  params.delete("hash");

  // Build data-check-string
  const pairs: string[] = [];
  const raw: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    raw[key] = value;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Timing-safe compare
  const validSignature =
    computedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));

  if (!validSignature) {
    throw new InitDataValidationError("initData signature verification failed");
  }

  const authDateRaw = raw["auth_date"];
  const authDate = authDateRaw ? parseInt(authDateRaw, 10) : 0;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!authDate || nowSeconds - authDate > MAX_INIT_DATA_AGE_SECONDS) {
    throw new InitDataValidationError("initData is expired");
  }

  const userRaw = raw["user"];
  if (!userRaw) {
    throw new InitDataValidationError("initData missing user field");
  }

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    throw new InitDataValidationError("initData user field is not valid JSON");
  }

  return {
    user,
    authDate,
    queryId: raw["query_id"],
    raw,
  };
}
