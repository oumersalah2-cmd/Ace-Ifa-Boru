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
      subject: "Herrega",
      topic: "Joomootrii",
      questionText: "Utubaan alaabaa tokko gaaddidduu meetira 12 uuma. Kanuma waliin mukni dhihoo jiru, kan dheerinni isaa meetira 5 ta'e, gaaddidduu meetira 4 uuma. Dheerinni utubaa alaabaa kanaa meeqa?",
      options: ["20m", "15m", "9cm", "18m"],
      correctOptionIndex: 1,
      explanation: "Gaaddiddoo lamaan yeroo tokkotti waan uumamaniif, sadarkaan aduu wal-fakkaataadha, kanaafuu rog-sadeewwan lamaan wal-fakkaatu (similar triangles): dheerinni utubaa / gaaddidduu utubaa = dheerinni muka / gaaddidduu muka. h/12 = 5/4 → h = (5×12)/4 = 15m.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Piroobaabiliitii",
      questionText: "Daayiiwwan lama al tokko darbataman. Carraan ta'uumsaa ida'amni lakkoofsota fuulota isaanii ol-garagalan 9 ta'u meeqa?",
      options: ["1/4", "1/9", "1/6", "1/36"],
      correctOptionIndex: 1,
      explanation: "Daayii lama darbachuun haala hunda 36 (6×6) qaba. Ida'amni fuulota lamaanii 9 ta'uu kan danda'u: (3,6),(4,5),(5,4),(6,3) — haala 4. Carraan = 4/36 = 1/9.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Joomootrii",
      questionText: "Qabeen piriizimii hundeen isaa rog-sadee kofa sirrii ta'e, dheerinni rogoota isaa 3cm, 4cm, 5cm fi oleen isaa 12cm ta'e, piriizimichaa qabeen meeqa?",
      options: ["72cm³", "144cm³", "120cm³", "156cm³"],
      correctOptionIndex: 0,
      explanation: "Bal'inni hundee (rog-sadee kofa sirrii, cinaawwan 3 fi 4) = (1/2)×3×4 = 6cm². Qabeen piriizimii = bal'ina hundee × ol'aanaa = 6×12 = 72cm³.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Joomootrii",
      questionText: "Danaa keessatti O'n handhuura geengoo, S(<AOB)=70°. S(<OBA) meeqa?",
      options: ["20°", "35°", "55°", "70°"],
      correctOptionIndex: 2,
      explanation: "Rog-sadee OAB dhaabbataadha (OA=OB=raadiyeesa). Kofawwan hafan lamaan walqixa: (180−70)/2 = 55°.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Aljebraa",
      questionText: "(3xy + 2y)(−2x + 6xy) + 4xy + 6x²y = ?",
      options: ["12xy² + 18x²y²", "6xy² + 30x²y²", "18x²y² + 6xy²", "12xy² + 9x²y²"],
      correctOptionIndex: 0,
      explanation: "Facaasii (expand) gochuun: (3xy)(−2x)=−6x²y; (3xy)(6xy)=18x²y²; (2y)(−2x)=−4xy; (2y)(6xy)=12xy². Waliigala: −6x²y+18x²y²−4xy+12xy²+4xy+6x²y = 18x²y²+12xy², kunis 12xy²+18x²y² (filannoo A) waliin walqixa.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Aljebraa",
      questionText: "Furmaata hima walcaalmaa sararaawaa 6(2−x) ≤ 3x−12 kan ta'e?",
      options: ["x ≥ 24/9", "x ≤ 24/9", "x ≤ 8", "x ≥ 0"],
      correctOptionIndex: 0,
      explanation: "6(2−x) ≤ 3x−12 → 12−6x ≤ 3x−12 → 12+12 ≤ 3x+6x → 24 ≤ 9x → x ≥ 24/9.",
      isFree: false,
    },
    {
      subject: "Herrega",
      topic: "Joomootrii",
      questionText: "Piiraamidii reektaangulaawaa (rectangular pyramid) ilaalchisee kan soba ta'e kami?",
      options: ["Fuulota diriiraa 5 qaba", "Fuulota cinaachaa sadii qaba", "Varteeksota 5 qaba", "Qarqaroota 8 qaba"],
      correctOptionIndex: 1,
      explanation: "Piiraamidiin reektaangulaawaa (hundeen isaa reektaangilii) fuulota waliigalaa 5 qaba: hundee 1 + fuulota cinaachaa 4 (rog-sadee) — silaa 3 miti. Kanaafuu himni B ('fuulota cinaachaa sadii qaba') soba dha; sirriittis fuulota cinaachaa 4 qaba. Himootni A, C, fi D hundi dhugaa dha.",
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
