export interface Internship {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  bannerUrl: string | null;
  videoUrl: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  companyIndustry: string | null;
  companyLocation: string | null;
  applicationCount: number;
  createdAt: string;
}

export interface MatchedInternship extends Internship {
  matchScore: number;
  matchedSkills: string[];
}
