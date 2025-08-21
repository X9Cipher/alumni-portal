"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    student: { email: "", password: "" },
    alumni: { email: "", password: "" },
    admin: { email: "", password: "" }
  })

  const handleInputChange = (userType: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [userType]: {
        ...prev[userType as keyof typeof prev],
        [field]: value
      }
    }))
    setError("")
  }

  const handleLogin = async (userType: string) => {
    setLoading(true)
    setError("")

    try {
      const currentFormData = formData[userType as keyof typeof formData]
      
      if (!currentFormData.email || !currentFormData.password) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentFormData.email,
          password: currentFormData.password,
          userType: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store user data in localStorage
      localStorage.setItem("userType", userType)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on user type
      if (userType === "admin") {
        router.push("/admin")
      } else if (userType === "student") {
        router.push("/student")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Alumni Portal</h1>
          <p className="text-gray-600">Connect & Grow Together</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="alumni" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Alumni
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Student Email</Label>
                  <Input 
                    id="student-email" 
                    type="email" 
                    placeholder="student@college.edu"
                    value={formData.student.email}
                    onChange={(e) => handleInputChange("student", "email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input 
                    id="student-password" 
                    type="password"
                    value={formData.student.password}
                    onChange={(e) => handleInputChange("student", "password", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin("student")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In as Student"
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="alumni" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="alumni-email">Alumni Email</Label>
                  <Input 
                    id="alumni-email" 
                    type="email" 
                    placeholder="alumni@company.com"
                    value={formData.alumni.email}
                    onChange={(e) => handleInputChange("alumni", "email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni-password">Password</Label>
                  <Input 
                    id="alumni-password" 
                    type="password"
                    value={formData.alumni.password}
                    onChange={(e) => handleInputChange("alumni", "password", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin("alumni")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In as Alumni"
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline">
                    Register here
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input 
                    id="admin-email" 
                    type="email" 
                    placeholder="admin@college.edu"
                    value={formData.admin.email}
                    onChange={(e) => handleInputChange("admin", "email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password"
                    value={formData.admin.password}
                    onChange={(e) => handleInputChange("admin", "password", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleLogin("admin")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In as Admin"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
