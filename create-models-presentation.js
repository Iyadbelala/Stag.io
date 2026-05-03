const PptxGenJS = require("pptxgenjs");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_16x9";
pres.title = "Stag.io Data Models";
pres.author = "Stag.io";

const slide1 = pres.addSlide();
slide1.addText("Stag.io Database Models", { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: "2E7D32" });
slide1.addText("Entity-Relationship Overview", { x: 0.5, y: 1.2, fontSize: 18, color: "666666" });
slide1.addText("A platform for internship management connecting students, companies, and universities", { x: 0.5, y: 2, fontSize: 14, color: "444444" });
slide1.addShape(pres.ShapeType.rect, { x: 0.5, y: 3, w: 9, h: 2.5, fill: "E8F5E9", line: { color: "2E7D32", width: 2 } });
slide1.addText("Core Entities:\n• Users (students, companies, admins, universities)\n• Students (profile, skills, portfolio)\n• Companies (profile, validation)\n• Universities (domain verification)\n• Internship Offers\n• Applications\n• Reviews & Notifications", { x: 0.8, y: 3.3, fontSize: 14, color: "333333" });

const slide2 = pres.addSlide();
slide2.addText("Users Table", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "1565C0" });
slide2.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: 4, fill: "E3F2FD", line: { color: "1565C0", width: 1 } });
slide2.addText("Fields:", { x: 0.8, y: 1.4, fontSize: 14, bold: true });
slide2.addText("• id (PK) - CUID\n• email (unique)\n• passwordHash\n• role: student | company | admin | superadmin | university\n• firstName, lastName\n• university\n• isEmailVerified\n• emailVerificationCode, emailVerificationExpiry\n• passwordResetToken, passwordResetExpiry\n• deactivatedAt\n• createdAt, updatedAt", { x: 0.8, y: 1.7, fontSize: 12, color: "333333" });

const slide3 = pres.addSlide();
slide3.addText("Students & Universities", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "6A1B9A" });
slide3.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 4.3, h: 3.5, fill: "F3E5F5", line: { color: "6A1B9A", width: 1 } });
slide3.addText("Students", { x: 0.7, y: 1.4, fontSize: 16, bold: true });
slide3.addText("• id (PK), userId (FK)\n• department\n• cvUrl, skills[], bio\n• profilePhotoUrl\n• portfolioPhotos[]\n• linkedinUrl, githubUrl\n• createdAt, updatedAt", { x: 0.7, y: 1.8, fontSize: 11, color: "333333" });
slide3.addShape(pres.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.3, h: 3.5, fill: "F3E5F5", line: { color: "6A1B9A", width: 1 } });
slide3.addText("Universities", { x: 5.4, y: 1.4, fontSize: 16, bold: true });
slide3.addText("• id (PK), userId (FK)\n• universityName\n• domain (unique)\n• website, logoUrl\n• description, location\n• isValidated\n• createdAt, updatedAt", { x: 5.4, y: 1.8, fontSize: 11, color: "333333" });

const slide4 = pres.addSlide();
slide4.addText("Companies Table", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "EF6C00" });
slide4.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: 3.5, fill: "FFF3E0", line: { color: "EF6C00", width: 1 } });
slide4.addText("Fields:", { x: 0.8, y: 1.4, fontSize: 14, bold: true });
slide4.addText("• id (PK), userId (FK, unique)\n• companyName\n• industry, website\n• logoUrl, description\n• location, contactPerson\n• isValidated\n• verificationDocumentUrl\n• createdAt, updatedAt", { x: 0.8, y: 1.7, fontSize: 12, color: "333333" });

const slide5 = pres.addSlide();
slide5.addText("Internship Offers", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "00838F" });
slide5.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: 4, fill: "E0F7FA", line: { color: "00838F", width: 1 } });
slide5.addText("Fields:", { x: 0.8, y: 1.4, fontSize: 14, bold: true });
slide5.addText("• id (PK), companyId (FK)\n• title, description\n• requirements\n• duration, location\n• type: remote | onsite | hybrid\n• status: draft | active | closed\n• bannerUrl, videoUrl\n• createdAt, updatedAt\n\nIndexes: idx_offers_company, idx_offers_status", { x: 0.8, y: 1.7, fontSize: 12, color: "333333" });

const slide6 = pres.addSlide();
slide6.addText("Applications & Saved Offers", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "2E7D32" });
slide6.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 4.3, h: 4, fill: "E8F5E9", line: { color: "2E7D32", width: 1 } });
slide6.addText("Applications", { x: 0.7, y: 1.4, fontSize: 16, bold: true });
slide6.addText("• id (PK)\n• studentId (FK), offerId (FK)\n• coverLetter, cvUrl\n• status: pending | accepted | rejected | validated | withdrawn\n• appliedAt, updatedAt\n\nUnique: student + offer\nIndexes: student, offer, status", { x: 0.7, y: 1.8, fontSize: 11, color: "333333" });
slide6.addShape(pres.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.3, h: 2.5, fill: "E8F5E9", line: { color: "2E7D32", width: 1 } });
slide6.addText("Saved Offers", { x: 5.4, y: 1.4, fontSize: 16, bold: true });
slide6.addText("• id (PK)\n• studentId (FK), offerId (FK)\n• savedAt", { x: 5.4, y: 1.8, fontSize: 11, color: "333333" });

const slide7 = pres.addSlide();
slide7.addText("Reviews & Notifications", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "C62828" });
slide7.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 4.3, h: 3.5, fill: "FFEBEE", line: { color: "C62828", width: 1 } });
slide7.addText("Reviews", { x: 0.7, y: 1.4, fontSize: 16, bold: true });
slide7.addText("• id (PK)\n• applicationId (FK)\n• reviewerUserId (FK)\n• revieweeUserId (FK)\n• reviewerRole: student | company\n• rating (integer)\n• comment\n• createdAt", { x: 0.7, y: 1.8, fontSize: 11, color: "333333" });
slide7.addShape(pres.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.3, h: 3.5, fill: "FFEBEE", line: { color: "C62828", width: 1 } });
slide7.addText("Notifications", { x: 5.4, y: 1.4, fontSize: 16, bold: true });
slide7.addText("• id (PK), userId (FK)\n• type (enum)\n• title, message\n• isRead (default false)\n• relatedId\n• createdAt\n\nTypes: application_status_changed, new_application, etc.", { x: 5.4, y: 1.8, fontSize: 11, color: "333333" });

const slide8 = pres.addSlide();
slide8.addText("Audit Logs & Relationships", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "455A64" });
slide8.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: 2.5, fill: "ECEFF1", line: { color: "455A64", width: 1 } });
slide8.addText("Audit Logs", { x: 0.7, y: 1.4, fontSize: 16, bold: true });
slide8.addText("• id (PK)\n• actorId, actorRole\n• action\n• targetId\n• metadata (JSONB)\n• createdAt", { x: 0.7, y: 1.8, fontSize: 12, color: "333333" });
slide8.addText("Key Relationships:", { x: 0.5, y: 4, fontSize: 16, bold: true });
slide8.addText("User → Student, Company, University (1:1)\nCompany → InternshipOffers (1:N)\nStudent → Applications, SavedOffers (1:N)\nApplication → Reviews (1:N)\nUser → Notifications (1:N)", { x: 0.5, y: 4.4, fontSize: 12, color: "333333" });

pres.writeFile({ fileName: "C:/Users/User/OneDrive/Documents/GitHub/Stag.io/Stag.io-Models-Presentation.pptx" })
  .then(() => console.log("Presentation created!"))
  .catch(err => console.error(err));