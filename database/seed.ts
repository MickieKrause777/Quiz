import { quizzes, questions, answers } from "./schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema1 from "@/database/schema";
import * as schema2 from "@/database/relations";
import { config } from "dotenv";

type Answer = [text: string, isCorrect: boolean, description: string];
type Quiz = {
  title: string;
  description: string;
  questions: { text: string; answers: Answer[] }[];
};

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema: { ...schema1, ...schema2 } });

async function seed() {
  const quizData: Quiz[] = [
    {
      title: "Requirements analysis",
      description:
        "IT project management involves planning, executing, and overseeing IT initiatives like software development, hardware installations, and network upgrades to ensure projects align with business goals, manage risks, and adhere to budget and time constraints.",
      questions: [
        {
          text: "What document is usually produced at the end of requirements analysis?",
          answers: [
            [
              "Requirements specification document",
              true,
              "Correct! Official document that outlines all gathered and agreed-upon requirements.",
            ],
            [
              "Project closure report",
              false,
              "Incorrect. Produced at the end of the project lifecycle, not during analysis.",
            ],
            [
              "Risk register",
              false,
              "Incorrect. Related to risk management, not requirements analysis.",
            ],
            [
              "Software design specification",
              false,
              "Incorrect. Comes after the requirements phase.",
            ],
          ],
        },
        {
          text: "Which type of requirement describes how the system should behave?",
          answers: [
            [
              "Digital transformation",
              true,
              "Correct! Digital transformation is central to business informatics.",
            ],
            [
              "Cooking techniques",
              false,
              "Incorrect. That's unrelated to IT or business processes.",
            ],
            [
              "Astrology",
              false,
              "Incorrect. Astrology has no connection with informatics.",
            ],
            [
              "Graphic novels",
              false,
              "Incorrect. Graphic novels are part of literature and art.",
            ],
          ],
        },
        {
          text: "Which degree is common in this field?",
          answers: [
            [
              "Information Systems",
              true,
              "Correct! Many business informatics professionals study Information Systems.",
            ],
            [
              "Philosophy",
              false,
              "Incorrect. Philosophy is not directly related to informatics.",
            ],
            [
              "Marine Biology",
              false,
              "Incorrect. This field studies aquatic life, not IT systems.",
            ],
            [
              "Theater",
              false,
              "Incorrect. Theater is unrelated to business or informatics.",
            ],
          ],
        },
      ],
    },
    {
      title: "Enterprise Resource Planning (ERP)",
      description: "How well do you know ERP systems?",
      questions: [
        {
          text: "What does ERP stand for?",
          answers: [
            [
              "Enterprise Resource Planning",
              true,
              "Correct! ERP systems help manage core business processes.",
            ],
            [
              "Enhanced Routing Protocol",
              false,
              "Incorrect. That’s a networking term.",
            ],
            [
              "Employee Role Program",
              false,
              "Incorrect. That’s not a real term in IT or business.",
            ],
            [
              "Enterprise Risk Planning",
              false,
              "Incorrect. Risk planning is part of governance, not ERP directly.",
            ],
          ],
        },
        {
          text: "Which company is known for ERP?",
          answers: [
            [
              "SAP",
              true,
              "Correct! SAP is one of the largest ERP vendors globally.",
            ],
            [
              "Spotify",
              false,
              "Incorrect. Spotify is a music streaming platform.",
            ],
            [
              "Netflix",
              false,
              "Incorrect. Netflix is in the entertainment industry.",
            ],
            ["TikTok", false, "Incorrect. TikTok is a social media platform."],
          ],
        },
        {
          text: "What is a benefit of ERP?",
          answers: [
            [
              "Integrated processes",
              true,
              "Correct! ERP systems unify processes across departments.",
            ],
            [
              "Longer downtime",
              false,
              "Incorrect. ERP aims to reduce downtime, not increase it.",
            ],
            [
              "More paperwork",
              false,
              "Incorrect. ERP digitizes and automates workflows.",
            ],
            [
              "Lower collaboration",
              false,
              "Incorrect. ERP should improve collaboration company-wide.",
            ],
          ],
        },
      ],
    },
    {
      title: "Database Systems",
      description: "Fundamentals of modern databases.",
      questions: [
        {
          text: "What is a relational database?",
          answers: [
            [
              "A database with tables and relations",
              true,
              "Correct! Relational databases organize data in structured tables.",
            ],
            [
              "A photo gallery",
              false,
              "Incorrect. A photo gallery is not a database system.",
            ],
            [
              "A messaging app",
              false,
              "Incorrect. Messaging apps may use databases but aren't databases themselves.",
            ],
            [
              "A network of friends",
              false,
              "Incorrect. This sounds more like a social graph than a relational database.",
            ],
          ],
        },
        {
          text: "Which query language is used?",
          answers: [
            [
              "SQL",
              true,
              "Correct! SQL (Structured Query Language) is the standard for querying relational databases.",
            ],
            [
              "HTML",
              false,
              "Incorrect. HTML is used to structure web pages, not databases.",
            ],
            [
              "CSS",
              false,
              "Incorrect. CSS styles web content, it doesn't interact with databases.",
            ],
            [
              "Python",
              false,
              "Incorrect. Python can interact with databases but is not a query language itself.",
            ],
          ],
        },
        {
          text: "What is normalization?",
          answers: [
            [
              "Organizing data to reduce redundancy",
              true,
              "Correct! Normalization improves data consistency.",
            ],
            [
              "Encrypting data",
              false,
              "Incorrect. Encryption secures data, not organizes it.",
            ],
            [
              "Backing up data",
              false,
              "Incorrect. Backup is about data recovery, not structure.",
            ],
            [
              "Deleting unused data",
              false,
              "Incorrect. While related, that’s more about data cleanup.",
            ],
          ],
        },
      ],
    },
    {
      title: "Information Systems",
      description: "Core concepts in IS.",
      questions: [
        {
          text: "What do IS typically support?",
          answers: [
            [
              "Business decision making",
              true,
              "Correct! IS provide data and tools for decisions.",
            ],
            [
              "Haircuts",
              false,
              "Incorrect. That’s a service industry task, not IS related.",
            ],
            [
              "Sports training",
              false,
              "Incorrect. IS are not typically used for athletic training.",
            ],
            [
              "Movie production",
              false,
              "Incorrect. While software is used, it’s not the IS focus.",
            ],
          ],
        },
        {
          text: "Which is a type of IS?",
          answers: [
            [
              "MIS",
              true,
              "Correct! MIS (Management Information Systems) is a major IS category.",
            ],
            [
              "SMS",
              false,
              "Incorrect. SMS is short message service, not an information system.",
            ],
            ["LED", false, "Incorrect. LED is a hardware component."],
            ["CRT", false, "Incorrect. CRT is a display technology, not IS."],
          ],
        },
        {
          text: "What is the output of IS?",
          answers: [
            [
              "Reports and analytics",
              true,
              "Correct! IS typically produce reports and support analysis.",
            ],
            [
              "Physical products",
              false,
              "Incorrect. IS produce information, not physical goods.",
            ],
            [
              "Electricity",
              false,
              "Incorrect. IS are consumers, not producers of electricity.",
            ],
            [
              "Construction",
              false,
              "Incorrect. IS are used in planning, not actual building.",
            ],
          ],
        },
      ],
    },
    {
      title: "E-Business",
      description: "Everything digital commerce!",
      questions: [
        {
          text: "What is E-Business?",
          answers: [
            [
              "Conducting business online",
              true,
              "Correct! E-Business involves digital transactions and processes.",
            ],
            [
              "Playing video games",
              false,
              "Incorrect. Gaming is digital but not E-Business in itself.",
            ],
            [
              "Flying airplanes",
              false,
              "Incorrect. That's aviation, not digital commerce.",
            ],
            [
              "Gardening",
              false,
              "Incorrect. Gardening is unrelated to E-Business.",
            ],
          ],
        },
        {
          text: "Which model fits E-Business?",
          answers: [
            [
              "B2C",
              true,
              "Correct! Business-to-Consumer is a common E-Business model.",
            ],
            [
              "F2P",
              false,
              "Incorrect. That means Free-to-Play and refers to games.",
            ],
            ["P2P", false, "Incorrect. P2P is peer-to-peer networking."],
            [
              "DIY",
              false,
              "Incorrect. DIY means Do-It-Yourself, unrelated to commerce models.",
            ],
          ],
        },
        {
          text: "Which platform supports E-Business?",
          answers: [
            [
              "Shopify",
              true,
              "Correct! Shopify enables online selling and store management.",
            ],
            ["Photoshop", false, "Incorrect. Photoshop is for image editing."],
            ["GarageBand", false, "Incorrect. That’s for music production."],
            ["Unity", false, "Incorrect. Unity is a game engine."],
          ],
        },
      ],
    },
    {
      title: "Business Process Management",
      description: "Process modeling and improvement.",
      questions: [
        {
          text: "What is BPM?",
          answers: [
            [
              "Managing business processes",
              true,
              "Correct! BPM is all about process optimization.",
            ],
            [
              "Measuring body performance",
              false,
              "Incorrect. That sounds like sports science.",
            ],
            [
              "Buying party materials",
              false,
              "Incorrect. That’s not related to BPM.",
            ],
            ["Baking pizza manually", false, "Incorrect. Creative but wrong."],
          ],
        },
        {
          text: "What tool is used in BPM?",
          answers: [
            [
              "BPMN",
              true,
              "Correct! Business Process Model and Notation is a standard.",
            ],
            [
              "VPN",
              false,
              "Incorrect. VPNs are used for secure connections, not process modeling.",
            ],
            ["CRM", false, "Incorrect. CRMs manage customers, not processes."],
            [
              "RAM",
              false,
              "Incorrect. RAM is hardware memory, not a BPM tool.",
            ],
          ],
        },
        {
          text: "Why model processes?",
          answers: [
            [
              "To understand and improve them",
              true,
              "Correct! Modeling helps with optimization.",
            ],
            [
              "To make art",
              false,
              "Incorrect. While visual, modeling serves analysis, not art.",
            ],
            [
              "To lose data",
              false,
              "Incorrect. The goal is the opposite — clarity and structure.",
            ],
            [
              "To encrypt them",
              false,
              "Incorrect. Encryption protects data, not processes.",
            ],
          ],
        },
      ],
    },
    {
      title: "Digital Transformation",
      description: "Adapting to new technologies.",
      questions: [
        {
          text: "What drives digital transformation?",
          answers: [
            [
              "Technology adoption",
              true,
              "Correct! Adopting new tech enables transformation.",
            ],
            [
              "Lack of electricity",
              false,
              "Incorrect. Tech requires electricity!",
            ],
            ["Pet ownership", false, "Incorrect. Not relevant at all."],
            [
              "Musical ability",
              false,
              "Incorrect. Creativity helps, but isn’t a key driver.",
            ],
          ],
        },
        {
          text: "What is the goal?",
          answers: [
            [
              "Better services via tech",
              true,
              "Correct! The aim is to improve efficiency and experience.",
            ],
            [
              "Shorter novels",
              false,
              "Incorrect. That’s literature, not business tech.",
            ],
            [
              "Louder music",
              false,
              "Incorrect. Volume has nothing to do with transformation.",
            ],
            [
              "Slower internet",
              false,
              "Incorrect. The opposite — faster internet supports change.",
            ],
          ],
        },
        {
          text: "Who leads transformation?",
          answers: [
            [
              "CIO/CTO",
              true,
              "Correct! These roles are responsible for tech-driven strategy.",
            ],
            ["Chef", false, "Incorrect. Maybe in a kitchen, not in IT."],
            ["Driver", false, "Incorrect. That’s transportation."],
            ["Dancer", false, "Incorrect. Creative — but no."],
          ],
        },
      ],
    },
    {
      title: "Project Management in IT",
      description: "Organize your digital projects.",
      questions: [
        {
          text: "What is Scrum?",
          answers: [
            [
              "Agile framework",
              true,
              "Correct! Scrum is a popular Agile methodology.",
            ],
            [
              "Soccer tactic",
              false,
              "Incorrect. Scrum is from rugby — and project management.",
            ],
            ["Math theorem", false, "Incorrect. Not a math concept."],
            ["Fashion trend", false, "Incorrect. Scrum isn’t about style."],
          ],
        },
        {
          text: "Who owns the backlog?",
          answers: [
            [
              "Product Owner",
              true,
              "Correct! They prioritize and manage backlog items.",
            ],
            [
              "Customer",
              false,
              "Incorrect. They give input but don’t own the backlog.",
            ],
            [
              "Manager",
              false,
              "Incorrect. Unless they're also the Product Owner.",
            ],
            [
              "CEO",
              false,
              "Incorrect. They oversee strategy, not operational details.",
            ],
          ],
        },
        {
          text: "Why use project management?",
          answers: [
            [
              "Organize and deliver results",
              true,
              "Correct! PM helps teams stay on track.",
            ],
            ["Confuse people", false, "Incorrect. That’s not the goal of PM."],
            [
              "Waste money",
              false,
              "Incorrect. PM aims for efficient use of resources.",
            ],
            [
              "Avoid responsibility",
              false,
              "Incorrect. It promotes accountability.",
            ],
          ],
        },
      ],
    },
  ];

  console.log("Seeding data...");

  try {
    for (const quiz of quizData) {
      const createdQuiz = await db
        .insert(quizzes)
        .values({
          title: quiz.title,
          description: quiz.description,
          category: "Business Informatics",
          creatorId: "b9717c1a-fd43-4026-9ccf-f9a6c20b42dd",
        })
        .returning({ id: quizzes.id });

      const quizId = createdQuiz[0].id;

      for (const question of quiz.questions) {
        const insertedQuestion = await db
          .insert(questions)
          .values({
            quizId,
            question: question.text,
          })
          .returning({ id: questions.id });

        const questionId = insertedQuestion[0].id;

        await db.insert(answers).values(
          question.answers.map(([text, isCorrect, description]) => ({
            questionId,
            text,
            isCorrect,
            description,
          })),
        );
      }
    }

    console.log("✅ Successfully seeded all quizzes!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  }
}

seed();
