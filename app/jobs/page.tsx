import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  Bookmark,
  TrendingUp,
  Briefcase,
  Star,
  Filter,
} from "lucide-react"

export default function Jobs() {
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Spotify",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $160k",
      postedBy: "Sarah Mitchell",
      postedByAvatar: "/placeholder.svg?height=40&width=40",
      postedDate: "2 days ago",
      skills: ["React", "TypeScript", "GraphQL"],
      applicants: 12,
      description:
        "Join our team to build the next generation of music streaming experiences. We're looking for a passionate frontend developer to work on user-facing features.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "GraphQL knowledge"],
      benefits: ["Remote work", "Health insurance", "Stock options", "Learning budget"],
      isBookmarked: true,
      isUrgent: false,
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Airbnb",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$140k - $180k",
      postedBy: "Alex Morgan",
      postedByAvatar: "/placeholder.svg?height=40&width=40",
      postedDate: "1 week ago",
      skills: ["Product Strategy", "Analytics", "UX Research"],
      applicants: 8,
      description:
        "Lead product initiatives for our host experience platform. Drive product strategy and work with cross-functional teams.",
      requirements: ["3+ years PM experience", "Data-driven mindset", "B2B product experience"],
      benefits: ["Competitive salary", "Travel credits", "Health benefits", "Equity"],
      isBookmarked: false,
      isUrgent: true,
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "Netflix",
      location: "Los Gatos, CA",
      type: "Full-time",
      salary: "$130k - $170k",
      postedBy: "Lisa Park",
      postedByAvatar: "/placeholder.svg?height=40&width=40",
      postedDate: "3 days ago",
      skills: ["Python", "Machine Learning", "SQL"],
      applicants: 15,
      description:
        "Drive data-driven decisions for content recommendation algorithms. Work with large-scale data to improve user experience.",
      requirements: ["PhD in relevant field", "Python/R expertise", "ML model deployment"],
      benefits: ["Netflix subscription", "Flexible hours", "Top-tier health insurance"],
      isBookmarked: false,
      isUrgent: false,
    },
    {
      id: 4,
      title: "Software Engineering Intern",
      company: "Google",
      location: "Mountain View, CA",
      type: "Internship",
      salary: "$8k/month",
      postedBy: "Michael Chen",
      postedByAvatar: "/placeholder.svg?height=40&width=40",
      postedDate: "5 days ago",
      skills: ["Java", "Python", "Algorithms"],
      applicants: 45,
      description:
        "Summer internship opportunity working on core infrastructure projects. Mentorship from senior engineers.",
      requirements: ["CS student", "Strong coding skills", "Problem-solving ability"],
      benefits: ["Mentorship", "Housing stipend", "Free meals", "Networking"],
      isBookmarked: true,
      isUrgent: false,
    },
  ]

  const featuredCompanies = [
    { name: "Google", jobs: 12, logo: "/placeholder.svg?height=40&width=40" },
    { name: "Microsoft", jobs: 8, logo: "/placeholder.svg?height=40&width=40" },
    { name: "Amazon", jobs: 15, logo: "/placeholder.svg?height=40&width=40" },
    { name: "Meta", jobs: 6, logo: "/placeholder.svg?height=40&width=40" },
  ]

  const jobCategories = [
    { category: "Engineering", count: 45, icon: "💻" },
    { category: "Product", count: 23, icon: "📱" },
    { category: "Design", count: 18, icon: "🎨" },
    { category: "Data Science", count: 31, icon: "📊" },
    { category: "Marketing", count: 12, icon: "📢" },
  ]

  const recentApplications = [
    { company: "Spotify", role: "Frontend Developer", status: "Under Review", date: "2 days ago" },
    { company: "Netflix", role: "Data Scientist", status: "Interview Scheduled", date: "1 week ago" },
    { company: "Airbnb", role: "Product Manager", status: "Application Sent", date: "3 days ago" },
  ]

  const jobAlerts = [
    { query: "React Developer", count: 5 },
    { query: "Product Manager", count: 3 },
    { query: "Data Scientist", count: 8 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Job Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Job Categories
                </h3>
                <div className="space-y-3">
                  {jobCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded -m-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Companies */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Top Hiring Companies
                </h3>
                <div className="space-y-3">
                  {featuredCompanies.map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded -m-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img src={company.logo || "/placeholder.svg"} alt={company.name} className="w-8 h-8 rounded" />
                        <span className="text-sm font-medium">{company.name}</span>
                      </div>
                      <Badge variant="outline">{company.jobs} jobs</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View All Companies
                </Button>
              </CardContent>
            </Card>

            {/* Job Alerts */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Your Job Alerts
                </h3>
                <div className="space-y-2">
                  {jobAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                      <span className="text-blue-800">{alert.query}</span>
                      <Badge className="bg-blue-600">{alert.count} new</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                  Manage Alerts
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs & Internships</h1>
                <p className="text-gray-600">Opportunities shared by our alumni network</p>
              </div>
              <Button>Post a Job</Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Search jobs, companies, or skills..." className="pl-10" />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="sf">San Francisco</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="seattle">Seattle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Tabs */}
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
                <TabsTrigger value="saved">Saved ({jobs.filter((j) => j.isBookmarked).length})</TabsTrigger>
                <TabsTrigger value="applied">Applied (3)</TabsTrigger>
                <TabsTrigger value="alerts">Job Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4 mt-6">
                {/* Job Listings */}
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                    {job.title}
                                  </h3>
                                  {job.isUrgent && <Badge className="bg-red-600">Urgent</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {job.company}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {job.salary}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={job.type === "Internship" ? "outline" : "default"}>{job.type}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={job.isBookmarked ? "text-blue-600" : "text-gray-400"}
                                >
                                  <Bookmark className={`w-4 h-4 ${job.isBookmarked ? "fill-current" : ""}`} />
                                </Button>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{job.description}</p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            {/* Requirements & Benefits */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-800 mb-2">Requirements:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {job.requirements.map((req, reqIndex) => (
                                    <li key={reqIndex}>• {req}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-800 mb-2">Benefits:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {job.benefits.map((benefit, benefitIndex) => (
                                    <li key={benefitIndex}>• {benefit}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={job.postedByAvatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {job.postedBy
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>Posted by {job.postedBy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.postedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.applicants} applicants
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm">Apply Now</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center">
                  <Button variant="outline">Load More Jobs</Button>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                <div className="text-center py-8">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Saved Jobs</h3>
                  <p className="text-gray-600 mb-4">Jobs you've bookmarked will appear here</p>
                  <div className="space-y-4">
                    {jobs
                      .filter((job) => job.isBookmarked)
                      .map((job, index) => (
                        <Card key={index} className="text-left">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{job.title}</h4>
                                <p className="text-sm text-gray-600">
                                  {job.company} • {job.location}
                                </p>
                                <p className="text-sm text-gray-500">Saved {job.postedDate}</p>
                              </div>
                              <Button size="sm">Apply</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="applied" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Applications</h3>
                  {recentApplications.map((app, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{app.role}</h4>
                            <p className="text-sm text-gray-600">{app.company}</p>
                            <p className="text-sm text-gray-500">Applied {app.date}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={app.status === "Interview Scheduled" ? "default" : "secondary"}>
                              {app.status}
                            </Badge>
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              View Application
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Job Alerts</h3>
                    <Button>Create New Alert</Button>
                  </div>
                  {jobAlerts.map((alert, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{alert.query}</h4>
                            <p className="text-sm text-gray-600">{alert.count} new jobs this week</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Application Status */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Application Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Applied</span>
                    <span className="font-semibold text-blue-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Under Review</span>
                    <span className="font-semibold text-yellow-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Interviews</span>
                    <span className="font-semibold text-green-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Offers</span>
                    <span className="font-semibold text-purple-600">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-blue-800">💡 Career Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Customize your resume for each application</li>
                  <li>• Network with alumni at target companies</li>
                  <li>• Follow up on applications after 1 week</li>
                  <li>• Practice common interview questions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post a Job
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Refer a Friend
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Salary Insights
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Star className="w-4 h-4 mr-2" />
                    Company Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
