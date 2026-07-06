import { Card, CardContent } from "@/components/ui/card";
import profileImage from "@/assets/formal.jpg";
import ScrollReveal from "./ScrollReveal";
import BrandLogos from "./BrandLogos";
import { useSectionContent } from "@/hooks/useSectionContent";

const About = () => {
  const { content: aboutContent, loading } = useSectionContent("about");
  const { content: teachingContent } = useSectionContent("teaching");

  if (loading) {
    return (
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  const { title, subtitle, stats, skills } = aboutContent;
  const journeyTitle = aboutContent.professionalJourney.title;
  const journeyDescription = aboutContent.professionalJourney.description;

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{title}</h2>
            <p className="text-xl text-primary font-semibold">
              {subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <ScrollReveal direction="left">
            <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center sm:text-left">{journeyTitle}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {journeyDescription}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>

          {/* Right Content - Image */}
          <ScrollReveal direction="right">
            <div className="flex justify-center">
            <div className="relative w-80 h-100 rounded-2xl shadow-card pt-8">
              <img
                src={profileImage}
                alt="Salman Sakib - Data Analyst"
                className="w-80 h-80 object-cover rounded-2xl shadow-card object-top"
                style={{ objectPosition: 'center 20%' }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          </ScrollReveal>
        </div>

        {/* Helped to Grow - Brand Logos */}
        <ScrollReveal direction="up">
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center sm:text-left">Helped to Grow</h3>
            <BrandLogos />
          </div>
        </ScrollReveal>

        {/* Teaching & Mentoring */}
        <ScrollReveal direction="up">
          <Card className="mb-16 shadow-card hover:shadow-hover transition-all hover:border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">{teachingContent.title}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {teachingContent.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Consultation","Corporate Training", "Data Analysis", "Growth Strategy"].map((item, index) => (
                <div
                  key={index}
                  className="bg-secondary border border-border text-foreground px-4 py-2 rounded-full text-center font-semibold transition-all"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </ScrollReveal>

        {/* Technical Expertise */}
        <ScrollReveal direction="up" delay={0.2}>
          <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Technical Expertise</h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">{skill.name}</span>
                  <span className="text-primary font-bold">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-accent h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default About;