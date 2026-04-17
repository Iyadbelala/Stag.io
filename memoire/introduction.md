# General Introduction

---

The rapid evolution of the digital landscape has profoundly transformed the way higher education institutions, companies, and students interact throughout the professional integration process. Among the most critical stages of this process is the internship — a mandatory academic requirement that serves as a bridge between theoretical knowledge acquired in university and practical experience in the professional world. Internships are central to the training of future graduates, as they provide students with the opportunity to develop industry-relevant skills, build professional networks, and gain firsthand exposure to the realities of the job market.

However, despite the undeniable importance of internships, the processes surrounding their management — from offer discovery and student applications to administrative validation and post-internship evaluation — remain largely manual, fragmented, and inefficient, particularly in the Algerian context. Students are forced to navigate a multitude of disconnected channels (company websites, social media, word of mouth, university bulletin boards) to find relevant opportunities, with no guarantee of matching their academic profile or career aspirations. Companies, on their end, receive applications from candidates whose profiles often do not align with the requirements of their offers, resulting in wasted time and resources. Universities, despite being key stakeholders in the internship lifecycle, are largely excluded from the digital process, relying on paper-based workflows for agreement validation and student tracking.

This situation raises a central question: **How can we design and develop a unified digital platform that streamlines the entire internship lifecycle — connecting students, companies, and universities — while providing intelligent matching, real-time tracking, and administrative automation?**

To address this question, we propose **Stag.io** (*stage* being the French word for *internship*), a modern, full-stack web platform that digitizes the complete internship management process. Our main contributions through this project are as follows:

- **The design and development of a multi-stakeholder platform** with role-based access control, providing tailored experiences for students, companies, universities, administrators, and super administrators — all within a single, unified system.
- **The implementation of SmartMatch**, a proprietary, zero-dependency recommendation engine that scores and ranks internship offers against a student's profile in real time (under 100 ms per request) across four dimensions: skills (50%), academic department (25%), location (15%), and title relevance (10%).
- **The integration of end-to-end lifecycle management**, covering offer publication, intelligent discovery, application submission, administrative agreement validation, and post-internship evaluation — replacing fragmented, paper-based workflows with a seamless digital experience.
- **The incorporation of modern web technologies and services**, including real-time notifications via WebSocket (Socket.IO), an AI-powered chatbot (Google Gemini), automated PDF generation for CVs and internship agreements, and full bilingual support (English/French).

This thesis is organized as follows:

- **Chapter 1 — Project Context**: We present the general context of the project, examine the current state of internship management both globally and in Algeria, analyze existing solutions in the market, and identify the limitations that motivate the development of Stag.io.

- **Chapter 2 — Preliminary Study and Requirements Specification**: We present the project in detail, identify the actors that interact with the system, define the functional and non-functional requirements, and model the use cases with detailed textual descriptions.

- **Chapter 3 — Design and Modeling**: We present the system architecture and the detailed design of the application, including class diagrams, sequence diagrams, and the database schema.

- **Chapter 4 — Implementation and Testing**: We describe the technical environment, the tools and technologies used, present the key interfaces of the application, and discuss the testing and validation process.

Finally, we conclude this thesis with a **General Conclusion** that summarizes the work accomplished, evaluates the results obtained, and outlines perspectives for future development.
