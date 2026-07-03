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
      topic: "Grammar",
      questionText: "Jecha 'Boru' jedhu hiika maali qaba?",
      options: ["Kaleessa", "Harr'a", "Iftaan", "Kutaa guyyaa dhuftu (Tomorrow)"],
      correctOptionIndex: 3,
      explanation: "Afaan Oromoo keessatti, 'Boru' jechuun guyyaa harr'aatti aanu ykn Guyyaa dhuftu (Tomorrow) jechuudha.",
      isFree: true,
    },
    {
      subject: "Afaan Oromoo",
      topic: "Literature",
      questionText: "Walaloowwan Afaan Oromoo keessatti 'Geerarsa' maaliif tajaajila?",
      options: ["Gootummaa fi seenaa faarsuuf", "Boo'icha qofaaf", "Tapha daa'immaniif", "Sirna gaa'elaaf qofa"],
      correctOptionIndex: 0,
      explanation: "'Geerarsi' sirna aadaa Oromoo keessatti gootummaa, gocha goototaa fi seenaa uummataa faarsuuf kan gargaaru dha.",
      isFree: true,
    },
    {
      subject: "Afaan Oromoo",
      topic: "Grammar",
      questionText: "Jechoota armaan gadii keessaa kamtu maqaa (Noun) dha?",
      options: ["Adeeme", "Curee (Beautiful)", "Tulluu (Mountain)", "Diimaa"],
      correctOptionIndex: 2,
      explanation: "'Tulluu' jechuun maqaa iddoo ykn waan tokkooti. 'Adeeme' gochima, 'Curee' fi 'Diimaa' immoo ibsa maqooti.",
      isFree: false, // Premium Question!
    },

    // Mathematics Subject
    {
      subject: "Mathematics",
      topic: "Algebra",
      questionText: "What is the value of x in the equation: 3x - 7 = 11?",
      options: ["4", "5", "6", "8"],
      correctOptionIndex: 2,
      explanation: "Add 7 to both sides: 3x = 18. Divide by 3: x = 6.",
      isFree: true,
    },
    {
      subject: "Mathematics",
      topic: "Geometry",
      questionText: "What is the sum of interior angles of a hexagon?",
      options: ["360 degrees", "540 degrees", "720 degrees", "900 degrees"],
      correctOptionIndex: 2,
      explanation: "The formula is (n - 2) * 180. For a hexagon (n=6): (6 - 2) * 180 = 4 * 180 = 720 degrees.",
      isFree: false, // Premium Question!
    },
    {
      subject: "Mathematics",
      topic: "Probability",
      questionText: "If you roll a fair six-sided die, what is the probability of getting a prime number?",
      options: ["1/6", "1/3", "1/2", "2/3"],
      correctOptionIndex: 2,
      explanation: "The prime numbers on a die are 2, 3, and 5. There are 3 prime numbers out of 6 possible outcomes, so 3/6 = 1/2.",
      isFree: false, // Premium Question!
    },

    // General Knowledge Subject
    {
      subject: "General Knowledge",
      topic: "Geography",
      questionText: "Which is the longest river in the world?",
      options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
      correctOptionIndex: 1,
      explanation: "The Nile River is traditionally considered the longest river in the world, stretching 6,650 kilometers.",
      isFree: true,
    },
    {
      subject: "General Knowledge",
      topic: "Space",
      questionText: "Which planet in our solar system is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctOptionIndex: 1,
      explanation: "Mars is known as the Red Planet due to iron oxide (rust) on its surface, giving it a reddish appearance.",
      isFree: true,
    },
    {
      subject: "General Knowledge",
      topic: "History",
      questionText: "In which year did the Battle of Adwa take place, where Ethiopia defeated colonial Italy?",
      options: ["1889", "1896", "1935", "1941"],
      correctOptionIndex: 1,
      explanation: "The Battle of Adwa took place on March 1, 1896, resulting in a decisive victory for the Ethiopian forces.",
      isFree: false, // Premium Question!
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
