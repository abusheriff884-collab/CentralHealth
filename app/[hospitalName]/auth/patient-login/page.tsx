"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Eye, EyeOff, ArrowLeft, Building2 } from "lucide-react"
import { toast } from "sonner"

type Hospital = {
  id: string
  name: string
  subdomain: string
  logo?: string
}

export default function HospitalPatientLoginPage() {
  const router = useRouter()
  const params = useParams()
  const hospitalSlug = params instanceof Promise ? React.use(params).hospitalName : (params?.hospitalName as string || '')

  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
        if (data.admin_email) {
          setFormData((prev) => ({ ...prev, email: "" }))
        }
      } catch (err) {
        console.error("Error fetching hospital:", err)
        router.push("/auth/login")
      }
    }
    if (hospitalSlug) {
      fetchHospital()
    }
  }, [hospitalSlug, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/patients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        const code = data.error || ''
        if (code === 'USER_NOT_FOUND') {
          setError('Account not found. Please register first or check your email address.')
        } else if (code === 'INVALID_PASSWORD') {
          setError('Incorrect password. Please try again.')
        } else {
          setError(data.message || 'Login failed. Please check your credentials.')
        }
        return
      }

      if (data.patient && data.token) {
        localStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('auth_token', data.token)
        if (data.patient.mrn) {
          localStorage.setItem('medicalNumber', data.patient.mrn)
          sessionStorage.setItem('medicalNumber', data.patient.mrn)
        }
        if (data.patient.id) {
          localStorage.setItem('patientId', data.patient.id)
          sessionStorage.setItem('patientId', data.patient.id)
        }
        if (data.patient.name) {
          localStorage.setItem('patientName', data.patient.name)
          sessionStorage.setItem('patientName', data.patient.name)
        }
        if (data.patient.email) {
          localStorage.setItem('userEmail', data.patient.email)
          sessionStorage.setItem('userEmail', data.patient.email)
        }
      }

      toast.success('Login successful', {
        description: hospital ? `Welcome to ${hospital.name} Patient Portal` : 'Welcome to the Patient Portal',
      })

      setTimeout(() => {
        const form = document.createElement('form')
        form.method = 'GET'
        form.action = '/patient/dashboard'
        document.body.appendChild(form)
        form.submit()
      }, 1200)
    } catch (err) {
      console.error('Patient login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const hospitalLabel = hospital?.name || hospitalSlug

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950/20 dark:via-background dark:to-green-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src={hospital?.logo || "/placeholder.svg"} alt={hospitalLabel} className="w-12 h-12 rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold">{hospitalLabel}</h1>
          <p className="text-muted-foreground flex items-center justify-center space-x-2">
            <Heart className="h-4 w-4 text-primary" />
            <span>Patient Portal Login</span>
          </p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your email and password to access your health records at {hospitalLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href={`/${hospitalSlug}/auth/patient-signup`} className="text-primary font-medium hover:underline">
                Create Patient Account
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${hospitalSlug}/home`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {hospitalLabel}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${hospitalSlug}/auth/login`}>
              <Building2 className="h-4 w-4 mr-2" />
              Staff Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}