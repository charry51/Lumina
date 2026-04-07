import { supabase } from '@/lib/supabase'

export default async function DashboardPage() {
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Panel de Control</h1>
        <p className="text-zinc-500">Gestión de tus dispositivos y pantallas de señalización digital.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pantallas && pantallas.length > 0 ? (
          pantallas.map((pantalla: any) => (
            <div key={pantalla.id} className="p-6 border border-zinc-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-zinc-800">{pantalla.nombre}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  pantalla.estado === 'activa' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {pantalla.estado}
                </span>
              </div>
              <p className="text-zinc-600 text-sm mb-4">{pantalla.ubicacion}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{pantalla.ciudad}</span>
              </div>
            </div>
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
