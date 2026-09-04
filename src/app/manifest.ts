import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HuntBoard — AI-First Job Search Management",
    short_name: "HuntBoard",
    description:
      "Track your job applications, optimize CVs with AI, and manage interview schedules in one unified dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add Application",
        short_name: "New Job",
        description: "Quickly track a new job vacancy in Kanban",
        url: "/applications?action=new",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "My Resume",
        short_name: "CV Editor",
        description: "Open active CV and AI enhancement tools",
        url: "/cv",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Interview Calendar",
        short_name: "Calendar",
        description: "View upcoming interviews and meetings",
        url: "/calendar",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Community Jobs",
        short_name: "Community",
        description: "Explore shared opportunities and referrals",
        url: "/community",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
    ],
  };
}
