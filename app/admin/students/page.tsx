"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  GraduationCap, 
  TrendingUp,
  Search,
  Bell,
  User,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Home,
  UserCheck,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Database,
  Settings,
  Shield,
  AlertTriangle,
  Loader2,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Briefcase
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Student {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: 'student'
  isApproved: boolean
  department: string
  studentId: string
  currentYear: string
  phone?: string
  createdAt: string
  lastActive?: string
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const router = useRouter()

  const departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Medicine']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']

  useEffect(() => {
    checkAuth()
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudentData()
  }, [students, searchTerm, filterStatus, filterDepartment, filterYear])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      if (data.user.userType !== 'admin') {
        router.push('/auth/login')
        return
      }
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/all-users')
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.users.students || [])
      } else {
        setError('Failed to fetch student data')
      }
    } catch (error) {
      setError('Failed to fetch student data')
    } finally {
      setLoading(false)
    }
  }

  const filterStudentData = () => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => 
        filterStatus === 'approved' ? student.isApproved : !student.isApproved
      )
    }

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(student => student.department === filterDepartment)
    }

    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter(student => student.currentYear === filterYear)
    }

    setFilteredStudents(filtered)
  }

  const handleApproveStudent = async (studentId: string, isApproved: boolean) => {
    try {
      setActionLoading(`${studentId}-${isApproved ? 'approve' : 'reject'}`)
      
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          userType: 'student',
          isApproved
        }),
      })

      if (response.ok) {
        await fetchStudents()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update student')
      }
    } catch (error) {
      setError('Failed to update student')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      setActionLoading(`${studentId}-delete`)
      
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          userType: 'student'
        }),
      })

      if (response.ok) {
        await fetchStudents()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete student')
      }
    } catch (error) {
      setError('Failed to delete student')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.clear()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading student management...</p>
        </div>
      </div>
    )
  }

  const approvedStudents = students.filter(s => s.isApproved).length
  const pendingStudents = students.filter(s => !s.isApproved).length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#a41a2f] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#a41a2f]" />
            </div>
            <div>
              <h2 className="font-semibold">Admin Panel</h2>
              <p className="text-sm text-red-100">System Management</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Main Menu</h3>
            <nav className="space-y-1">
              <a href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Home className="w-4 h-4" />
                Dashboard
              </a>
              <a href="/admin/alumni" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <GraduationCap className="w-4 h-4" />
                Alumni Management
              </a>
              <a href="/admin/students" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#a41a2f] bg-red-50 rounded-lg">
                <Users className="w-4 h-4" />
                Student Management
              </a>
              <a href="/admin/jobs" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Briefcase className="w-4 h-4" />
                Job Posts
              </a>
              <a href="/admin/events" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Calendar className="w-4 h-4" />
                Events
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                Messages
              </a>
            </nav>
          </div>



          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">System</h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="w-4 h-4" />
                System Settings
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Shield className="w-4 h-4" />
                Security
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </a>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">© 2024 Admin Panel</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-[#a41a2f] text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#a41a2f] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Admin User</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Page Header */}
          <div className="bg-[#a41a2f] text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Student Management</h1>
                <p className="text-red-100">Manage and monitor student accounts and academic progress</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="bg-white text-[#a41a2f] hover:bg-gray-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="secondary" className="bg-white text-[#a41a2f] hover:bg-gray-100">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+15% from last month</span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-gray-900">{approvedStudents}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">{Math.round((approvedStudents / students.length) * 100)}% approved</span>
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingStudents}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Awaiting approval</span>
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.floor(students.length * 0.85)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">85% activity rate</span>
                    </div>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending')}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>

                <select 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Student Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No students found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{student.firstName} {student.lastName}</h3>
                            <Badge variant={student.isApproved ? 'default' : 'secondary'}>
                              {student.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {student.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              Student ID: {student.studentId}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {student.department}
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {student.currentYear}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(student.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!student.isApproved && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveStudent(student._id, true)}
                            disabled={actionLoading === `${student._id}-approve`}
                          >
                            {actionLoading === `${student._id}-approve` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStudent(student._id)}
                          disabled={actionLoading === `${student._id}-delete`}
                        >
                          {actionLoading === `${student._id}-delete` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}