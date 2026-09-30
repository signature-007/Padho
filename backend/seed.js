// Fills the database with demo data:  npm run seed
// WARNING: this clears all existing LMS collections first.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");
const Module = require("./models/Module");
const Enrollment = require("./models/Enrollment");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const { recalc } = require("./utils/progress");

const day = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const res = (label, type, url) => ({ label, type, url });

async function run() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms",
  );
  await Promise.all(
    [User, Course, Module, Enrollment, Assignment, Submission].map((M) =>
      M.deleteMany({}),
    ),
  );

  const admin = await User.create({
    name: "Admin Instructor",
    email: "admin@lms.com",
    password: "Admin@123",
    role: "admin",
  });
  const [asha, ravi, meera] = await Promise.all([
    User.create({
      name: "Asha Patel",
      email: "student@lms.com",
      password: "Student@123",
    }),
    User.create({
      name: "Ravi Kumar",
      email: "ravi@lms.com",
      password: "Student@123",
    }),
    User.create({
      name: "Meera Das",
      email: "meera@lms.com",
      password: "Student@123",
    }),
  ]);

  const fullstack = await Course.create({
    title: "Full Stack Development",
    description:
      "Build complete web applications: structure pages with HTML, style them with CSS, add behaviour with JavaScript, then connect a Node.js backend to a database.",
    category: "Web Development",
    instructor: admin.name,
    duration: "10 weeks",
    difficulty: "Intermediate",
  });
  const python = await Course.create({
    title: "Python for Beginners",
    description:
      "Learn Python from scratch: syntax, data types, control flow, functions and simple file handling, with small practice programs in every module.",
    category: "Programming",
    instructor: admin.name,
    duration: "4 weeks",
    difficulty: "Beginner",
  });
  const dbs = await Course.create({
    title: "Database Design Essentials",
    description:
      "Model real-world data, write queries, and understand when to choose SQL or MongoDB for a project.",
    category: "Databases",
    instructor: admin.name,
    duration: "3 weeks",
    difficulty: "Intermediate",
  });

  const mk = (course, order, title, description, notes, resources) =>
    Module.create({
      course: course._id,
      order,
      title,
      description,
      notes,
      resources,
    });
  const fs = [
    await mk(
      fullstack,
      1,
      "HTML Fundamentals",
      "Document structure, semantic elements, forms and accessibility basics.",
      "Use semantic tags (header, main, section, footer). Every form control needs a label.",
      [
        res(
          "MDN: Learn HTML",
          "reference",
          "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        ),
        res(
          "HTML forms guide",
          "notes",
          "https://developer.mozilla.org/en-US/docs/Learn/Forms",
        ),
      ],
    ),
    await mk(
      fullstack,
      2,
      "CSS Fundamentals",
      "Selectors, the box model, flexbox, grid and responsive design.",
      "Start mobile-first and add media queries as the layout needs them.",
      [
        res(
          "MDN: Learn CSS",
          "reference",
          "https://developer.mozilla.org/en-US/docs/Learn/CSS",
        ),
        res("Flexbox practice", "exercise", "https://flexboxfroggy.com/"),
      ],
    ),
    await mk(
      fullstack,
      3,
      "JavaScript Basics",
      "Variables, functions, arrays, objects, DOM manipulation and fetch.",
      "Prefer const, use array methods (map, filter, reduce), handle errors from fetch.",
      [
        res(
          "MDN: JavaScript first steps",
          "reference",
          "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps",
        ),
        res("JavaScript.info", "notes", "https://javascript.info/"),
      ],
    ),
    await mk(
      fullstack,
      4,
      "Frontend Development",
      "Build interfaces with React: components, props, state, effects and routing.",
      "Keep components small; lift state up only when two components need it.",
      [
        res("React documentation", "reference", "https://react.dev/learn"),
        res("React Router", "reference", "https://reactrouter.com/"),
      ],
    ),
    await mk(
      fullstack,
      5,
      "Backend Development",
      "REST APIs with Node.js and Express, middleware, validation and JWT authentication.",
      "Never store plain-text passwords. Validate every request body on the server.",
      [
        res(
          "Express guide",
          "reference",
          "https://expressjs.com/en/guide/routing.html",
        ),
        res("Node.js docs", "reference", "https://nodejs.org/en/learn"),
      ],
    ),
    await mk(
      fullstack,
      6,
      "Database Integration",
      "Model data with MongoDB and Mongoose and connect it to your API.",
      "Design schemas around how the data is queried. Add unique indexes for natural keys.",
      [
        res(
          "MongoDB manual",
          "reference",
          "https://www.mongodb.com/docs/manual/",
        ),
        res(
          "Mongoose docs",
          "reference",
          "https://mongoosejs.com/docs/guide.html",
        ),
      ],
    ),
  ];
  await mk(
    python,
    1,
    "Python Basics",
    "Installing Python, variables, numbers, strings and input/output.",
    "Use f-strings for formatting. Indentation is part of the syntax.",
    [
      res(
        "Python tutorial",
        "reference",
        "https://docs.python.org/3/tutorial/introduction.html",
      ),
    ],
  );
  await mk(
    python,
    2,
    "Control Flow and Functions",
    "if/else, loops, functions, arguments and return values.",
    "Write small functions that do one thing.",
    [
      res(
        "Control flow tools",
        "reference",
        "https://docs.python.org/3/tutorial/controlflow.html",
      ),
    ],
  );
  await mk(
    python,
    3,
    "Data Structures and Files",
    "Lists, dictionaries, sets and reading/writing text files.",
    "Pick the structure by the operation you do most often.",
    [
      res(
        "Data structures",
        "reference",
        "https://docs.python.org/3/tutorial/datastructures.html",
      ),
    ],
  );
  await mk(
    dbs,
    1,
    "Relational Modelling",
    "Entities, relationships, keys and normalization.",
    "Every table needs a primary key; avoid storing the same fact twice.",
    [
      res(
        "Database normalization",
        "reference",
        "https://en.wikipedia.org/wiki/Database_normalization",
      ),
    ],
  );
  await mk(
    dbs,
    2,
    "Querying Data",
    "SELECT, JOIN, GROUP BY and MongoDB find/aggregate.",
    "Practise the same question in SQL and in MongoDB to compare.",
    [res("SQL tutorial", "exercise", "https://sqlbolt.com/")],
  );

  const a1 = await Assignment.create({
    course: fullstack._id,
    title: "Personal Portfolio Page",
    description: "Build a responsive one-page portfolio.",
    instructions:
      "Use semantic HTML and CSS only. Include About, Projects and Contact sections. Submit a GitHub link or deployed URL.",
    deadline: day(7),
    maxMarks: 50,
  });
  const a2 = await Assignment.create({
    course: fullstack._id,
    title: "REST API for a Notes App",
    description: "Create CRUD endpoints with Express and MongoDB.",
    instructions:
      "Provide GET/POST/PUT/DELETE routes, validation and a README listing every endpoint. Submit the GitHub repository link.",
    deadline: day(14),
    maxMarks: 100,
  });
  const a3 = await Assignment.create({
    course: python._id,
    title: "Number Guessing Game",
    description: "A command line game written in Python.",
    instructions:
      "Use loops, functions and input validation. Paste your code or share a link.",
    deadline: day(-2),
    maxMarks: 20,
  });
  await Assignment.create({
    course: dbs._id,
    title: "Library Schema Design",
    description: "Design a schema for a small library.",
    instructions:
      "Submit an ER diagram (PDF/PNG) with a short explanation of your keys and relationships.",
    deadline: day(10),
    maxMarks: 30,
  });

  // Asha: partly through Full Stack, has submissions
  const e1 = await Enrollment.create({
    student: asha._id,
    course: fullstack._id,
    enrollmentDate: day(-12),
    completedModules: [fs[0]._id, fs[1]._id, fs[2]._id],
  });
  await recalc(e1);
  await Enrollment.create({
    student: asha._id,
    course: python._id,
    enrollmentDate: day(-6),
  });
  // Ravi: finished Python, started Full Stack
  const e3 = await Enrollment.create({
    student: ravi._id,
    course: fullstack._id,
    enrollmentDate: day(-9),
    completedModules: [fs[0]._id],
  });
  await recalc(e3);
  await Enrollment.create({
    student: meera._id,
    course: dbs._id,
    enrollmentDate: day(-3),
  });

  await Submission.create({
    assignment: a1._id,
    course: fullstack._id,
    student: asha._id,
    link: "https://github.com/example/asha-portfolio",
    linkType: "github",
    text: "Responsive portfolio with a CSS grid layout.",
    submissionDate: day(-2),
    status: "submitted",
  });
  await Submission.create({
    assignment: a3._id,
    course: python._id,
    student: asha._id,
    text: "import random\nsecret = random.randint(1, 20)\n# ... full game loop ...",
    submissionDate: day(-3),
    isLate: false,
    marks: 18,
    feedback:
      "Clean loop and good input validation. Add a play-again option next time.",
    status: "graded",
  });
  await Submission.create({
    assignment: a1._id,
    course: fullstack._id,
    student: ravi._id,
    link: "https://ravi-portfolio.example.com",
    linkType: "project",
    submissionDate: day(-1),
    status: "under_review",
  });

  console.log(
    "Seed complete.\n  Admin:   admin@lms.com   / Admin@123\n  Student: student@lms.com / Student@123 (also ravi@lms.com, meera@lms.com)",
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
