import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { login } from '@/api/auth'
import { Logo } from '@/components/Logo'
import { HourglassIllustration } from '@/components/illustrations/HourglassIllustration'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate('/dashboard', { replace: true })
    },
  })

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden flex-1 flex-col items-center justify-center bg-brand-50/60 lg:flex">
        <HourglassIllustration />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Logo className="mb-8" />
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="mt-1 text-sm text-gray-500">Use your company provided Login credentials</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
            <Input
              id="userId"
              label="User ID"
              placeholder="Enter User ID"
              autoComplete="username"
              error={errors.userId?.message}
              {...register('userId')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <button type="button" className="self-start text-sm text-brand-600 hover:underline">
              Forgot password?
            </button>

            {mutation.isError && (
              <p className="text-sm text-red-500">
                Invalid credentials. Please check your User ID and password and try again.
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
