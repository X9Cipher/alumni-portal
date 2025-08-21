import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Plus, Search, Clock, Star, TrendingUp, Video } from "lucide-react"

export default function Events() {
  const events = [
    {
      id: 1,
      title: "Tech Alumni Meetup",
      date: "December 15, 2024",
      time: "6:00 PM - 9:00 PM",
      location: "San Francisco, CA",
      type: "In-Person",
      category: "Networking",
      organizer: "Sarah Mitchell",
      organizerAvatar: "/placeholder.svg?height=40&width=40",
      attendees: 45,
      maxAttendees: 60,
      description:
        "Join fellow tech alumni for networking, discussions about industry trends, and career opportunities. Great food and drinks provided!",
      image: "/placeholder.svg?height=200&width=400",
      tags: ["Tech", "Networking", "Career"],
      isRSVPed: true,
      isFeatured: true,
      price: "Free",
    },
    {
      id: 2,
      title: "Virtual Career Fair 2024",
      date: "December 20, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Virtual Event",
      type: "Virtual",
      category: "Career",
      organizer: "Alumni Association",
      organizerAvatar: "/placeholder.svg?height=40&width=40",
      attendees: 156,
      maxAttendees: 200,
      description:
        "Connect with top employers and explore career opportunities across various industries. Virtual booths, one-on-one sessions, and panel discussions.",
      image: "/placeholder.svg?height=200&width=400",
      tags: ["Career", "Jobs", "Virtual"],
      isRSVPed: false,
      isFeatured: true,
      price: "Free",
    },
    {
      id: 3,
      title: "Startup Pitch Night",
      date: "January 8, 2025",
      time: "7:00 PM - 10:00 PM",
      location: "New York, NY",
      type: "In-Person",
      category: "Entrepreneurship",
      organizer: "Raj Kumar",
      organizerAvatar: "/placeholder.svg?height=40&width=40",
      attendees: 28,
      maxAttendees: 40,
      description:
        "Watch alumni entrepreneurs pitch their startups and network with investors and founders. Prizes for best pitches!",
      image: "/placeholder.svg?height=200&width=400",
      tags: ["Startup", "Pitch", "Investment"],
      isRSVPed: true,
      isFeatured: false,
      price: "$25",
    },
    {
      id: 4,
      title: "Women in Tech Panel",
      date: "January 15, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Virtual Event",
      type: "Virtual",
      category: "Panel Discussion",
      organizer: "Lisa Park",
      organizerAvatar: "/placeholder.svg?height=40&width=40",
      attendees: 89,
      maxAttendees: 100,
      description:
        "Panel discussion featuring successful women alumni in technology leadership roles. Q&A session and networking breakouts.",
      image: "/placeholder.svg?height=200&width=400",
      tags: ["Women", "Tech", "Leadership"],
      isRSVPed: false,
      isFeatured: false,
      price: "Free",
    },
  ]

  const eventCategories = [
    { category: "Networking", count: 12, icon: "🤝" },
    { category: "Career", count: 8, icon: "💼" },
    { category: "Tech Talks", count: 15, icon: "💻" },
    { category: "Social", count: 6, icon: "🎉" },
    { category: "Workshops", count: 9, icon: "🛠️" },
  ]

  const upcomingEvents = [
    { title: "AI Workshop", date: "Dec 18", attendees: 23 },
    { title: "Holiday Party", date: "Dec 22", attendees: 67 },
    { title: "New Year Networking", date: "Jan 5", attendees: 45 },
  ]

  const myEvents = [
    { title: "Tech Alumni Meetup", date: "Dec 15", status: "Going", type: "RSVP" },
    { title: "Startup Pitch Night", date: "Jan 8", status: "Maybe", type: "RSVP" },
    { title: "Data Science Workshop", date: "Jan 12", status: "Interested", type: "Saved" },
  ]

  const eventStats = [
    { label: "Events Attended", value: 12 },
    { label: "Events Organized", value: 3 },
    { label: "Connections Made", value: 45 },
    { label: "Hours Networked", value: 28 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Event Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Event Categories
                </h3>
                <div className="space-y-3">
                  {eventCategories.map((category, index) => (
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

            {/* My Event Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Your Event Stats
                </h3>
                <div className="space-y-3">
                  {eventStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="font-semibold text-blue-600">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Meetups</h1>
                <p className="text-gray-600">Connect with alumni at upcoming events</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Search events..." className="pl-10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="my-events">My Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6 mt-6">
                {/* Featured Event */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-blue-600">Featured Event</Badge>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Tech Alumni Meetup</h2>
                        <p className="text-gray-700 mb-4">
                          Join fellow tech alumni for networking, discussions about industry trends, and career
                          opportunities. This is a great chance to reconnect with classmates and make new professional
                          connections.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            December 15, 2024 • 6:00 PM - 9:00 PM
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            San Francisco, CA
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            45 attending • 15 spots left
                          </div>
                        </div>
                        <Button size="lg">RSVP Now</Button>
                      </div>
                      <div className="relative">
                        <img
                          src="/placeholder.svg?height=250&width=400"
                          alt="Tech Alumni Meetup"
                          className="rounded-lg w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Grid */}
                <div className="space-y-4">
                  {events.slice(1).map((event, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="relative">
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Badge
                              className={`absolute top-3 right-3 ${event.type === "Virtual" ? "bg-green-600" : "bg-blue-600"}`}
                            >
                              {event.type}
                            </Badge>
                            {event.isFeatured && (
                              <Badge className="absolute top-3 left-3 bg-yellow-600">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{event.category}</Badge>
                                  <Badge variant={event.price === "Free" ? "secondary" : "outline"}>
                                    {event.price}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar className="w-4 h-4" />
                                {event.date} • {event.time}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Users className="w-4 h-4" />
                                {event.attendees} attending • {event.maxAttendees - event.attendees} spots left
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {event.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-end">
                              <Button variant="outline" size="sm" className="bg-transparent">View Details</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center">
                  <Button variant="outline">Load More Events</Button>
                </div>
              </TabsContent>

              <TabsContent value="my-events" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Events</h3>
                  {myEvents.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.date}</p>
                            <Badge variant="outline" className="mt-1">
                              {event.type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.status === "Going" ? "default" : "secondary"}>{event.status}</Badge>
                            <div className="mt-2">
                              <Button variant="outline" size="sm" className="bg-transparent">
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Past Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Alumni Homecoming 2024</h4>
                          <p className="text-sm text-gray-600">November 20, 2024 • 200 attendees</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">4.8/5</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Photos
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Rate Event
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Industry Leaders Panel</h4>
                          <p className="text-sm text-gray-600">October 15, 2024 • 150 attendees</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4].map((star) => (
                              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                            <span className="text-sm text-gray-600 ml-2">4.2/5</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Video className="w-4 h-4 mr-1" />
                            Recording
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Rate Event
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Saved Events</h3>
                  <p className="text-gray-600 mb-4">Events you're interested in will appear here</p>
                  <Button variant="outline">Browse Events</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upcoming Events Quick View */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Coming Up
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.date}</div>
                      <div className="text-xs text-gray-400">{event.attendees} attending</div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Event Recommendations */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Recommended
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-sm text-blue-800">AI & Machine Learning Workshop</div>
                    <div className="text-xs text-blue-600">Based on your interests</div>
                    <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                      Learn More
                    </Button>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-sm text-green-800">Startup Founders Meetup</div>
                    <div className="text-xs text-green-600">Popular in your network</div>
                    <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-blue-800">🎯 Event Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• RSVP early for popular events</li>
                  <li>• Bring business cards for networking</li>
                  <li>• Follow up with new connections</li>
                  <li>• Share events with your network</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
