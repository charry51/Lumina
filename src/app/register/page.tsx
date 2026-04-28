import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background font-sans text-foreground">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-heading text-foreground uppercase tracking-tighter mb-2">LUMINADD</h1>
        <p className="text-[10px] text-primary font-mono uppercase tracking-[6px] opacity-70">Sistemas de Inteligencia Visual</p>
      </div>

      <div className="cyber-card w-full max-w-md p-8 relative bg-card border border-border">
        <header className="mb-8">
          <h2 className="text-2xl font-heading text-foreground uppercase tracking-tight">Crea tu cuenta</h2>
          <p className="text-xs text-muted-foreground font-sans tracking-wide">Únete a la red de cartelería digital más avanzada.</p>
        </header>

        <form className="flex flex-col gap-6" action={signup}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Tu Correo Electrónico</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              className="bg-background border-border focus:border-primary transition-all rounded-none font-mono text-xs py-5"
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Crea una contraseña</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Mínimo 8 caracteres"
              className="bg-background border-border focus:border-primary transition-all rounded-none font-mono text-xs py-5"
              required 
            />
          </div>
          
          {resolvedSearchParams?.message && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-tighter">
              Aviso: {resolvedSearchParams.message}
            </div>
          )}

          <button className="cyber-button-cyan mt-4 py-4 text-[11px] font-black uppercase tracking-[3px]">
            Crear mi Cuenta
          </button>
        </form>

        <footer className="mt-10 pt-6 border-t border-border flex justify-center text-[10px] uppercase font-mono tracking-widest gap-2">
          <span className="text-zinc-600">¿Ya tienes acceso?</span>
          <Link href="/login" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
            Inicia Sesión
          </Link>
        </footer>
      </div>
      
    </div>
  )
}
