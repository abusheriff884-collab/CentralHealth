"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

type Hospital = {
  id: string
  name: string
  subdomain: string
  logo?: string
}

export default function HospitalPatientSignupPage() {
  const router = useRouter()
  const params = useParams()
  const hospitalSlug = params instanceof Promise ? React.use(params).hospitalName : (params?.hospitalName as string || '')

  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await fetch(`/api/hospitals/${hospitalSlug}`)
        if (!response.ok) throw new Error("Hospital not found")
        const data = await response.json()
        setHospital({
          id: data.id,
          name: data.name,
          subdomain: data.subdomain,
          logo: data.logo || "/placeholder.svg?height=40&width=40",
        })
      } catch (err) {
        console.error("Error fetching hospital:", err)
        router.push("/auth/signup")
      }
    }
    if (hospitalSlug) {
      fetchHospital()
    }
  }, [hospitalSlug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      toast.error("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationType: 'basic',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || data.message || "Registration failed. Please try again.")
        toast.error("Registration failed")
        return
      }

      toast.success("Account created successfully!", {
        description: "You can now sign in to the patient portal.",
      })

      setTimeout(() => {
        router.push(`/${hospitalSlug}/auth/patient-login?email=${encodeURIComponent(formData.email)}`)
      }, 1200)
    } catch (err) {
      console.error("Patient registration error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const hospitalLabel = hospital?.name || hospitalSlug

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950/20 dark:via-background dark:to-green-950/20 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src={hospital?.logo || "/placeholder.svg"} alt={hospitalLabel} className="w-12 h-12 rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold">{hospitalLabel}</h1>
          <p className="text-muted-foreground flex items-center justify-center space-x-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Create a Patient Account</span>
          </p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Patient Registration</CardTitle>
            <CardDescription>Create your account to access health services at {hospitalLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+232 76 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Patient Account"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={`/${hospitalSlug}/auth/patient-login`} className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-4 flex items-center space-x-2 p-3 bg-secondary/20 rounded-lg">
              <Heart className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                After registration you will receive a permanent Medical ID used across all health facilities in the nation.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${hospitalSlug}/home`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {hospitalLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}