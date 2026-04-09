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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background font-sans text-foreground">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-heading text-zinc-100 uppercase tracking-tighter mb-2">Lumina</h1>
        <p className="text-[10px] text-primary font-mono uppercase tracking-[6px] opacity-70">Sistemas de Inteligencia Visual</p>
      </div>

      <div className="cyber-card w-full max-w-md p-8 relative">
        <header className="mb-8">
          <h2 className="text-2xl font-heading text-zinc-100 uppercase tracking-tight">Bienvenido a Lumina</h2>
          <p className="text-xs text-zinc-500 font-sans tracking-wide">Inicia sesión para gestionar tu red de pantallas.</p>
        </header>

        <form className="flex flex-col gap-6" action={login}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Correo Electrónico</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="tu@email.com" 
              className="bg-zinc-950 border-zinc-800 focus:border-primary transition-all rounded-none font-mono text-xs py-5"
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Contraseña</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 focus:border-primary transition-all rounded-none font-mono text-xs py-5"
              required 
            />
          </div>
          
          {resolvedSearchParams?.message && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-tighter">
              Aviso: {resolvedSearchParams.message}
            </div>
          )}

          <button className="cyber-button-cyan mt-4 py-4 text-[11px] font-black uppercase tracking-[3px]">
            Entrar al Dashboard
          </button>
        </form>

        <footer className="mt-10 pt-6 border-t border-zinc-900 flex justify-center text-[10px] uppercase font-mono tracking-widest gap-2">
          <span className="text-zinc-600">¿No tienes cuenta?</span>
          <Link href="/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
            Regístrate Gratis
          </Link>
        </footer>
      </div>
      
      <div className="mt-12 opacity-20 text-[9px] font-mono uppercase tracking-[4px]">
        Encrypted Protocol v4.0.2 // Market Ready Phase
      </div>
    </div>
  )
}
