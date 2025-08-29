import { Card, CardContent } from "@/components/ui/card";
import profileImage from "@/assets/formal.jpg";

const About = () => {
  const stats = [
    { number: "4+", label: "Industry Catered" },
    { number: "30+", label: "Successful Projects" },
    { number: "10+", label: "Satisfied Clients" },
    { number: "4+", label: "Satisfied Clients" },
  ];

  const skills = [
    { name: "Power BI", percentage: 95 },
    { name: "Tableu", percentage: 80 },
    { name: "Metabase", percentage: 90 },
    { name: "SQL", percentage: 90 },
    { name: "Python", percentage: 85 },
    { name: "Data Visualization", percentage: 95 },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-xl text-primary font-semibold">
            Turning complex data into clear, actionable insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Professional Journey</h3>
              <p className="text-muted-foreground leading-relaxed">
                Currently serving as an Data analytics Manager at Wagely Bangladesh, I specialize in 
                transforming complex Finantial and business data into actionable insights. 
                With over 7 years of experience across Fintech, consulting, and education 
                sectors, I've helped organizations optimize their data strategies and make 
                informed decisions.
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

          {/* Right Content - Image */}
          <div className="flex justify-center">
            <div className="relative w-80 h-100 rounded-2xl shadow-card pt-8">
              <img
                src={profileImage}
                alt="Salman Sakib - Data Analyst"
                className="w-80 h-80 object-cover rounded-2xl shadow-card object-top"
                style={{ objectPosition: 'center 20%' }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-hero opacity-10 mt-8"></div>
            </div>
          </div>
        </div>

        {/* Teaching & Mentoring */}
        <Card className="mb-16 shadow-card">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Teaching & Mentoring</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              As an instructor at DScentral, I'm passionate about sharing knowledge 
              and helping the next generation of data professionals. I provide corporate 
              training, one-on-one mentoring, and workshop facilitation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Consultation","Corporate Training", "Data Analysis", "Growth Strategy"].map((item, index) => (
                <div
                  key={index}
                  className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-center text-primary  font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Expertise */}
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
                    className="bg-gradient-hero h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;