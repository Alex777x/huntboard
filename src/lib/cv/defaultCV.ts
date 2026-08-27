import { CVData } from "@/types/cv";

export const defaultCVData: CVData = {
  personal: {
    fullName: "Anatoli Aliaksandrou",
    title: "Java Software Engineer",
    email: "alexandroff103@gmail.com",
    phone: "+48 500 579 983",
    location: "Poland, Bialystok",
    summary:
      "Java Software Engineer with over 5 years of experience in developing and maintaining high-load and scalable applications. I specialize in Java, Spring Boot, Hibernate, Apache Kafka, Microservices, and SQL. I have experience working with CI/CD pipelines and containerization using Docker. I have contributed to designing and implementing Kafka Streams for real-time data processing, optimizing SQL queries, and migrating microservices.",
    linkedinUrl: "https://www.linkedin.com/in/anatoli-aliaksandrou/",
  },
  skills: [
    "Java",
    "Spring Boot",
    "Hibernate",
    "Kafka",
    "SQL",
    "PL/SQL",
    "PostgreSQL",
    "Data JPA",
    "REST API",
    "Docker",
    "Microservices",
    "JDBC",
    "Maven",
    "DDD",
    "SOLID",
    "DRY",
    "CI/CD",
    "Git",
    "Clean Code",
    "Agile",
    "JUnit",
    "Mockito",
    "AssertJ",
    "TestContainers",
    "WireMock",
    "Checkstyle",
    "SonarQube",
    "Grafana",
    "Splunk",
    "OpenAPI (Swagger)",
    "Jira",
  ],
  experience: [
    {
      id: "exp-1",
      company: "Virtusa Corporation",
      companyDescription:
        "A global IT consulting and software development company, specializing in digital transformation and software engineering.",
      role: "Software Engineer",
      location: "Poland, Warsaw",
      startDate: "May 2025",
      endDate: "Present",
      current: true,
      description: "",
      projects: [
        {
          name: "Project Santander Bank: Global banking services.",
          highlights: [
            "Development of new microservices for generating financial reports and statements.",
            "Migration of legacy components from PL/SQL to modern Java-based microservices architecture.",
            "Mentoring a team of PL/SQL developers transitioning to Java; conducted code reviews and planned the migration process to a Java-based microservices architecture.",
          ],
        },
      ],
      technologies: ["Java", "Spring Boot", "Microservices", "PL/SQL", "Kafka"],
    },
    {
      id: "exp-2",
      company: "Godel Technologies Europe",
      companyDescription:
        "A global IT consulting and software development company, specializing in digital transformation and software engineering.",
      role: "Java Software Engineer",
      location: "Poland, Bialystok",
      startDate: "Sep 2022",
      endDate: "Dec 2024",
      current: false,
      description: "",
      projects: [
        {
          name: "Project CTM: A price comparison website that helps users find the best deals on insurance, financial products, utilities, and other services. Based on over 60 microservices using Java/Python, Kafka/Kafka Streams and AWS.",
          highlights: [
            "Implemented 15 microservices for real-time data processing, replacing legacy systems.",
            "Migrated 60 microservices from GitHub, Jenkins, and GoCD to GitLab CI/CD, which accelerated the testing and deployment process by 50% and reduced resource costs.",
            "Achieved 97% test coverage for both new and existing functionality.",
            "Optimized SQL queries, improving performance by 10% using indexes and limitation.",
          ],
        },
      ],
      technologies: ["Java", "Python", "Kafka", "Kafka Streams", "AWS", "GitLab CI/CD", "SQL"],
    },
    {
      id: "exp-3",
      company: "IntexSoft Software Development",
      companyDescription:
        "A Belarusian IT consulting and software development company, specializing in data solutions and custom software.",
      role: "Java Developer",
      location: "Belarus, Grodno",
      startDate: "Sep 2019",
      endDate: "Aug 2022",
      current: false,
      description: "",
      projects: [
        {
          name: "Project Bank (Jan 2021 - Aug 2022): Banking services for small and medium-sized businesses.",
          highlights: [
            "In 2 months, developed and released to production an MVP for generating bank statements in various formats, such as PDF, Excel, and TXT.",
            "Developed a library for converting numeric values into their written equivalents. For example, 2.15 PLN = “two zloty and fifteen groszy”.",
            "Released an MVP for a service that accepts invoices in PDF, Excel, or TXT format and generates a corresponding payment in the banking system based on the provided invoice.",
            "Resolved performance issues in generating bank statements in PDF format, reducing generation time by 50%.",
            "As part of a mentorship program, I trained a manual QA in the basics of Java and helped them switch into test automation.",
          ],
        },
        {
          name: "Project Leasing (Oct 2020 - Jan 2021): The provision of long-term vehicle leasing with the option to purchase.",
          highlights: [
            "Eliminated 3 out of 10 legacy modules by transitioning to a new microservice architecture.",
            "Integrated Docker, significantly speeding up the development and testing process.",
            "Learned Vue at a basic level to handle 50% of tasks related to front-end development and bug fixes.",
            "Configured integration with the 1C Accounting System.",
          ],
        },
        {
          name: "Project CMS (Sep 2019 - Oct 2020): A platform for mobile operator that allows you to create, launch, monitor, and manage various campaigns, such as advertising campaigns or customer engagement surveys.",
          highlights: [
            "Migrated from a legacy system and refactored a large monolith into 9 smaller monoliths and several microservices.",
            "Optimized SQL queries by restructuring joins and indexing critical tables, which increased query execution speed by 100%.",
            "Resolved a memory leak issue that required the application to be restarted every 2 days.",
          ],
        },
      ],
      technologies: ["Java", "Spring Boot", "Docker", "PostgreSQL", "Vue.js", "PL/SQL"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Togliatti State University",
      degree: "Bachelor's degree, Business Informatics",
    },
    {
      id: "edu-2",
      institution: "IT-Academy",
      degree: "Java technologies for developing enterprise solutions",
    },
  ],
  projects: [],
  languages: [
    { language: "Russian", proficiency: "Native" },
    { language: "English", proficiency: "Intermediate (B1)" },
    { language: "Polish", proficiency: "Upper-Intermediate (B2)" },
  ],
  gdprConsent: {
    enabled: true,
    text: "I hereby consent to my personal data being processed for the purpose of current and future recruitment processes.",
  },
};
