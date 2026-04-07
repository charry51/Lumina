import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Recuperar sesión activa (el middleware ya protege esta ruta, pero es buena práctica)
  const { data: { user } } = await supabase.auth.getUser()

  // Le pedimos a Supabase las pantallas
  const { data: pantallas, error } = await supabase
    .from('pantallas')
    .select('*')

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
        <h1 className="text-2xl font-bold mb-4">Error cargando datos</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-zinc-50 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Panel de Control</h1>
          <p className="text-zinc-500">Gestión de tus dispositivos y pantallas de señalización digital.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">
            {user?.email}
          </span>
          <form action={logout}>
            <Button variant="outline" type="submit">Cerrar Sesión</Button>
          </form>
        </div>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pantallas && pantallas.length > 0 ? (
          pantallas.map((pantalla: any) => (
            <Card key={pantalla.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{pantalla.nombre}</CardTitle>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    pantalla.estado === 'activa' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {pantalla.estado}
                  </span>
                </div>
                <CardDescription>{pantalla.ubicacion}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{pantalla.ciudad}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-zinc-300">
            <p className="text-zinc-500 italic">No se encontraron pantallas. Asegúrate de haber ejecutado el SQL de prueba.</p>
          </div>
        )}
      </div>
    </div>
  )
}
