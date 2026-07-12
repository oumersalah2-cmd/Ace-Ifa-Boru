// scratch/check-questions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.question.findMany();
  console.log("Total Questions in DB:", questions.length);
  console.log("Questions list:", JSON.stringify(questions, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
