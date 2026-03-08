import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/model/prisma';

const SALT_ROUNDS = 12;

const companiesToSeed = [
  {
    email: 'contact@techvision-dz.com',
    password: 'password123',
    companyName: 'TechVision Algeria',
    industry: 'Technology',
    location: 'Constantine, Algeria',
    website: 'https://techvision-dz.com',
    description: 'TechVision Algeria is a leading software development company specializing in web and mobile applications. We work with startups and enterprises to deliver innovative digital solutions across North Africa.',
    contactPerson: 'Karim Benali',
  },
  {
    email: 'hr@mediaplus-agency.com',
    password: 'password123',
    companyName: 'MediaPlus Agency',
    industry: 'Marketing & Communications',
    location: 'Algiers, Algeria',
    website: 'https://mediaplus-agency.com',
    description: 'MediaPlus Agency is a creative digital marketing agency helping brands grow their online presence. We offer social media management, content creation, and branding services.',
    contactPerson: 'Amina Djebbar',
  },
  {
    email: 'info@dataflow-solutions.com',
    password: 'password123',
    companyName: 'DataFlow Solutions',
    industry: 'Data & Analytics',
    location: 'Oran, Algeria',
    website: 'https://dataflow-solutions.com',
    description: 'DataFlow Solutions provides data analytics, business intelligence, and AI-powered insights to companies across Algeria. We help businesses make data-driven decisions.',
    contactPerson: 'Yacine Mebarki',
  },
  {
    email: 'contact@greentech-algerie.com',
    password: 'password123',
    companyName: 'GreenTech Algérie',
    industry: 'Clean Energy',
    location: 'Annaba, Algeria',
    website: 'https://greentech-algerie.com',
    description: 'GreenTech Algérie develops sustainable energy solutions including solar panel installations and energy management systems for residential and commercial clients.',
    contactPerson: 'Nadia Bouzid',
  },
  {
    email: 'jobs@designlab-dz.com',
    password: 'password123',
    companyName: 'DesignLab DZ',
    industry: 'Design & UX',
    location: 'Constantine, Algeria',
    website: 'https://designlab-dz.com',
    description: 'DesignLab DZ is a UI/UX design studio creating beautiful, user-centered digital experiences. We partner with tech companies to build products people love.',
    contactPerson: 'Rania Khelifi',
  },
  {
    email: 'recrutement@pharmaplus-dz.com',
    password: 'password123',
    companyName: 'PharmaPlus DZ',
    industry: 'Healthcare & Pharma',
    location: 'Sétif, Algeria',
    website: 'https://pharmaplus-dz.com',
    description: 'PharmaPlus DZ is a pharmaceutical distribution company committed to improving healthcare access across Algeria. We work with hospitals, clinics, and pharmacies.',
    contactPerson: 'Mohamed Saidi',
  },
];

async function main() {
  console.log('Seeding companies...\n');

  for (const company of companiesToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: company.email } });
    if (existing) {
      console.log(`  ⏭ ${company.companyName} already exists, skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(company.password, SALT_ROUNDS);

    await prisma.user.create({
      data: {
        email: company.email,
        passwordHash,
        role: 'company',
        company: {
          create: {
            companyName: company.companyName,
            industry: company.industry,
            location: company.location,
            website: company.website,
            description: company.description,
            contactPerson: company.contactPerson,
          },
        },
      },
    });

    console.log(`  ✅ ${company.companyName} created`);
  }

  console.log('\nDone! All companies seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
