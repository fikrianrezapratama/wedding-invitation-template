import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.rSVP.deleteMany(),
    prisma.guestbookEntry.deleteMany(),
    prisma.guest.deleteMany()
  ]);

  console.log("Operational invitation data cleared: guests, RSVPs, and guestbook entries.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
