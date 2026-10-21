/**
 * Aviso de versión nueva: banda roja, distinta de los avisos dorados y de los botones, para que
 * no se confunda con el resto de la pantalla. Solo aparece en Hoy (nunca durante la práctica).
 */
export function AvisoActualizacion({ alActualizar }: { alActualizar: () => void }) {
  return (
    <section
      role="status"
      aria-labelledby="aviso-actualizacion"
      className="space-y-3 rounded-3xl bg-destacado p-5 text-sobre-destacado shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)]"
    >
      <h2 id="aviso-actualizacion" className="text-xl font-semibold">
        Hay una versión nueva de la app
      </h2>
      <p className="text-sobre-destacado/90">Se actualiza en unos segundos. Tus registros no se tocan.</p>
      <button
        type="button"
        onClick={alActualizar}
        className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-full bg-sobre-destacado px-6 text-lg font-semibold text-destacado"
      >
        Actualizar ahora
      </button>
    </section>
  );
}
