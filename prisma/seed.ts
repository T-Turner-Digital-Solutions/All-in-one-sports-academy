import { PrismaClient, Role, CompensationType, PackageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding All In One Sports Academy...");

  // ---- Location -----------------------------------------------------------
  const location = await prisma.location.upsert({
    where: { id: "loc-main" },
    update: {},
    create: {
      id: "loc-main",
      name: "AIO Sports Academy — Main Training Center",
      address: "1200 Athletic Way",
      city: "Charlotte",
      state: "NC",
      zip: "28216",
      hours: "Mon–Sat, 8:00 AM – 8:00 PM",
      instructions: "Enter through the main gym entrance and check in at the front desk.",
      isActive: true,
    },
  });

  // ---- Sports (admin-manageable; these are just initial examples) --------
  const sportDefs = [
    { name: "Football", slug: "football", iconKey: "football", imageUrl: "/sports/football.png" },
    { name: "Basketball", slug: "basketball", iconKey: "basketball", imageUrl: "/sports/basketball.png" },
    { name: "Baseball", slug: "baseball", iconKey: "baseball", imageUrl: "/sports/baseball.png" },
    { name: "Softball", slug: "softball", iconKey: "softball", imageUrl: "/sports/softball.png" },
    { name: "Soccer", slug: "soccer", iconKey: "soccer", imageUrl: "/sports/soccer.png" },
    { name: "Speed & Agility", slug: "speed-agility", iconKey: "speed", imageUrl: "/sports/speed-agility.png" },
    {
      name: "Strength & Conditioning",
      slug: "strength-conditioning",
      iconKey: "strength",
      imageUrl: "/sports/strength-conditioning.png",
    },
    {
      name: "Athletic Development",
      slug: "athletic-development",
      iconKey: "development",
      imageUrl: "/sports/athletic-development.png",
    },
    {
      name: "Position-Specific Training",
      slug: "position-specific-training",
      iconKey: "target",
      imageUrl: "/sports/position-specific-training.png",
    },
  ];

  const sports = [];
  for (const [i, s] of sportDefs.entries()) {
    const sport = await prisma.sport.upsert({
      where: { slug: s.slug },
      update: { imageUrl: s.imageUrl },
      create: {
        name: s.name,
        slug: s.slug,
        iconKey: s.iconKey,
        imageUrl: s.imageUrl,
        description: `Professional ${s.name.toLowerCase()} coaching for youth and competitive athletes.`,
        isPublished: true,
        sortOrder: i,
      },
    });
    sports.push(sport);
    await prisma.locationSport.upsert({
      where: { locationId_sportId: { locationId: location.id, sportId: sport.id } },
      update: {},
      create: { locationId: location.id, sportId: sport.id },
    });
  }

  // ---- Training programs ---------------------------------------------------
  const trainingProgramDefs = [
    { name: "Private 1-on-1 Training", description: "Individualized coaching session.", sortOrder: 0 },
    { name: "Small Group Training", description: "Train alongside 2-4 athletes.", sortOrder: 1 },
    { name: "Position-Specific Skills", description: "Targeted work for a specific position.", sortOrder: 2 },
    { name: "Speed & Agility Session", description: "Movement mechanics, acceleration, change of direction.", sortOrder: 3 },
    { name: "Strength & Conditioning Session", description: "Athletic strength base and conditioning.", sortOrder: 4 },
  ];
  for (const p of trainingProgramDefs) {
    await prisma.trainingProgram.upsert({
      where: { name: p.name },
      update: { description: p.description, sortOrder: p.sortOrder },
      create: p,
    });
  }

  // ---- Owner / Super Admin: Justin Woodall --------------------------------
  const ownerPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const justinUser = await prisma.user.upsert({
    where: { email: "justin@allinonesportsacademy.com" },
    update: {},
    create: {
      email: "justin@allinonesportsacademy.com",
      passwordHash: ownerPasswordHash,
      role: Role.SUPER_ADMIN,
      firstName: "Justin",
      lastName: "Woodall",
      phone: "555-010-0100",
      isActive: true,
    },
  });

  const justinCoach = await prisma.coach.upsert({
    where: { userId: justinUser.id },
    update: {},
    create: {
      userId: justinUser.id,
      bio: "Founder and lead trainer at All In One Sports Academy. Multi-sport background with a focus on athletic development and position-specific skills.",
      status: "ACTIVE",
      isPubliclyListed: true,
      compensationType: CompensationType.CUSTOM,
      compensationNotes: "Owner — compensation is organizational profit, not a per-session split.",
    },
  });

  for (const sport of sports) {
    await prisma.coachSport.upsert({
      where: { coachId_sportId: { coachId: justinCoach.id, sportId: sport.id } },
      update: {},
      create: { coachId: justinCoach.id, sportId: sport.id },
    });
  }
  await prisma.coachLocation.upsert({
    where: { coachId_locationId: { coachId: justinCoach.id, locationId: location.id } },
    update: {},
    create: { coachId: justinCoach.id, locationId: location.id },
  });

  // recurring weekly availability for Justin (idempotent: clear and re-create so
  // reseeding never duplicates availability windows)
  await prisma.coachAvailability.deleteMany({ where: { coachId: justinCoach.id, type: "RECURRING" } });
  const availabilitySlots: Array<{ dayOfWeek: number; startTime: string; endTime: string }> = [
    { dayOfWeek: 1, startTime: "16:00", endTime: "20:00" },
    { dayOfWeek: 3, startTime: "15:00", endTime: "19:00" },
    { dayOfWeek: 6, startTime: "08:00", endTime: "14:00" },
  ];
  for (const slot of availabilitySlots) {
    await prisma.coachAvailability.create({
      data: {
        coachId: justinCoach.id,
        type: "RECURRING",
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        locationId: location.id,
      },
    });
  }

  // ---- A second demo coach so "other qualified coaches" logic is real ----
  const demoCoachPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const demoCoachUser = await prisma.user.upsert({
    where: { email: "coach.demo@allinonesportsacademy.com" },
    update: {},
    create: {
      email: "coach.demo@allinonesportsacademy.com",
      passwordHash: demoCoachPasswordHash,
      role: Role.COACH,
      firstName: "Alex",
      lastName: "Rivera",
      phone: "555-010-0101",
      isActive: true,
    },
  });
  const demoCoach = await prisma.coach.upsert({
    where: { userId: demoCoachUser.id },
    update: {},
    create: {
      userId: demoCoachUser.id,
      bio: "Speed & agility and basketball skills specialist.",
      status: "ACTIVE",
      isPubliclyListed: true,
      compensationType: CompensationType.PERCENTAGE,
      percentageBps: 6000,
    },
  });
  const basketball = sports.find((s) => s.slug === "basketball")!;
  const speedAgility = sports.find((s) => s.slug === "speed-agility")!;
  for (const sport of [basketball, speedAgility]) {
    await prisma.coachSport.upsert({
      where: { coachId_sportId: { coachId: demoCoach.id, sportId: sport.id } },
      update: {},
      create: { coachId: demoCoach.id, sportId: sport.id },
    });
  }
  await prisma.coachLocation.upsert({
    where: { coachId_locationId: { coachId: demoCoach.id, locationId: location.id } },
    update: {},
    create: { coachId: demoCoach.id, locationId: location.id },
  });
  await prisma.coachAvailability.deleteMany({ where: { coachId: demoCoach.id, type: "RECURRING" } });
  await prisma.coachAvailability.create({
    data: {
      coachId: demoCoach.id,
      type: "RECURRING",
      dayOfWeek: 2,
      startTime: "16:00",
      endTime: "20:00",
      locationId: location.id,
    },
  });

  // ---- Packages: confirmed pricing only for the single session -----------
  await prisma.package.upsert({
    where: { id: "pkg-single-session" },
    update: {},
    create: {
      id: "pkg-single-session",
      name: "Single Private Training Session",
      type: PackageType.SINGLE_SESSION,
      description: "One 60-minute private training session with your selected coach.",
      sessionCount: 1,
      priceCents: 8000,
      isPublished: true,
      isActive: true,
    },
  });

  // ---- Demo client / household / athlete ----------------------------------
  const clientPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const household = await prisma.household.upsert({
    where: { id: "hh-demo" },
    update: {},
    create: { id: "hh-demo", name: "The Thompson Family" },
  });
  await prisma.user.upsert({
    where: { email: "tabithathompson2517@gmail.com" },
    update: {},
    create: {
      email: "tabithathompson2517@gmail.com",
      passwordHash: clientPasswordHash,
      role: Role.CLIENT,
      firstName: "Tabitha",
      lastName: "Thompson",
      householdId: household.id,
      isActive: true,
    },
  });
  await prisma.athlete.upsert({
    where: { id: "ath-demo" },
    update: {},
    create: {
      id: "ath-demo",
      householdId: household.id,
      firstName: "Jordan",
      lastName: "Thompson",
      dob: new Date("2012-05-14"),
      school: "Charlotte Middle School",
      primarySportId: basketball.id,
      experienceLevel: "INTERMEDIATE",
      photoVideoRelease: true,
    },
  });

  // ---- Settings defaults ---------------------------------------------------
  await prisma.setting.upsert({
    where: { key: "single_session_price_cents" },
    update: { value: 8000 },
    create: { key: "single_session_price_cents", value: 8000 },
  });
  await prisma.setting.upsert({
    where: { key: "reschedule_window_hours" },
    update: { value: 72 },
    create: { key: "reschedule_window_hours", value: 72 },
  });
  await prisma.setting.upsert({
    where: { key: "waitlist_offer_minutes" },
    update: { value: 15 },
    create: { key: "waitlist_offer_minutes", value: 15 },
  });

  console.log("Seed complete.");
  console.log("Owner login: justin@allinonesportsacademy.com / ChangeMe123!");
  console.log("Demo coach login: coach.demo@allinonesportsacademy.com / ChangeMe123!");
  console.log("Demo client login: tabithathompson2517@gmail.com / ChangeMe123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
