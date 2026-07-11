// backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding questions...");

  // Clear existing questions if any
  await prisma.question.deleteMany({});

  const questions = [
    // Afaan Oromoo Subject
    {
      subject: "Afaan Oromoo",
      topic: "Caasluga",
      questionText: "Jecha 'Boru' jedhu hiika maali qaba?",
      options: ["Kaleessa", "Harr'a", "Iftaan", "Kutaa guyyaa dhuftu (Tomorrow)"],
      correctOptionIndex: 3,
      explanation: "Afaan Oromoo keessatti, 'Boru' jechuun guyyaa harr'aatti aanu ykn Guyyaa dhuftu (Tomorrow) jechuudha.",
      isFree: true,
    },
    {
      subject: "Afaan Oromoo",
      topic: "Og-barruu",
      questionText: "Walaloowwan Afaan Oromoo keessatti 'Geerarsa' maaliif tajaajila?",
      options: ["Gootummaa fi seenaa faarsuuf", "Boo'icha qofaaf", "Tapha daa'immaniif", "Sirna gaa'elaaf qofa"],
      correctOptionIndex: 0,
      explanation: "'Geerarsi' sirna aadaa Oromoo keessatti gootummaa, gocha goototaa fi seenaa uummataa faarsuuf kan gargaaru dha.",
      isFree: true,
    },
    {
      subject: "Afaan Oromoo",
      topic: "Caasluga",
      questionText: "Jechoota armaan gadii keessaa kamtu maqaa (Noun) dha?",
      options: ["Adeeme", "Curee (Beautiful)", "Tulluu (Mountain)", "Diimaa"],
      correctOptionIndex: 2,
      explanation: "'Tulluu' jechuun maqaa iddoo ykn waan tokkooti. 'Adeeme' gochima, 'Curee' fi 'Diimaa' immoo ibsa maqooti.",
      isFree: false,
    },

    // Herrega Subject
    {
      subject: "Herrega",
      topic: "Dental Formula (Biology Math)",
      questionText: "Foormulaa ilkaan nama ga'eessaa kan agarsiisu kami?",
      options: ["3131/3121", "2123/2123", "0233/1233", "3232/3232"],
      correctOptionIndex: 1,
      explanation: "Foormulaan ilkaan nama ga'eessaa 2123/2123 dha. Kunis (Incisors: 2, Canines: 1, Premolars: 2, Molars: 3) gubbaa fi jalaa gama tokkoon kan ibsudha. Walumaagalaan ilkaan 32 ta'u.",
      isFree: true,
    },
    {
      subject: "Herrega",
      topic: "Aljebraa",
      questionText: "Gatii x herrega equation kanaa argadhu: 3x - 7 = 11?",
      options: ["4", "5", "6", "8"],
      correctOptionIndex: 2,
      explanation: "7 gara mirgaatti dabalamee: 3x = 18 ta'a. 3'n yoo qoodamu: x = 6 ta'a.",
      isFree: true,
    },
    {
      subject: "Herrega",
      topic: "Joomootrii",
      questionText: "Kofni keessoo rog-jaallaa (hexagon) maalitti qixxaa'a?",
      options: ["digrii 360", "digrii 540", "digrii 720", "digrii 900"],
      correctOptionIndex: 2,
      explanation: "Foormulaan (n - 2) * 180 dha. Rog-jaallaa (n=6) ta'eef: (6 - 2) * 180 = 4 * 180 = 720 digrii ta'a.",
      isFree: false,
    },

    // Saayinsii waligalaa Subject
    {
      subject: "Saayinsii waligalaa",
      topic: "Ji'oogiraafii",
      questionText: "Laggeen addunyaa keessaa inni kamtu dheeraa dha?",
      options: ["Laga Amaazoon", "Laga Naayilii (Abbaayyaa)", "Laga Yaangitsee", "Laga Misisiipii"],
      correctOptionIndex: 1,
      explanation: "Laga Naayilii (Abbaayyaa) kiilomeetira 6,650 dheerachuu isaatiin laggeen addunyaa keessaa hundarra dheeraa jedhamee fudhatama.",
      isFree: true,
    },
    {
      subject: "Saayinsii waligalaa",
      topic: "Hawaa",
      questionText: "Pilaaneetota sirna solar keessaa 'Red Planet' (Pilaaneetii Diimaa) jedhamuun kan beekamu kami?",
      options: ["Veenus", "Maarsii", "Juupitar", "Saturn"],
      correctOptionIndex: 1,
      explanation: "Maarsii sababa ayiren okosaayidii (salamtaa) fuula isaa irratti argamuun diimaa fakkaatee mul'ata, kanaanis Pilaaneetii Diimaa jedhama.",
      isFree: true,
    },
    {
      subject: "Saayinsii waligalaa",
      topic: "Seenaa",
      questionText: "Waraanni Adwaa yoom ta'e, yeroo sana Itoophiyaan Xaaliyaanii koloneeffattuu injifatte?",
      options: ["1889", "1896", "1935", "1941"],
      correctOptionIndex: 1,
      explanation: "Waraanni Adwaa Bitootessa 1, 1896 ta'ee gootota Itoophiyaaf injifannoo guddaa argamsiise.",
      isFree: false,
    },

    // English Subject
    {
      subject: "English",
      topic: "Spelling",
      questionText: "Choose the correct spelling:",
      options: ["Receive", "Recieve", "Receve", "Receave"],
      correctOptionIndex: 0,
      explanation: "The correct spelling is 'Receive'. Remember the rule: 'I before E except after C'.",
      isFree: true,
    },
    {
      subject: "English",
      topic: "Grammar",
      questionText: "Identify the noun in the sentence: 'The quick brown fox jumps over the lazy dog.'",
      options: ["jumps", "quick", "fox", "over"],
      correctOptionIndex: 2,
      explanation: "'fox' and 'dog' are nouns. In the options, 'fox' is the correct noun.",
      isFree: true,
    },
    {
      subject: "English",
      topic: "Punctuation",
      questionText: "Choose the sentence with the correct punctuation:",
      options: ["Its a beautiful day.", "It's a beautiful day.", "Its' a beautiful day.", "Itis a beautiful day."],
      correctOptionIndex: 1,
      explanation: "'It's' is a contraction of 'It is', which requires an apostrophe.",
      isFree: false,
    }
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        subject: q.subject,
        topic: q.topic,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        isFree: q.isFree
      }
    });
  }

  console.log("Successfully seeded questions!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
