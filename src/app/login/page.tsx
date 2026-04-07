import { login } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Entra a tu cuenta para gestionar tus pantallas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={login}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {resolvedSearchParams?.message && (
              <p className="mt-2 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                Error: {resolvedSearchParams.message}
              </p>
            )}
            <Button className="mt-4" type="submit">Entrar</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-zinc-500">
            ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
