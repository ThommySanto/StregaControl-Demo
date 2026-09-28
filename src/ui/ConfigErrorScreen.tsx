export default function ConfigErrorScreen() {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h1 className="mb-2 text-lg font-semibold text-amber-900">Configurazione mancante</h1>
        <p className="text-sm text-amber-800">
          Non trovo <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> e{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-left text-sm text-amber-800">
          <li>
            Copia <code className="rounded bg-amber-100 px-1">.env.example</code> in{' '}
            <code className="rounded bg-amber-100 px-1">.env</code> nella cartella del progetto.
          </li>
          <li>Incolla Project URL e anon public key dal tuo progetto Supabase.</li>
          <li>Riavvia <code className="rounded bg-amber-100 px-1">npm run dev</code> (obbligatorio dopo aver modificato .env).</li>
        </ol>
      </div>
    </div>
  )
}
