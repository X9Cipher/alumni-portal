"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function AlumniSettings() {
	const { user, loading } = useAuth()
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [saving, setSaving] = useState(false)

	const updatePassword = async () => {
		if (!newPassword || !currentPassword) return alert('Enter current and new password')
		if (newPassword !== confirmPassword) return alert('Passwords do not match')
		setSaving(true)
		try {
			const res = await fetch('/api/auth/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ currentPassword, newPassword })
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to update password')
			alert('Password updated successfully')
			setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
		} catch (e: any) {
			alert(e.message || 'Failed to update password')
		} finally {
			setSaving(false)
		}
	}
  return (
		<div className="max-w-3xl mx-auto space-y-6">
      <div>
        
        </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Login Information
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
						<Input id="current-email" value={loading ? "" : (user?.email || "")} disabled />
                <p className="text-xs text-gray-500">This is your login email and cannot be changed.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <Button disabled={saving} onClick={updatePassword} className="bg-green-600 hover:bg-green-700">{saving ? 'Updating...' : 'Update Password'}</Button>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}
