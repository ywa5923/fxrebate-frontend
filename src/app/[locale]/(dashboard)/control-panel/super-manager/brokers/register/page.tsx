"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { BASE_URL } from '@/constants'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  broker_type_name: z.string().min(1, {
    message: 'Broker type is required.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  trading_name: z.string().min(2, {
    message: 'Trading name must be at least 2 characters.',
  }),
  registration_language: z.string().min(1, {
    message: 'Registration language is required.',
  }),
  registration_zone: z.string().min(1, {
    message: 'Registration zone is required.',
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterBrokerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      broker_type_name: '',
      email: '',
      trading_name: '',
      registration_language: 'en',
      registration_zone: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${BASE_URL}/register-broker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Broker registered successfully!')
        form.reset()
        router.push('/en/control-panel/super-manager/brokers')
      } else {
        toast.error(data.message || 'Failed to register broker')
      }
    } catch (error) {
      toast.error('An error occurred while registering the broker')
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-0">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Register New Broker</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter the details to register a new broker in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <FormField
                control={form.control}
                name="broker_type_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broker Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select broker type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Brokers">Brokers</SelectItem>
                        <SelectItem value="Challenge">Challenge</SelectItem>
                        <SelectItem value="Copy Trading">Copy Trading</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      The category or type of broker being registered.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trading_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Trading Ltd" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      The official trading name of the broker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="broker@example.com" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      The primary contact email for this broker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      The preferred language for broker communications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Zone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="US">US</SelectItem>
                        <SelectItem value="ASIA">ASIA</SelectItem>
                        <SelectItem value="LATAM">LATAM</SelectItem>
                        <SelectItem value="MENA">MENA</SelectItem>
                        <SelectItem value="GLOBAL">GLOBAL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      The geographical zone where this broker operates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-green-700 hover:bg-green-800 w-full sm:w-auto h-11 text-base font-medium"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Registering...' : 'Register Broker'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/en/control-panel/super-manager/brokers')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

