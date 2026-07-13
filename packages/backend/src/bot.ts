// backend/src/bot.ts
import { Bot, InlineKeyboard } from "grammy";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

export const bot = botToken ? new Bot(botToken) : null;

// In-memory simple wizard state
const registrationStates = new Map<bigint, { step: number }>();

if (bot) {
  // Set bot commands programmatically on start
  bot.api.setMyCommands([
    { command: "start", description: "Launch the Exam platform" },
    { command: "register", description: "Register a custom login account (username/password)" },
    { command: "stats", description: "View your quiz performance statistics" },
    { command: "premium", description: "Learn about premium membership benefits" },
  ]).catch((err) => console.error("Failed to set bot commands:", err));

  // Handler for /start command
  bot.command("start", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    const firstName = ctx.from?.first_name || "there";
    const username = ctx.from?.username;

    // Deep linking parameter
    const startPayload = ctx.match;

    // Upsert user inside Telegram flow too
    try {
      await prisma.user.upsert({
        where: { telegramId },
        update: { username, firstName },
        create: { telegramId, username, firstName },
      });
    } catch (err) {
      console.error("Bot failed to register/update user:", err);
    }

    let welcomeText = `👋 Hello, *${firstName}*!\n\nWelcome to *Ace-Ifa-Boru* — the ultimate premium exam preparation platform! 🚀\n\nPrepare for your tests, track your analytics, and master subjects with real-time feedback.`;

    if (startPayload) {
      welcomeText += `\n\n🎯 Ready to start with subject: *${startPayload}*? Open the app below to launch directly!`;
    } else {
      welcomeText += `\n\nClick the button below to start your exam practice session!\n\n💡 _If you want to register a custom username/password login account for other devices, type /register_`;
    }

    const appUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

    const keyboard = new InlineKeyboard().webApp("🚀 Launch Exam Platform", appUrl);

    await ctx.reply(welcomeText, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  });

  // Handler for /register command (Credential Users)
  bot.command("register", async (ctx) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    registrationStates.set(telegramId, { step: 1 });
    await ctx.reply("📝 *Registraashinii Kaffaltii Ace-Ifa-Boru*\n\nMaqaa guutuu keessan nuuf barreessaa (Fakkeenya: Caalaa Bulchaa):", { parse_mode: "Markdown" });
  });

  // Handler for /approve command (Admin only)
  bot.command("approve", async (ctx) => {
    const senderId = BigInt(ctx.from?.id || 0);
    const senderUsername = ctx.from?.username?.toLowerCase();
    const adminIdStr = process.env.ADMIN_TELEGRAM_ID;
    const isAdmin = (adminIdStr && senderId === BigInt(adminIdStr)) ||
                    senderUsername === "lamifd";
    
    if (!isAdmin) {
      return ctx.reply("❌ Command kun admin qofaafi!");
    }
    
    const username = ctx.match?.trim().toLowerCase();
    if (!username) {
      return ctx.reply("❌ Maaloo username dabalaa: `/approve ifaboru_xyz`", { parse_mode: "Markdown" });
    }
    
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const user = await prisma.credentialUser.findUnique({
        where: { username }
      });
      
      if (!user) {
        return ctx.reply(`❌ User '${username}' hin argamne.`);
      }
      
      await prisma.credentialUser.update({
        where: { username },
        data: {
          isPremium: true,
          premiumUntil: thirtyDaysFromNow
        }
      });
      
      await ctx.reply(`✅ User *${username}* Premium ta'ee banameera! (Guyyoota 30f)`, { parse_mode: "Markdown" });
      
      // Send notification to the user if they registered via Telegram
      if (user.telegramChatId) {
        const appUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
        const loginUrl = `${appUrl}/login`;
        const keyboard = new InlineKeyboard().webApp("🚀 Launch Exam Platform", loginUrl);
        
        try {
          await bot.api.sendMessage(
            Number(user.telegramChatId),
            `🎉 *Kaffaltiin Keessan Mirkanaa'eera!*\n\n` +
            `Koodiin keessan *${username}* guutummaatti Premium ta'ee banameera. Amma qormaata hunda daangaa malee fayyadamuu ni dandeessu. Barnoota Gaarii!`,
            { parse_mode: "Markdown", reply_markup: keyboard }
          );
        } catch (e) {
          console.warn(`Could not notify user ${user.telegramChatId}:`, e);
        }
      }
    } catch (err) {
      console.error("Failed to approve user:", err);
      await ctx.reply("❌ Approval fail ta'eera.");
    }
  });

  // Handler for /users command (Admin only)
  bot.command("users", async (ctx) => {
    const senderId = BigInt(ctx.from?.id || 0);
    const senderUsername = ctx.from?.username?.toLowerCase();
    const adminIdStr = process.env.ADMIN_TELEGRAM_ID;
    const isAdmin = (adminIdStr && senderId === BigInt(adminIdStr)) ||
                    senderUsername === "lamifd";
    
    if (!isAdmin) {
      return ctx.reply("❌ Command kun admin qofaafi!");
    }
    
    try {
      const users = await prisma.credentialUser.findMany({
        orderBy: { createdAt: "desc" },
        take: 30
      });
      
      if (users.length === 0) {
        return ctx.reply("Gaazexiichi duwwaadha (No credential users registered).");
      }
      
      let text = `👥 *Credential Users* (Recent 30):\n\n`;
      for (const u of users) {
        const status = u.isPremium ? "👑 Premium" : "🆓 Free";
        text += `• *${u.fullName}* (\`${u.username}\`) — ${status}\n`;
      }
      
      await ctx.reply(text, { parse_mode: "Markdown" });
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

      if (!user || user.examSessions.length === 0) {
        return ctx.reply(
          "📊 You haven't taken any exams yet! Launch the app and complete a quiz to see your statistics here."
        );
      }

      const sessions = user.examSessions;
      const totalExams = sessions.length;
      const totalScore = sessions.reduce((acc, s) => acc + s.score, 0);
      const totalQuestions = sessions.reduce((acc, s) => acc + ((s.questionIds as string[]) || []).length, 0);
      const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

      const premiumStatus = user.isPremium && (!user.premiumUntil || user.premiumUntil.getTime() > Date.now())
        ? "👑 Premium (Unlimited Access)"
        : "🆓 Free Plan";

      const statsText = `📊 *Your Performance Summary*:\n\n` +
        `👤 *User*: ${user.firstName} ${user.lastName || ""}\n` +
        `⭐ *Status*: ${premiumStatus}\n` +
        `📝 *Completed Exams*: ${totalExams}\n` +
        `🎯 *Average Score*: ${avgScore}%\n\n` +
        `Launch the app to see detailed subject-specific analytics!`;

      await ctx.reply(statsText, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Bot failed to fetch stats:", err);
      await ctx.reply("❌ Unable to fetch statistics at the moment. Please try again later.");
    }
  });

  // Handler for /premium command
  bot.command("premium", async (ctx) => {
    const text = `👑 *Go Premium with Ace-Ifa-Boru!*\n\n` +
      `Unlock full access to the platform and accelerate your learning:\n\n` +
      `✅ *Unlimited Timed Mock Exams* in all categories\n` +
      `✅ *Detailed Explanations* for every correct and incorrect answer\n` +
      `✅ *Advanced Analytics Dashboard* tracking subject mastery & performance trends\n` +
      `✅ *Ad-Free experience* with priority server load\n\n` +
      `Open the app and navigate to the upgrade screen to activate premium instantly!`;

    await ctx.reply(text, { parse_mode: "Markdown" });
  });

  // Message Handler (handles registration wizard state and catches other text messages)
  bot.on("message:text", async (ctx, next) => {
    const telegramId = BigInt(ctx.from?.id || 0);
    const state = registrationStates.get(telegramId);
    
    if (state && state.step === 1) {
      const fullName = ctx.message.text.trim();
      if (fullName.length < 3) {
        return ctx.reply("Maqaan keessan gabaabachuu hin qabu. Maqaa guutuu barreessaa:");
      }
      
      // Generate credentials
      const randStr = Math.random().toString(36).substring(2, 7);
      const username = `ifaboru_${randStr}`;
      const password = `IFA-${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = await bcrypt.hash(password, 10);
      
      try {
        await prisma.credentialUser.create({
          data: {
            username,
            passwordHash,
            fullName,
            telegramChatId: telegramId,
            isPremium: false,
          }
        });
        
        registrationStates.delete(telegramId);
        
        const appUrl = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
        const loginUrl = `${appUrl}/login`;
        
        const keyboard = new InlineKeyboard().webApp("🚀 Launch Exam Platform", loginUrl);
        
        const responseText = `🎉 *Registraashiniin Milkiin Xumurameera!*\n\n` +
          `Amanannaan qormaata keessan dabruuf kaffaltii 200 Birr raawwadhaa.\n\n` +
          `🔑 *Koodii Seensaa Keessan*:\n` +
          `• *Username*: \`${username}\`\n` +
          `• *Password*: \`${password}\`\n\n` +
          `⚠️ _Koodii kana hin dhabinaa ykn nama biraatti hin erginaa!_\n\n` +
          `📬 Erga kaffaltii raawwattanii booda, ragaa (screenshot) kaffaltii keessanii adminii Telegram (@Lamifd) irratti nuuf ergaa. Erga mirkanaa'ee booda akka kaffaltiin keessan fudhatamee fi akka koodiin keessan baname (Activate ta'e) isin beeksifna.\n\n` +
          `Ammaaf koodii kanaan seentanii shaakaluu ni dandeessu (Sagantaa Bilisaa)!`;
          
        return ctx.reply(responseText, {
          parse_mode: "Markdown",
          reply_markup: keyboard
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
    const text = `🤖 *Ace-Ifa-Boru Bot Commands*:\n\n` +
      `/start - Launch the Exam platform\n` +
      `/register - Register a custom login account (username/password)\n` +
      `/stats - View your quiz performance statistics\n` +
      `/premium - Learn about premium membership benefits\n\n` +
      `Launch the platform to start practice exams!`;
    await ctx.reply(text, { parse_mode: "Markdown" });
  });

  console.log("Telegram Bot client configured.");
} else {
  console.log("TELEGRAM_BOT_TOKEN not provided. Bot skipped.");
}
