import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  initials: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Aisha Rahman",
    initials: "AR",
    role: "Recent Graduate — Product Ops",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    quote:
      "I uploaded my PDF, told the AI the job title, and within minutes I had copy-ready bullets that actually match the JD. Landed 3 interviews in 2 weeks!",
  },
  {
    name: "Diego Morales",
    initials: "DM",
    role: "Frontend Engineer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "The chat feels like a brutally honest mentor. It highlighted the exact lines to tighten and suggested stronger metrics I could add. Best free tool for resumes I've used.",
  },
  {
    name: "Priya Anand",
    initials: "PA",
    role: "Career Switcher — Data Analyst",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "I was switching from retail to data. The AI helped reframe my experience and suggested role-specific keywords that got my resume past ATS.",
  },
  {
    name: "Liam O'Connor",
    initials: "LO",
    role: "Hiring Manager",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
    quote:
      "Candidates who used this tool came in with clearer, more relevant resumes. The job-fit score is a quick signal that actually aligns with what we look for.",
  },
  {
    name: "Sara Chen",
    initials: "SC",
    role: "UX Designer",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    quote:
      "I liked how it pointed to specific lines in my PDF and suggested tiny wording changes that made my impact statements pop. Simple, practical, free.",
  },
  {
    name: "Mohamed El-Sayed",
    initials: "ME",
    role: "Bootcamp Graduate",
    image: "https://randomuser.me/api/portraits/men/21.jpg",
    quote:
      "No credit card, no fuss. Upload, chat, copy edits — the workflow is perfect for someone who needs fast, guided tweaks.",
  },
  {
    name: "Olivia Bennett",
    initials: "OB",
    role: "Senior Product Manager",
    image: "https://randomuser.me/api/portraits/women/27.jpg",
    quote:
      "The suggestions are surprisingly targeted — helped me reframe leadership bullets toward measurable outcomes. Clean, professional, and free.",
  },
  {
    name: "Khaled Mansour",
    initials: "KM",
    role: "Recruiter",
    image: "https://randomuser.me/api/portraits/men/88.jpg",
    quote:
      "As a recruiter, I appreciate resumes that speak to the job. This tool helps candidates do exactly that — better fits, faster callbacks.",
  },
  {
    name: "Maya Flores",
    initials: "MF",
    role: "Data Scientist",
    image: "https://randomuser.me/api/portraits/women/54.jpg",
    quote:
      "Upload your CV and tell it the role — the AI returns precise phrasing, and a match score that makes prioritizing edits super easy.",
  },
];

const chunkArray = (
  array: Testimonial[],
  chunkSize: number,
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3),
);

export default function WallOfLoveSection() {
  return (
    <section id="testimonials">
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">What people say</h2>
            <p className="text-muted-foreground mt-6">
              Real users — real results. Upload a PDF, chat with the AI, and get
              copy-ready resume fixes.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-3">
                {chunk.map(({ name, initials, role, quote, image }, index) => (
                  <Card key={index}>
                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={name}
                          src={image}
                          loading="lazy"
                          width="120"
                          height="120"
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{name}</h3>

                        <span className="text-muted-foreground block text-sm tracking-wide">
                          {role}
                        </span>

                        <blockquote className="mt-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {quote}
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
