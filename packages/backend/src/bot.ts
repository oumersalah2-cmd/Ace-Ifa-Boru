// backend/src/bot.ts
import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

export const bot = botToken ? new Bot(botToken) : null;

// HTML escaping helper to prevent Telegram parsing crashes
export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// In-memory simple wizard state
const registrationStates = new Map<bigint, { step: number }>();

if (bot) {
  // Set bot commands programmatically on start
  bot.api
    .setMyCommands([
      { command: "start", description: "Launch the Exam platform" },
      { command: "register", description: "Register a custom login account (username/password)" },
      { command: "stats", description: "View your quiz performance statistics" },
      { command: "premium", description: "Learn about premium membership benefits" },
      { command: "cancel", description: "Cancel ongoing registration" },
    ])
    .catch((err) => console.error("Failed to set bot commands:", err));

  // Handler for /start command
  bot.command("start", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    const firstName = ctx.from?.first_name || "there";
    const username = ctx.from?.username;

    // Reset any ongoing wizard state
    registrationStates.delete(telegramId);

    // Deep linking parameter
    const startPayload = ctx.match;

    // Upsert user inside Telegram flow
    try {
      await prisma.user.upsert({
        where: { telegramId },
        update: { username, firstName },
        create: { telegramId, username, firstName },
      });
    } catch (err) {
      console.error("Bot failed to register/update user:", err);
    }

    const appUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:3000").trim();
    const isHttps = appUrl.startsWith("https://");

    let welcomeText = `👋 Hello, <b>${escapeHtml(firstName)}</b>!\n\n` +
      `Welcome to <b>Ace-Ifa-Boru</b> — the ultimate premium exam preparation platform! 🚀\n\n` +
      `Prepare for your tests, track your analytics, and master subjects with real-time feedback.`;

    if (startPayload) {
      welcomeText += `\n\n🎯 Ready to start with subject: <b>${escapeHtml(startPayload)}</b>? Open the app below to launch directly!`;
    } else {
      welcomeText += `\n\nClick the button below to start your exam practice session!\n\n` +
        `💡 <i>If you want to register a custom username/password login account for other devices, type /register</i>`;
    }

    const boardKeyboard = new Keyboard();
    if (isHttps) {
      boardKeyboard.webApp("🚀 Launch App", appUrl);
    } else {
      boardKeyboard.text("🚀 Launch App");
    }
    boardKeyboard
      .row()
      .text("📝 Galmaa'i")
      .text("❓ Deggarsaaf")
      .resized();

    await ctx.reply(welcomeText, {
      parse_mode: "HTML",
      reply_markup: boardKeyboard,
    });
  });

  // Handler for "🚀 Launch App" text button
  bot.hears(/^🚀 Launch App/i, async (ctx) => {
    const appUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:3000").trim();
    const isHttps = appUrl.startsWith("https://");

    const inlineKeyboard = new InlineKeyboard();
    if (isHttps) {
      inlineKeyboard.webApp("🚀 Open Ace-Ifa-Boru App", appUrl);
    } else {
      inlineKeyboard.url("🌐 Open in Browser", appUrl);
    }

    await ctx.reply("🚀 <b>Ace-Ifa-Boru Exam Platform</b> banuuf as tuqaa:", {
      parse_mode: "HTML",
      reply_markup: inlineKeyboard,
    });
  });

  // Shared registration starter
  const startRegistration = async (ctx: any) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    registrationStates.set(telegramId, { step: 1 });
    await ctx.reply(
      "📝 <b>Registraashinii Kaffaltii Ace-Ifa-Boru</b>\n\n" +
      "Maqaa guutuu keessan nuuf barreessaa (Fakkeenya: Caalaa Bulchaa):\n\n" +
      "<i>(Haqquuf /cancel jedhaa)</i>",
      { parse_mode: "HTML" }
    );
  };

  // Handler for bottom keyboard "📝 Galmaa'i" (Register)
  bot.hears("📝 Galmaa'i", startRegistration);

  // Handler for /register command
  bot.command("register", startRegistration);

  // Handler for registration button callback query
  bot.callbackQuery("register_account", async (ctx) => {
    await ctx.answerCallbackQuery();
    await startRegistration(ctx);
  });

  // Handler for /cancel command
  bot.command("cancel", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    if (registrationStates.has(telegramId)) {
      registrationStates.delete(telegramId);
      await ctx.reply("✅ Registraashiniin haqameera (Registration cancelled).");
    } else {
      await ctx.reply("Wanti haqamu hin jiru (Nothing to cancel).");
    }
  });

  // Handler for bottom keyboard "❓ Deggarsaaf" (Help/Support)
  bot.hears("❓ Deggarsaaf", async (ctx) => {
    const helpText = `❓ <b>Gargaarsaafi Deggarsaaf</b>\n\n` +
      `Ace-Ifa-Boru irratti rakkoo ykn gaaffii qabduuf admin qunnamaa:\n\n` +
      `👤 <b>Telegram Admin</b>: @Lamifd\n\n` +
      `Maaloo ragaa kaffaltii (screenshot) keessan asuma bot irratti ykn admin (@Lamifd) irratti nuuf ergaa. Isin gargaaruuf qophiidha!`;
    await ctx.reply(helpText, { parse_mode: "HTML" });
  });

  // Handler for /approve command (Admin only)
  bot.command("approve", async (ctx) => {
    const senderId = BigInt(ctx.from?.id || 0);
    const senderUsername = ctx.from?.username?.toLowerCase();
    const adminIdStr = process.env.ADMIN_TELEGRAM_ID?.trim();
    const isAdmin =
      (adminIdStr && senderId === BigInt(adminIdStr)) ||
      senderUsername === "lamifd";

    if (!isAdmin) {
      return ctx.reply("❌ Command kun admin qofaafi!");
    }

    const rawInput = ctx.match?.trim();
    if (!rawInput) {
      return ctx.reply("❌ Maaloo username dabalaa:\n<code>/approve ifaboru_xyz</code>", {
        parse_mode: "HTML",
      });
    }

    // Strip leading @ and normalize
    const username = rawInput.replace(/^@/, "").toLowerCase();

    try {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      // Search in CredentialUser
      const targetUser = await prisma.credentialUser.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
      });

      let telegramUser = null;

      if (targetUser) {
        await prisma.credentialUser.update({
          where: { id: targetUser.id },
          data: {
            isPremium: true,
            premiumUntil: ninetyDaysFromNow,
          },
        });

        // Also update linked Telegram User if present
        if (targetUser.telegramChatId) {
          try {
            await prisma.user.upsert({
              where: { telegramId: BigInt(targetUser.telegramChatId) },
              update: {
                isPremium: true,
                premiumUntil: ninetyDaysFromNow,
              },
              create: {
                telegramId: BigInt(targetUser.telegramChatId),
                isPremium: true,
                premiumUntil: ninetyDaysFromNow,
              },
            });
          } catch (e) {
            console.warn(`Could not sync linked Telegram User ${targetUser.telegramChatId}:`, e);
          }
        }
      } else {
        // Try looking up in User table by telegramId or username
        const isNumeric = /^\d+$/.test(username);

        if (isNumeric) {
          telegramUser = await prisma.user.findUnique({
            where: { telegramId: BigInt(username) },
          });
        } else {
          telegramUser = await prisma.user.findFirst({
            where: { username: { equals: username, mode: "insensitive" } },
          });
        }

        if (!telegramUser) {
          return ctx.reply(
            `❌ User <code>${escapeHtml(username)}</code> hin argamne (Could not find user in CredentialUser or User table).`,
            { parse_mode: "HTML" }
          );
        }

        await prisma.user.update({
          where: { telegramId: telegramUser.telegramId },
          data: {
            isPremium: true,
            premiumUntil: ninetyDaysFromNow,
          },
        });
      }

      await ctx.reply(
        `✅ User <code>${escapeHtml(username)}</code> Premium ta'ee banameera! (Guyyoota 90f / Ji'oota 3f)`,
        { parse_mode: "HTML" }
      );

      // Send notification to the user if they registered via Telegram
      const chatId = targetUser?.telegramChatId || telegramUser?.telegramId;
      if (chatId) {
        const appUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:3000").trim();
        const loginUrl = `${appUrl}/login`;
        const isHttps = appUrl.startsWith("https://");

        const keyboard = new InlineKeyboard();
        if (isHttps) {
          keyboard.webApp("🚀 Launch Exam Platform", loginUrl);
        } else {
          keyboard.url("🌐 Launch Exam Platform", loginUrl);
        }

        try {
          await bot.api.sendMessage(
            chatId.toString(),
            `🎉 <b>Kaffaltiin Keessan Mirkanaa'eera!</b>\n\n` +
              `Koodiin keessan <code>${escapeHtml(username)}</code> guutummaatti Premium ta'ee banameera. Amma qormaata hunda daangaa malee fayyadamuu ni dandeessu. Barnoota Gaarii!`,
            { parse_mode: "HTML", reply_markup: keyboard }
          );
        } catch (e) {
          console.warn(`Could not notify user ${chatId}:`, e);
        }
      }
    } catch (err) {
      console.error("Failed to approve user:", err);
      await ctx.reply("❌ Approval fail ta'eera. Dogoggorri uumameera.");
    }
  });

  // Handler for /users command (Admin only)
  bot.command("users", async (ctx) => {
    const senderId = BigInt(ctx.from?.id || 0);
    const senderUsername = ctx.from?.username?.toLowerCase();
    const adminIdStr = process.env.ADMIN_TELEGRAM_ID?.trim();
    const isAdmin =
      (adminIdStr && senderId === BigInt(adminIdStr)) ||
      senderUsername === "lamifd";

    if (!isAdmin) {
      return ctx.reply("❌ Command kun admin qofaafi!");
    }

    try {
      const users = await prisma.credentialUser.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      if (users.length === 0) {
        return ctx.reply("Gaazexiichi duwwaadha (No credential users registered).");
      }

      let text = `👥 <b>Credential Users</b> (Recent ${users.length}):\n\n`;
      for (const u of users) {
        const status = u.isPremium ? "👑 Premium" : "🆓 Free";
        text += `• <b>${escapeHtml(u.fullName || "No Name")}</b> (<code>${escapeHtml(u.username)}</code>) — ${status}\n`;
      }

      await ctx.reply(text, { parse_mode: "HTML" });
    } catch (err) {
      console.error("Failed to list users:", err);
      await ctx.reply("❌ Users list gochuu hin dandeenye.");
    }
  });

  // Handler for /stats command
  bot.command("stats", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId },
        include: { examSessions: { where: { isCompleted: true } } },
      });

      const credUsers = await prisma.credentialUser.findMany({
        where: { telegramChatId: telegramId },
        include: { examSessions: { where: { isCompleted: true } } },
      });

      const credSessions = credUsers.flatMap((c) => c.examSessions);
      const userSessions = user?.examSessions || [];

      // Combine unique sessions by id
      const sessionMap = new Map<string, any>();
      for (const s of [...userSessions, ...credSessions]) {
        sessionMap.set(s.id, s);
      }
      const sessions = Array.from(sessionMap.values());

      if (sessions.length === 0) {
        return ctx.reply(
          "📊 You haven't taken any exams yet! Launch the app and complete a quiz to see your statistics here."
        );
      }

      const totalExams = sessions.length;
      const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
      const totalQuestions = sessions.reduce(
        (acc, s) => acc + ((s.questionIds as string[]) || []).length,
        0
      );
      const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

      const isPremium =
        (user?.isPremium && (!user.premiumUntil || user.premiumUntil.getTime() > Date.now())) ||
        credUsers.some((c) => c.isPremium && (!c.premiumUntil || c.premiumUntil.getTime() > Date.now()));

      const premiumStatus = isPremium
        ? "👑 Premium (Unlimited Access)"
        : "🆓 Free Plan";

      const displayName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : credUsers[0]?.fullName || "Student";

      const statsText =
        `📊 <b>Your Performance Summary</b>:\n\n` +
        `👤 <b>User</b>: ${escapeHtml(displayName)}\n` +
        `⭐ <b>Status</b>: ${premiumStatus}\n` +
        `📝 <b>Completed Exams</b>: ${totalExams}\n` +
        `🎯 <b>Average Score</b>: ${avgScore}%\n\n` +
        `Launch the app to see detailed subject-specific analytics!`;

      await ctx.reply(statsText, { parse_mode: "HTML" });
    } catch (err) {
      console.error("Bot failed to fetch stats:", err);
      await ctx.reply("❌ Unable to fetch statistics at the moment. Please try again later.");
    }
  });

  // Handler for /premium command
  bot.command("premium", async (ctx) => {
    const text =
      `👑 <b>Go Premium with Ace-Ifa-Boru!</b>\n\n` +
      `Unlock full access to the platform and accelerate your learning:\n\n` +
      `✅ <b>Unlimited Timed Mock Exams</b> in all categories\n` +
      `✅ <b>Detailed Explanations</b> for every correct and incorrect answer\n` +
      `✅ <b>Advanced Analytics Dashboard</b> tracking subject mastery & performance trends\n` +
      `✅ <b>Ad-Free experience</b> with priority server load\n\n` +
      `Open the app and navigate to the upgrade screen to activate premium instantly!`;

    await ctx.reply(text, { parse_mode: "HTML" });
  });

  // Handler for student receipts / payment screenshots
  bot.on(["message:photo", "message:document"], async (ctx) => {
    const sender = ctx.from;
    const adminId = process.env.ADMIN_TELEGRAM_ID?.trim();

    await ctx.reply(
      "📸 <b>Ragaan kaffaltii keessan dhiyaateera!</b>\n\n" +
      "Adminiin keenya (@Lamifd) yeroo gabaabaa keessatti mirkaneessee koodii keessan activate godha. Galatoomaa!",
      { parse_mode: "HTML" }
    );

    // Forward or notify admin if configured
    if (adminId) {
      try {
        const userInfo =
          `📥 <b>RAGAA KAFFALTII HAARAA (New Payment Receipt)</b>\n\n` +
          `👤 <b>Student</b>: ${escapeHtml(sender?.first_name || "")} (${sender?.username ? `@${escapeHtml(sender.username)}` : "No username"})\n` +
          `🆔 <b>Telegram ID</b>: <code>${sender?.id}</code>\n` +
          `<i>Mirkaneessuuf: /approve &lt;username&gt;</i>`;

        await bot.api.sendMessage(adminId, userInfo, { parse_mode: "HTML" });
        await ctx.forwardMessage(adminId);
      } catch (e) {
        console.error("Failed to forward payment receipt to admin:", e);
      }
    }
  });

  // Message Handler (handles registration wizard state and ignores commands / menu clicks)
  bot.on("message:text", async (ctx, next) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    const state = registrationStates.get(telegramId);
    const text = ctx.message.text.trim();

    // Skip commands and standard keyboard button texts
    if (
      text.startsWith("/") ||
      text === "📝 Galmaa'i" ||
      text === "❓ Deggarsaaf" ||
      text.startsWith("🚀 Launch App")
    ) {
      return next();
    }

    if (state && state.step === 1) {
      const fullName = text;
      if (fullName.length < 3) {
        return ctx.reply("Maqaan keessan gabaabachuu hin qabu. Maqaa guutuu barreessaa:\n<i>(Haqquuf /cancel jedhaa)</i>", {
          parse_mode: "HTML",
        });
      }

      // Generate credentials
      const randStr = Math.random().toString(36).substring(2, 7);
      const username = `ifaboru_${randStr}`;
      const password = `IFA-${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = await bcrypt.hash(password, 8);

      try {
        await prisma.credentialUser.create({
          data: {
            username,
            passwordHash,
            fullName,
            telegramChatId: telegramId,
            isPremium: false,
          },
        });

        registrationStates.delete(telegramId);

        const appUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:3000").trim();
        const loginUrl = `${appUrl}/login`;
        const isHttps = appUrl.startsWith("https://");

        const keyboard = new InlineKeyboard();
        if (isHttps) {
          keyboard.webApp("🚀 Launch Exam Platform", loginUrl);
        } else {
          keyboard.url("🌐 Launch Exam Platform", loginUrl);
        }

        const responseText =
          `🎉 <b>Registraashiniin Milkiin Xumurameera!</b>\n\n` +
          `Amanannaan qormaata keessan dabruuf kaffaltii 200 Birr raawwadhaa.\n\n` +
          `💳 <b>Odeeffannoo Kaffaltii (Payment Details)</b>:\n` +
          `• <b>Baankii Daldala Itoophiyaa (CBE)</b>: <code>1000551443489</code> (<b>Abdusalam Oumer</b>)\n` +
          `• <b>Telebirr</b>: <code>0934978247</code> (<b>Abdusalam Oumer</b>)\n\n` +
          `🔑 <b>Koodii Seensaa Keessan</b>:\n` +
          `• <b>Username</b>: <code>${escapeHtml(username)}</code>\n` +
          `• <b>Password</b>: <code>${escapeHtml(password)}</code>\n\n` +
          `⚠️ <i>Koodii kana hin dhabinaa ykn nama biraatti hin erginaa!</i>\n\n` +
          `📬 Erga kaffaltii raawwattanii booda, ragaa (screenshot) kaffaltii keessanii asuma bot irratti ykn adminii Telegram (@Lamifd) irratti nuuf ergaa. Erga mirkanaa'ee booda akka kaffaltiin keessan fudhatamee fi akka koodiin keessan baname (Activate ta'e) isin beeksifna.\n\n` +
          `Ammaaf koodii kanaan seentanii shaakaluu ni dandeessu (Sagantaa Bilisaa)!`;

        return ctx.reply(responseText, {
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
      } catch (err) {
        console.error("Failed to register credential user:", err);
        return ctx.reply("❌ Dogoggorri uumameera. Maaloo yeroo biraa yaalaa.");
      }
    }

    await next();
  });

  // Catch-all help
  bot.on("message", async (ctx) => {
    const text =
      `🤖 <b>Ace-Ifa-Boru Bot Commands</b>:\n\n` +
      `/start - Launch the Exam platform\n` +
      `/register - Register a custom login account (username/password)\n` +
      `/stats - View your quiz performance statistics\n` +
      `/premium - Learn about premium membership benefits\n` +
      `/cancel - Cancel ongoing registration\n\n` +
      `Launch the platform to start practice exams!`;
    await ctx.reply(text, { parse_mode: "HTML" });
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx?.update?.update_id}:`, err.error);
  });

  console.log("Telegram Bot client configured.");
} else {
  console.log("TELEGRAM_BOT_TOKEN not provided. Bot skipped.");
}
