// Section schema module: the one place that owns each homepage Section's
// type and default (fallback) copy — the text currently live on the site.
// `useSectionContent` and the admin Section editor both consume this so a
// Section's shape and its current copy are never duplicated across files.

export interface HeroContent {
  title: { main: string; highlight: string };
  subtitle: string;
  name: string;
  description: string;
  cta: {
    primary: { text: string; link: string };
    secondary: { text: string; link: string };
  };
}

export interface AboutContent {
  title: string;
  subtitle: string;
  professionalJourney: { title: string; description: string };
  stats: Array<{ number: string; label: string }>;
  skills: Array<{ name: string; percentage: number }>;
  expertise: string[];
}

export interface ContactContent {
  title: string;
  description: string;
  email: string;
  phone: string;
  location: string;
}

export interface ServicesContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface PortfolioContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface CertificationsContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface TeachingContent {
  title: string;
  subtitle: string;
  description: string;
}

export interface SectionContentMap {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  services: ServicesContent;
  portfolio: PortfolioContent;
  testimonials: TestimonialsContent;
  certifications: CertificationsContent;
  teaching: TeachingContent;
}

export type SectionName = keyof SectionContentMap;

export const SECTION_NAMES: SectionName[] = [
  "hero",
  "about",
  "contact",
  "services",
  "portfolio",
  "testimonials",
  "certifications",
  "teaching",
];

export const SECTION_DEFAULTS: Readonly<SectionContentMap> = {
  hero: {
    title: { main: "Transforming Data into", highlight: "Strategic Insights" },
    subtitle: "Google Certified Data Analytics Professional",
    name: "Salman Sakib",
    description:
      "Google Certified Analytics Engineer with 7+ years of experience transforming complex data into actionable insights. Specializing in data driven business growth with data analysis and data engineering solutions.",
    cta: {
      primary: { text: "Book 1-1 Session", link: "/book-session" },
      secondary: { text: "Get in Touch", link: "#contact" },
    },
  },
  about: {
    title: "About Me",
    subtitle: "Turning complex data into clear, actionable insights",
    professionalJourney: {
      title: "Professional Journey",
      description:
        "Currently serving as Head of Business Intelligence at Cartup Limited, I specialize in transforming complex financial and business data into actionable insights. With over 7 years of experience across Fintech, consulting, and education sectors, I've helped organizations optimize their data strategies and make informed decisions.",
    },
    stats: [
      { number: "7+", label: "Years Experience" },
      { number: "30+", label: "Successful Projects" },
      { number: "10+", label: "Satisfied Clients" },
      { number: "4+", label: "Industry Catered" },
    ],
    skills: [
      { name: "Power BI", percentage: 95 },
      { name: "Tableau", percentage: 80 },
      { name: "Metabase", percentage: 90 },
      { name: "SQL", percentage: 90 },
      { name: "Python", percentage: 85 },
      { name: "Data Visualization", percentage: 95 },
    ],
    expertise: [],
  },
  contact: {
    title: "Let's Work Together",
    description: "Ready to transform your data into strategic insights?",
    email: "salmansrizon2016@gmail.com",
    phone: "",
    location: "Dhaka, Bangladesh",
  },
  services: {
    title: "Services",
    subtitle: "Comprehensive data analytics solutions tailored to your business needs",
    description: "",
  },
  portfolio: {
    title: "Portfolio",
    subtitle: "",
    description: "A showcase of my projects and technical implementations",
  },
  testimonials: {
    title: "Client Testimonials",
    subtitle: "What clients say about working with me",
    description: "",
  },
  certifications: {
    title: "Certifications",
    subtitle: "Validated expertise in data and analytics",
    description: "",
  },
  teaching: {
    title: "Teaching & Mentoring",
    subtitle: "",
    description:
      "As an instructor at DScentral, I'm passionate about sharing knowledge and helping the next generation of data professionals. I provide corporate training, one-on-one mentoring, and workshop facilitation.",
  },
};
