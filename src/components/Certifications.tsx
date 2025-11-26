import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Award } from "lucide-react";

const Certifications = () => {
  const certifications = [
    {
      code: "PL-300",
      title: "Microsoft Certified: Power BI Data Analyst Associate",
      description: "Demonstrates expertise in creating Power BI reports and dashboards",
      skills: ["Data Modeling", "DAX", "Power Query", "Report Design"],
      verifyUrl: "https://learn.microsoft.com/api/credentials/share/en-us/Sulaiman-1779/D86F89EC13EB4F44?sharingId=2F8D8D7121F7566C"
    },
    {
      code: "DP-600",
      title: "Microsoft Certified: Fabric Analytics Engineer Associate",
      description: "Validates skills in implementing analytics solutions using Microsoft Fabric",
      skills: ["Data Lakehouse", "Data Factory", "Real-time Analytics", "Data Science"],
      verifyUrl: "https://learn.microsoft.com/api/credentials/share/en-us/Sulaiman-1779/4BF83C913084A933?sharingId=2F8D8D7121F7566C"
    },
    {
      code: "DP-700",
      title: "Microsoft Certified: Fabric Data Engineer Associate",
      description: "Demonstrates ability to design and implement data engineering solutions",
      skills: ["Data Pipelines", "Delta Lake", "Spark", "Data Governance"],
      verifyUrl: "https://learn.microsoft.com/api/credentials/share/en-us/Sulaiman-1779/BA7F6AE3F38244C0?sharingId=2F8D8D7121F7566C"
    },
    {
      code: "DP-203",
      title: "Microsoft Certified: Azure Data Engineer Associate",
      description: "Validates expertise in Azure data engineering services",
      skills: ["Azure Synapse", "Azure Data Factory", "Azure Databricks", "Cosmos DB"],
      verifyUrl: "https://learn.microsoft.com/api/credentials/share/en-us/Sulaiman-1779/8C147E65EC980BE4?sharingId=2F8D8D7121F7566C"
    }
  ];

  return (
    <section id="certifications" className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-4xl font-bold text-foreground">Certifications</h2>
          </div>
          <p className="text-xl text-muted-foreground">
            Validated expertise in data and analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {certifications.map((cert, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300 hover:border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="text-primary font-bold text-lg px-3 py-1">
                    {cert.code}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-hover"
                    asChild
                  >
                    <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-foreground leading-tight">
                  {cert.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {cert.description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Key Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="outline"
                        className="border-primary/30 text-primary bg-primary/5"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  asChild
                >
                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;