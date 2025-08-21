import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, Activity, Calendar, MessageSquare } from "lucide-react"

export default function Analytics() {
  const metrics = [
    {
      title: "Total Users",
      value: "2,156",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "User Engagement",
      value: "85.2%",
      change: "+5.2%",
      trend: "up",
      icon: Activity,
      description: "Daily active users",
    },
    {
      title: "Events Created",
      value: "47",
      change: "-2.1%",
      trend: "down",
      icon: Calendar,
      description: "Events this month",
    },
    {
      title: "Messages Sent",
      value: "12,847",
      change: "+18.3%",
      trend: "up",
      icon: MessageSquare,
      description: "Messages this month",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#a41a2f] mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor platform performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#a41a2f] hover:bg-red-700">Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-[#a41a2f]" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {metric.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-[#a41a2f] mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#a41a2f]">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-[#a41a2f]" />
                <p>User Growth Chart</p>
                <p className="text-sm">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#a41a2f]">Daily Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-[#a41a2f]" />
                <p>Engagement Chart</p>
                <p className="text-sm">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#a41a2f]">Top Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-sm">Post Title {i}</div>
                  <div className="text-xs text-gray-500">by User {i}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#a41a2f]">{100 - i * 10} likes</div>
                  <div className="text-xs text-gray-500">{50 - i * 5} comments</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#a41a2f]">User Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Students</span>
                <span className="font-semibold text-[#a41a2f]">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#a41a2f] h-2 rounded-full" style={{ width: "42%" }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Alumni</span>
                <span className="font-semibold text-[#a41a2f]">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#a41a2f] h-2 rounded-full" style={{ width: "58%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#a41a2f]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "New user registered", time: "2 min ago" },
              { action: "Job post created", time: "5 min ago" },
              { action: "Event scheduled", time: "10 min ago" },
              { action: "Message sent", time: "15 min ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-sm">{activity.action}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
