const COLORES = [
  'bg-lungta-azul',
  'bg-lungta-blanco',
  'bg-lungta-rojo',
  'bg-lungta-verde',
  'bg-lungta-amarillo',
];

/** Franja con los cinco colores de las banderas de oración, en su orden tradicional. */
export function Lungta() {
  return (
    <div aria-hidden="true" className="flex h-1.5 w-full">
      {COLORES.map((c) => (
        <span key={c} className={`flex-1 ${c}`} />
      ))}
    </div>
  );
}
