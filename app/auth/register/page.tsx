"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    student: {
      firstName: "",
      lastName: "",
      email: "",
      studentId: "",
      currentYear: "",
      department: "",
      password: ""
    },
    alumni: {
      firstName: "",
      lastName: "",
      email: "",
      graduationYear: "",
      department: "",
      currentCompany: "",
      currentPosition: "",
      password: ""
    }
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
    setSuccess("")
  }

  const handleRegister = async (userType: string) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const currentFormData = formData[userType as keyof typeof formData]
      
      // Basic validation
      const requiredFields = userType === "student" 
        ? ["firstName", "lastName", "email", "studentId", "currentYear", "department", "password"]
        : ["firstName", "lastName", "email", "graduationYear", "department", "password"]

      for (const field of requiredFields) {
        if (!currentFormData[field as keyof typeof currentFormData]) {
          setError(`Please fill in all required fields`)
          setLoading(false)
          return
        }
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentFormData,
          userType: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess(data.message)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)

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
          <h1 className="text-3xl font-bold text-gray-900">Join Alumni Portal</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="alumni" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Alumni
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-first-name">First Name</Label>
                    <Input 
                      id="student-first-name" 
                      placeholder="John"
                      value={formData.student.firstName}
                      onChange={(e) => handleInputChange("student", "firstName", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-last-name">Last Name</Label>
                    <Input 
                      id="student-last-name" 
                      placeholder="Doe"
                      value={formData.student.lastName}
                      onChange={(e) => handleInputChange("student", "lastName", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Student Email</Label>
                  <Input 
                    id="student-email" 
                    type="email" 
                    placeholder="john.doe@college.edu"
                    value={formData.student.email}
                    onChange={(e) => handleInputChange("student", "email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input 
                    id="student-id" 
                    placeholder="STU2024001"
                    value={formData.student.studentId}
                    onChange={(e) => handleInputChange("student", "studentId", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-year">Current Year</Label>
                  <Select 
                    value={formData.student.currentYear}
                    onValueChange={(value) => handleInputChange("student", "currentYear", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-department">Department</Label>
                  <Select 
                    value={formData.student.department}
                    onValueChange={(value) => handleInputChange("student", "department", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">MCA</SelectItem>
                      <SelectItem value="ece">MBA</SelectItem>
                      <SelectItem value="me">BCA</SelectItem>
                      <SelectItem value="ce">BBA</SelectItem>
                      <SelectItem value="ee">B.COM</SelectItem>
                      <SelectItem value="ee">M.COM</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={() => handleRegister("student")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as Student"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="alumni" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alumni-first-name">First Name</Label>
                    <Input 
                      id="alumni-first-name" 
                      placeholder="Jane"
                      value={formData.alumni.firstName}
                      onChange={(e) => handleInputChange("alumni", "firstName", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alumni-last-name">Last Name</Label>
                    <Input 
                      id="alumni-last-name" 
                      placeholder="Smith"
                      value={formData.alumni.lastName}
                      onChange={(e) => handleInputChange("alumni", "lastName", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni-email">Email</Label>
                  <Input 
                    id="alumni-email" 
                    type="email" 
                    placeholder="jane.smith@company.com"
                    value={formData.alumni.email}
                    onChange={(e) => handleInputChange("alumni", "email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation-year">Graduation Year</Label>
                  <Select 
                    value={formData.alumni.graduationYear}
                    onValueChange={(value) => handleInputChange("alumni", "graduationYear", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                      <SelectItem value="2019">2019</SelectItem>
                      <SelectItem value="2018">2018</SelectItem>
                      <SelectItem value="2017">2017</SelectItem>
                      <SelectItem value="2016">2016</SelectItem>
                      <SelectItem value="2015">2015</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni-department">Department</Label>
                  <Select 
                    value={formData.alumni.department}
                    onValueChange={(value) => handleInputChange("alumni", "department", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mca">MCA</SelectItem>
                      <SelectItem value="mba">MBA</SelectItem>
                      <SelectItem value="bca">BCA</SelectItem>
                      <SelectItem value="bba">BBA</SelectItem>
                      <SelectItem value="bcom">B.COM</SelectItem>
                      <SelectItem value="bcomh">B.COM(H)</SelectItem>
                      <SelectItem value="mcom">M.COM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-company">Current Company</Label>
                  <Input 
                    id="current-company" 
                    placeholder="Google"
                    value={formData.alumni.currentCompany}
                    onChange={(e) => handleInputChange("alumni", "currentCompany", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-role">Current Role</Label>
                  <Input 
                    id="current-role" 
                    placeholder="Software Engineer"
                    value={formData.alumni.currentPosition}
                    onChange={(e) => handleInputChange("alumni", "currentPosition", e.target.value)}
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
                  onClick={() => handleRegister("alumni")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register as Alumni"
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
