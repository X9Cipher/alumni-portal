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
  isActive?: boolean // Added for new stats
  graduationYear?: string // Added for new stats
  location?: string // Added for new stats
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newStudent, setNewStudent] = useState<Student>({
    _id: '',
    email: '',
    firstName: '',
    lastName: '',
    userType: 'student',
    isApproved: false,
    department: '',
    studentId: '',
    currentYear: '',
    phone: '',
    createdAt: '',
    isActive: true,
    graduationYear: '',
    location: '',
  })
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
        filterStatus === 'active' ? student.isActive : !student.isActive
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
      setActionLoading(studentId)
      
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading('create')
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newStudent.email,
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          userType: 'student',
          isApproved: true, // Assuming new students are approved
          department: newStudent.department,
          studentId: newStudent.studentId,
          currentYear: newStudent.currentYear, // This might need adjustment based on new logic
          phone: newStudent.phone,
          location: newStudent.location,
          graduationYear: newStudent.graduationYear,
        }),
      })

      if (response.ok) {
        await fetchStudents()
        setShowCreateModal(false)
        setNewStudent({
          _id: '',
          email: '',
          firstName: '',
          lastName: '',
          userType: 'student',
          isApproved: false,
          department: '',
          studentId: '',
          currentYear: '',
          phone: '',
          createdAt: '',
          isActive: true,
          graduationYear: '',
          location: '',
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create student')
      }
    } catch (error) {
      setError('Failed to create student')
    } finally {
      setActionLoading(null)
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
    <div className="p-6">
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
            <p className="text-red-100">Manage student profiles and activities</p>
              </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#a41a2f]">
                  <Download className="w-4 h-4 mr-2" />
              Export Students
                </Button>
            <Button 
              className="bg-white text-[#a41a2f] hover:bg-gray-100"
              onClick={() => setShowCreateModal(true)}
            >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+15% this month</span>
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
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.filter(s => s.isActive).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">98% active</span>
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
                <p className="text-sm text-gray-600">Current Year</p>
                <p className="text-3xl font-bold text-gray-900">{students.filter(s => {
                  const currentYear = new Date().getFullYear()
                  return s.graduationYear === currentYear.toString()
                }).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">Graduating soon</span>
                    </div>
                  </div>
              <Calendar className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{students.filter(s => {
                  const joinDate = new Date(s.createdAt)
                  const now = new Date()
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
                }).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">New registrations</span>
                    </div>
                  </div>
              <Users className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select 
                  value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
                </select>
                <select 
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
        </div>
        <div className="text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>

      {/* Students Directory */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Students Directory</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading students...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600 mb-4">No students match your current filters.</p>
              <Button 
                className="bg-[#a41a2f] hover:bg-[#8a1628]"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
                  {filteredStudents.map((student) => (
              <Card key={student._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-[#a41a2f] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <Badge className={student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {student.graduationYear}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{student.department}</span>
                          </div>
                          {student.studentId && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>ID: {student.studentId}</span>
                            </div>
                          )}
                          {student.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{student.location}</span>
                            </div>
                          )}
                            </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Email: {student.email}</span>
                          {student.phone && <span>• Phone: {student.phone}</span>}
                          <span>• Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                          <Button
                            size="sm"
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student._id)}
                        disabled={actionLoading === student._id}
                        >
                        {actionLoading === student._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Student</h2>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input 
                    value={newStudent.firstName} 
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input 
                    value={newStudent.lastName} 
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                    placeholder="Last name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    type="email"
                    value={newStudent.email} 
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <Input 
                    value={newStudent.phone} 
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <Input 
                    value={newStudent.studentId} 
                    onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                    placeholder="Student ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select 
                    value={newStudent.department} 
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <select 
                    value={newStudent.graduationYear} 
                    onChange={(e) => setNewStudent({...newStudent, graduationYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <Input 
                    value={newStudent.location} 
                    onChange={(e) => setNewStudent({...newStudent, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" className="bg-[#a41a2f] hover:bg-[#8a1628]">
                  Add Student
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}