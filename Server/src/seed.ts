import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './model/db';
import { users, universities, companies, students, internshipOffers, applications, savedOffers, reviews, notifications } from './model/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...\n');

  // ── Clean up (order matters for FK constraints) ──
  console.log('Cleaning existing data...');
  await db.delete(reviews);
  await db.delete(notifications);
  await db.delete(savedOffers);
  await db.delete(applications);
  await db.delete(internshipOffers);
  await db.delete(companies);
  // Delete company-role users only (preserve students, admins, universities)
  await db.delete(users).where(eq(users.role, 'company'));
  console.log('Cleaned all companies, offers, and related data.\n');

  // ── Ensure superadmin exists ──
  const [existingSuperadmin] = await db.select().from(users).where(eq(users.email, 'admin@stag.io'));
  if (!existingSuperadmin) {
    const superadminHash = await bcrypt.hash('admin123', 12);
    await db.insert(users).values({
      email: 'admin@stag.io',
      passwordHash: superadminHash,
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
    });
    console.log('Superadmin: admin@stag.io / admin123');
  }

  // ── Ensure admin exists ──
  const [existingAdmin] = await db.select().from(users).where(eq(users.email, 'admin-staff@stag.io'));
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash('admin123', 12);
    await db.insert(users).values({
      email: 'admin-staff@stag.io',
      passwordHash: adminHash,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Staff',
      isEmailVerified: true,
    });
    console.log('Admin: admin-staff@stag.io / admin123');
  }

  // ── Ensure university exists ──
  const [existingUni] = await db.select().from(users).where(eq(users.email, 'admin@univ-constantine2.dz'));
  if (!existingUni) {
    const uniHash = await bcrypt.hash('university123', 12);
    const [uniUser] = await db.insert(users).values({
      email: 'admin@univ-constantine2.dz',
      passwordHash: uniHash,
      role: 'university',
      firstName: 'University',
      lastName: 'Admin',
    }).returning();
    await db.insert(universities).values({
      userId: uniUser.id,
      universityName: 'Universite Constantine 2',
      domain: 'univ-constantine2.dz',
      website: 'https://univ-constantine2.dz',
      location: 'Constantine',
      description: 'Abdelhamid Mehri University - Constantine 2',
      isValidated: true,
    });
    console.log('University: admin@univ-constantine2.dz / university123');
  }

  // ── Ensure student exists ──
  const [existingStudent] = await db.select().from(users).where(eq(users.email, 'iyad@univ-constantine2.dz'));
  if (!existingStudent) {
    const studentHash = await bcrypt.hash('student123', 12);
    const [studentUser] = await db.insert(users).values({
      email: 'iyad@univ-constantine2.dz',
      passwordHash: studentHash,
      role: 'student',
      firstName: 'Iyad',
      lastName: 'Belala',
      university: 'univ-constantine2.dz',
      isEmailVerified: true,
    }).returning();
    await db.insert(students).values({
      userId: studentUser.id,
      department: 'Computer Science',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Next.js', 'Tailwind CSS'],
      bio: 'Full-stack developer passionate about building modern web applications.',
    });
    console.log('Student: iyad@univ-constantine2.dz / student123');
  }

  // ── Also keep the lovefling company user ──
  const [existingLove] = await db.select().from(users).where(eq(users.email, 'lovefling385@gmail.com'));
  // If it existed, it was deleted above. We'll recreate it below as one of the 15.

  // ── 15 Algerian Companies ──
  const companyHash = await bcrypt.hash('company123', 12);

  const algerianCompanies = [
    {
      email: 'hr@djezzy.dz',
      firstName: 'HR', lastName: 'Djezzy',
      name: 'Djezzy',
      industry: 'Telecommunications',
      website: 'https://www.djezzy.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Djezzy_logo.svg/1200px-Djezzy_logo.svg.png',
      location: 'Algiers',
      contactPerson: 'Karim Benali',
      description: 'Djezzy is one of Algeria\'s leading mobile network operators, part of the VEON group. Providing mobile voice, data, and digital services to millions of Algerians since 2002.',
    },
    {
      email: 'hr@mobilis.dz',
      firstName: 'HR', lastName: 'Mobilis',
      name: 'Mobilis',
      industry: 'Telecommunications',
      website: 'https://www.mobilis.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/1/12/Mobilis_Alg%C3%A9rie_logo_2023.png',
      location: 'Algiers',
      contactPerson: 'Nadia Cherifi',
      description: 'ATM Mobilis is Algeria\'s first mobile phone operator and a subsidiary of Algerie Telecom. Offering innovative telecom solutions and 4G/5G services across the nation.',
    },
    {
      email: 'hr@ooredoo.dz',
      firstName: 'HR', lastName: 'Ooredoo',
      name: 'Ooredoo Algeria',
      industry: 'Telecommunications',
      website: 'https://www.ooredoo.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Ooredoo_logo.svg/1200px-Ooredoo_logo.svg.png',
      location: 'Algiers',
      contactPerson: 'Yacine Hamdi',
      description: 'Ooredoo Algeria (formerly Nedjma) is a major telecom operator providing mobile, fixed, and internet services. Part of the Ooredoo Group, serving millions nationwide.',
    },
    {
      email: 'hr@sonatrach.dz',
      firstName: 'HR', lastName: 'Sonatrach',
      name: 'Sonatrach',
      industry: 'Oil & Gas',
      website: 'https://sonatrach.com',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Sonatrach_svg_logo.svg/1200px-Sonatrach_svg_logo.svg.png',
      location: 'Algiers',
      contactPerson: 'Mohamed Kaci',
      description: 'Sonatrach is Algeria\'s state-owned oil and gas company, and one of the largest energy companies in Africa. It operates across the entire hydrocarbon value chain from exploration to commercialization.',
    },
    {
      email: 'hr@condor.dz',
      firstName: 'HR', lastName: 'Condor',
      name: 'Condor Electronics',
      industry: 'Electronics & Technology',
      website: 'https://condor.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/b/b2/Condor_Group_Logo.png',
      location: 'Bordj Bou Arreridj',
      contactPerson: 'Abdelmalek Haddad',
      description: 'Condor Electronics is Algeria\'s leading electronics manufacturer, producing smartphones, TVs, home appliances, and computing devices. A flagship of Algerian industry and innovation.',
    },
    {
      email: 'hr@cevital.dz',
      firstName: 'HR', lastName: 'Cevital',
      name: 'Cevital',
      industry: 'Food & Manufacturing',
      website: 'https://www.cevital.com',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/9/99/Cevital_Logo.png/800px-Cevital_Logo.png',
      location: 'Bejaia',
      contactPerson: 'Samir Rebrab',
      description: 'Cevital is Algeria\'s largest private conglomerate with interests in food processing, steel, glass, and electronics. One of Africa\'s largest sugar refineries and a major economic player.',
    },
    {
      email: 'hr@algerietelecom.dz',
      firstName: 'HR', lastName: 'AT',
      name: 'Algerie Telecom',
      industry: 'Telecommunications & IT',
      website: 'https://www.algerietelecom.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Alg%C3%A9rie_T%C3%A9l%C3%A9com_Logo.svg/1200px-Alg%C3%A9rie_T%C3%A9l%C3%A9com_Logo.svg.png',
      location: 'Algiers',
      contactPerson: 'Rachid Benmessaoud',
      description: 'Algerie Telecom is the national telecommunications operator providing fixed-line telephony, ADSL, fiber optic internet, and digital services across Algeria.',
    },
    {
      email: 'lovefling385@gmail.com',
      firstName: 'HR', lastName: 'Yassir',
      name: 'Yassir',
      industry: 'Technology & Mobility',
      website: 'https://yassir.com',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Yassir_logo.png',
      location: 'Algiers',
      contactPerson: 'Noureddine Tayebi',
      description: 'Yassir is a leading Algerian super app offering ride-hailing, food delivery, and financial services. A tech unicorn expanding across Africa and the Middle East with cutting-edge technology.',
    },
    {
      email: 'hr@biopharm.dz',
      firstName: 'HR', lastName: 'Biopharm',
      name: 'Biopharm',
      industry: 'Pharmaceutical',
      website: 'https://www.biopharm.dz',
      logoUrl: 'https://www.biopharm.dz/wp-content/uploads/2023/02/logo-biopharm.png',
      location: 'Algiers',
      contactPerson: 'Amina Bekhouche',
      description: 'Biopharm Group is Algeria\'s leading pharmaceutical company, specializing in the production and distribution of medications. A pioneer in Algerian pharmaceutical manufacturing.',
    },
    {
      email: 'hr@cosider.dz',
      firstName: 'HR', lastName: 'Cosider',
      name: 'Cosider Group',
      industry: 'Construction & Infrastructure',
      website: 'https://www.cosider.com.dz',
      logoUrl: 'https://www.cosider.com.dz/images/logo.png',
      location: 'Algiers',
      contactPerson: 'Omar Bensalem',
      description: 'Cosider is Algeria\'s largest construction and public works group, involved in major infrastructure projects including roads, dams, tunnels, and urban development across Algeria.',
    },
    {
      email: 'hr@alliance-assurances.dz',
      firstName: 'HR', lastName: 'Alliance',
      name: 'Alliance Assurances',
      industry: 'Insurance & Finance',
      website: 'https://www.allianceassurances.com.dz',
      logoUrl: 'https://www.allianceassurances.com.dz/wp-content/uploads/2023/01/alliance-logo.png',
      location: 'Algiers',
      contactPerson: 'Hassen Khelifati',
      description: 'Alliance Assurances is a leading private insurance company in Algeria, offering a wide range of insurance products including auto, health, property, and professional liability coverage.',
    },
    {
      email: 'hr@naftal.dz',
      firstName: 'HR', lastName: 'Naftal',
      name: 'Naftal',
      industry: 'Energy & Petroleum',
      website: 'https://www.naftal.dz',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/4/40/Logo_Naftal.svg/1200px-Logo_Naftal.svg.png',
      location: 'Algiers',
      contactPerson: 'Djamel Khelifa',
      description: 'Naftal is Algeria\'s national petroleum products distribution company, a subsidiary of Sonatrach. Operating a vast network of fuel stations and distribution centers across the country.',
    },
    {
      email: 'hr@elsecom.com',
      firstName: 'HR', lastName: 'Elsecom',
      name: 'Elsecom Group',
      industry: 'Automotive & Distribution',
      website: 'https://www.elsecom.com',
      logoUrl: 'https://www.elsecomgroupe.com/assets/images/logo-elsecom.png',
      location: 'Algiers',
      contactPerson: 'Mahdi Aoudia',
      description: 'Elsecom Group is a major Algerian automotive distributor representing Volkswagen, Audi, SEAT, Skoda, and Porsche in Algeria. Also active in real estate and industrial services.',
    },
    {
      email: 'hr@starlight.dz',
      firstName: 'HR', lastName: 'Starlight',
      name: 'Starlight Media',
      industry: 'Media & Digital',
      website: 'https://starlight.dz',
      logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop&auto=format',
      location: 'Oran',
      contactPerson: 'Lina Bouazza',
      description: 'Starlight Media is a creative digital agency based in Oran, specializing in content production, social media management, digital marketing, and brand strategy for Algerian businesses.',
    },
    {
      email: 'hr@techvalley.dz',
      firstName: 'HR', lastName: 'TechValley',
      name: 'TechValley DZ',
      industry: 'Software & IT Services',
      website: 'https://techvalley.dz',
      logoUrl: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=200&h=200&fit=crop&auto=format',
      location: 'Constantine',
      contactPerson: 'Adel Mekki',
      description: 'TechValley DZ is a software development and IT consulting company based in Constantine. Specializing in web applications, mobile apps, cloud solutions, and AI-powered products for African markets.',
    },
  ];

  // Banner images for offers (high-quality tech/business banners)
  const bannerImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&h=400&fit=crop&auto=format',
  ];

  // Create all 15 companies
  const companyRecords: { id: string; name: string }[] = [];
  let bannerIdx = 0;

  for (const c of algerianCompanies) {
    const pw = c.email === 'lovefling385@gmail.com' ? 'iyad2005' : 'company123';
    const hash = await bcrypt.hash(pw, 12);

    const [compUser] = await db.insert(users).values({
      email: c.email,
      passwordHash: hash,
      role: 'company',
      firstName: c.firstName,
      lastName: c.lastName,
      isEmailVerified: true,
    }).returning();

    const [comp] = await db.insert(companies).values({
      userId: compUser.id,
      companyName: c.name,
      industry: c.industry,
      website: c.website,
      logoUrl: null,
      location: c.location,
      contactPerson: c.contactPerson,
      description: c.description,
      isValidated: true,
    }).returning();

    companyRecords.push({ id: comp.id, name: c.name });
    console.log(`Company: ${c.name} (${c.email} / ${pw})`);
  }

  // ── Internship Offers (2-3 per company) ──
  const allOffers = [
    // Djezzy
    { idx: 0, title: 'Network Engineering Intern', desc: 'Join Djezzy\'s network team to help optimize 4G/5G infrastructure across Algeria. Work with cutting-edge telecom equipment and network monitoring tools.', req: 'Networking, TCP/IP, Linux, Cisco, Python, Telecom fundamentals', dur: '6 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 0, title: 'Data Analyst Intern', desc: 'Analyze customer behavior and network usage patterns to drive business decisions. Build dashboards and reports using modern data tools.', req: 'SQL, Python, Power BI, Excel, Statistics, Data visualization', dur: '3 months', loc: 'Algiers', type: 'hybrid' as const },

    // Mobilis
    { idx: 1, title: 'Mobile App Developer Intern', desc: 'Develop and maintain Mobilis mobile applications for Android and iOS platforms. Implement new features and optimize app performance.', req: 'Flutter, Dart, REST APIs, Git, Firebase, Mobile UI/UX', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 1, title: 'Cybersecurity Intern', desc: 'Assist the security team in monitoring threats, conducting vulnerability assessments, and implementing security best practices for telecom infrastructure.', req: 'Cybersecurity, Network security, Linux, Firewalls, SIEM, Penetration testing', dur: '6 months', loc: 'Algiers', type: 'onsite' as const },

    // Ooredoo
    { idx: 2, title: 'Cloud Infrastructure Intern', desc: 'Help migrate services to cloud infrastructure and implement DevOps practices. Work with containerization and orchestration technologies.', req: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python', dur: '4 months', loc: 'Algiers', type: 'hybrid' as const },
    { idx: 2, title: 'Digital Marketing Intern', desc: 'Support digital campaigns, manage social media presence, and analyze marketing performance metrics for Ooredoo Algeria.', req: 'Social Media Marketing, Google Analytics, Content creation, SEO, Copywriting', dur: '3 months', loc: 'Algiers', type: 'hybrid' as const },

    // Sonatrach
    { idx: 3, title: 'Petroleum Engineering Intern', desc: 'Gain hands-on experience in upstream oil & gas operations including drilling, reservoir management, and production optimization at Sonatrach\'s facilities.', req: 'Petroleum Engineering, Geology, AutoCAD, MATLAB, Field operations, HSE', dur: '6 months', loc: 'Hassi Messaoud', type: 'onsite' as const },
    { idx: 3, title: 'IT Systems Administrator Intern', desc: 'Support Sonatrach\'s enterprise IT infrastructure, manage servers, and assist in implementing digital transformation projects.', req: 'Windows Server, Active Directory, Networking, VMware, PowerShell, ITIL', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 3, title: 'HSE Intern', desc: 'Assist the Health, Safety & Environment department in conducting safety audits, risk assessments, and environmental monitoring across operational sites.', req: 'HSE Management, Risk assessment, Environmental science, ISO 14001, Report writing', dur: '3 months', loc: 'Algiers', type: 'onsite' as const },

    // Condor
    { idx: 4, title: 'Embedded Systems Intern', desc: 'Design and develop firmware for Condor\'s electronic products. Work with microcontrollers, sensors, and IoT devices in our R&D lab.', req: 'C/C++, Embedded systems, Arduino, STM32, PCB design, IoT', dur: '6 months', loc: 'Bordj Bou Arreridj', type: 'onsite' as const },
    { idx: 4, title: 'Quality Assurance Intern', desc: 'Test and validate electronic products, ensure manufacturing quality standards, and contribute to product improvement processes.', req: 'Quality management, Testing methodologies, ISO 9001, Technical documentation, Electronics basics', dur: '3 months', loc: 'Bordj Bou Arreridj', type: 'onsite' as const },

    // Cevital
    { idx: 5, title: 'Supply Chain & Logistics Intern', desc: 'Optimize supply chain operations at one of Africa\'s largest food processing facilities. Work on inventory management and logistics planning.', req: 'Supply chain management, SAP, Excel, Logistics, Data analysis, Operations management', dur: '4 months', loc: 'Bejaia', type: 'onsite' as const },
    { idx: 5, title: 'Industrial Engineering Intern', desc: 'Improve manufacturing processes, optimize production lines, and implement lean manufacturing principles in Cevital\'s factories.', req: 'Industrial engineering, Lean manufacturing, AutoCAD, Process optimization, Quality control', dur: '6 months', loc: 'Bejaia', type: 'onsite' as const },

    // Algerie Telecom
    { idx: 6, title: 'Full-Stack Developer Intern', desc: 'Build internal web applications and customer-facing portals for Algerie Telecom. Work with modern frameworks and RESTful APIs.', req: 'React, Node.js, TypeScript, PostgreSQL, REST APIs, Git', dur: '4 months', loc: 'Algiers', type: 'hybrid' as const },
    { idx: 6, title: 'Fiber Optic Network Intern', desc: 'Assist in the deployment and maintenance of fiber optic networks across Algeria. Learn FTTH technology and network design principles.', req: 'Fiber optics, Telecom engineering, Network design, GIS, AutoCAD', dur: '6 months', loc: 'Algiers', type: 'onsite' as const },

    // Yassir
    { idx: 7, title: 'Backend Engineer Intern', desc: 'Build scalable microservices for Yassir\'s super app platform. Work with high-traffic systems serving millions of users across Africa.', req: 'Go, Python, PostgreSQL, Redis, gRPC, Docker, Microservices', dur: '6 months', loc: 'Algiers', type: 'hybrid' as const },
    { idx: 7, title: 'Frontend Engineer Intern', desc: 'Develop and enhance Yassir\'s web dashboard and admin tools. Create responsive, performant interfaces using modern React patterns.', req: 'React, TypeScript, Next.js, Tailwind CSS, REST APIs, Git', dur: '4 months', loc: 'Algiers', type: 'remote' as const },
    { idx: 7, title: 'Machine Learning Intern', desc: 'Work on ML models for ride-hailing demand prediction, route optimization, and fraud detection. Join a world-class AI team.', req: 'Python, TensorFlow, PyTorch, Scikit-learn, SQL, Statistics, Machine Learning', dur: '6 months', loc: 'Algiers', type: 'hybrid' as const },

    // Biopharm
    { idx: 8, title: 'Pharmaceutical Research Intern', desc: 'Assist in drug formulation research and quality control processes at Biopharm\'s state-of-the-art laboratories.', req: 'Pharmaceutical sciences, Chemistry, Lab techniques, GMP, HPLC, Documentation', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 8, title: 'Regulatory Affairs Intern', desc: 'Support the regulatory affairs team in preparing drug registration dossiers and ensuring compliance with pharmaceutical regulations.', req: 'Pharmacy, Regulatory affairs, Documentation, ICH guidelines, Medical writing', dur: '3 months', loc: 'Algiers', type: 'onsite' as const },

    // Cosider
    { idx: 9, title: 'Civil Engineering Intern', desc: 'Work on major infrastructure projects including roads, bridges, and buildings. Gain hands-on experience in construction management and site supervision.', req: 'Civil engineering, AutoCAD, Revit, Structural analysis, Construction management, Surveying', dur: '6 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 9, title: 'BIM Coordinator Intern', desc: 'Implement Building Information Modeling workflows on Cosider projects. Create 3D models and coordinate between engineering disciplines.', req: 'BIM, Revit, Navisworks, AutoCAD, 3D modeling, Technical drawing', dur: '4 months', loc: 'Algiers', type: 'hybrid' as const },

    // Alliance Assurances
    { idx: 10, title: 'Actuarial Intern', desc: 'Analyze insurance risk data, build pricing models, and support the actuarial team in product development and reserve calculations.', req: 'Mathematics, Statistics, R, Python, Excel, Actuarial science, Financial modeling', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 10, title: 'Business Intelligence Intern', desc: 'Design dashboards and reports to help management make data-driven decisions. Extract insights from insurance operations data.', req: 'Power BI, SQL, Python, Data analysis, Excel, Business intelligence', dur: '3 months', loc: 'Algiers', type: 'hybrid' as const },

    // Naftal
    { idx: 11, title: 'Mechanical Engineering Intern', desc: 'Maintain and optimize fuel distribution equipment and pipeline systems. Work on preventive maintenance planning and technical projects.', req: 'Mechanical engineering, CAD, Maintenance planning, Hydraulics, Technical documentation', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 11, title: 'Environmental Engineering Intern', desc: 'Support environmental compliance programs, conduct site assessments, and help implement green initiatives across Naftal\'s distribution network.', req: 'Environmental engineering, Environmental auditing, ISO 14001, Waste management, Reporting', dur: '3 months', loc: 'Algiers', type: 'onsite' as const },

    // Elsecom
    { idx: 12, title: 'Automotive Sales Intern', desc: 'Assist the commercial team in managing VW/Audi dealership operations. Learn automotive sales, CRM management, and customer relationship building.', req: 'Sales, CRM, Communication, Customer service, Automotive knowledge, Marketing', dur: '3 months', loc: 'Algiers', type: 'onsite' as const },
    { idx: 12, title: 'Finance & Accounting Intern', desc: 'Support financial reporting, budgeting, and accounting operations for Elsecom Group\'s automotive distribution business.', req: 'Accounting, Finance, SAP, Excel, Financial reporting, Budgeting', dur: '4 months', loc: 'Algiers', type: 'onsite' as const },

    // Starlight Media
    { idx: 13, title: 'Graphic Design Intern', desc: 'Create visual content for brands, design social media assets, and work on branding projects for diverse Algerian clients.', req: 'Adobe Photoshop, Illustrator, Figma, Graphic design, Typography, Branding', dur: '3 months', loc: 'Oran', type: 'hybrid' as const },
    { idx: 13, title: 'Video Production Intern', desc: 'Shoot, edit, and produce video content for digital campaigns. Work with professional equipment and post-production software.', req: 'Adobe Premiere, After Effects, Video editing, Cinematography, Storytelling, Social media', dur: '3 months', loc: 'Oran', type: 'onsite' as const },

    // TechValley DZ
    { idx: 14, title: 'Full-Stack Web Developer Intern', desc: 'Build web applications using modern JavaScript frameworks. Work in an agile team on products for the African market.', req: 'React, Next.js, Node.js, TypeScript, MongoDB, Tailwind CSS, Git', dur: '4 months', loc: 'Constantine', type: 'hybrid' as const },
    { idx: 14, title: 'AI/ML Engineer Intern', desc: 'Develop AI-powered features for our products including NLP, computer vision, and predictive analytics. Research and prototype innovative solutions.', req: 'Python, TensorFlow, PyTorch, NLP, Computer Vision, Docker, FastAPI', dur: '6 months', loc: 'Constantine', type: 'remote' as const },
    { idx: 14, title: 'UI/UX Design Intern', desc: 'Design intuitive user interfaces and conduct user research for our web and mobile products. Create prototypes and design systems.', req: 'Figma, UI/UX Design, User research, Prototyping, Design systems, Adobe XD', dur: '3 months', loc: 'Constantine', type: 'hybrid' as const },
  ];

  const offerValues = allOffers.map((o) => ({
    companyId: companyRecords[o.idx].id,
    title: o.title,
    description: o.desc,
    requirements: o.req,
    duration: o.dur,
    location: o.loc,
    type: o.type,
    status: 'active' as const,
    bannerUrl: bannerImages[bannerIdx++ % bannerImages.length],
  }));

  await db.insert(internshipOffers).values(offerValues);
  console.log(`\n${offerValues.length} internship offers created across ${companyRecords.length} companies.`);

  console.log('\nSeed complete! Test accounts:\n');
  console.log('  Superadmin:  admin@stag.io / admin123');
  console.log('  Admin:       admin-staff@stag.io / admin123');
  console.log('  University:  admin@univ-constantine2.dz / university123');
  console.log('  Student:     iyad@univ-constantine2.dz / student123');
  console.log('  Yassir:      lovefling385@gmail.com / iyad2005');
  console.log('  Others:      <email> / company123');
  console.log('');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
