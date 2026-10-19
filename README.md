# Mahamudrapp

App web instalable (PWA) para acompañar y registrar la práctica diaria del **programa de Mahamudra de Bokar Rinpoche** (linaje Karma Kagyu), tal como se enseña en el seminario dirigido por Lama Rinchen.

Cada día te muestra qué toca (la reflexión, el soporte de meditación y el preliminar del trimestre), cuenta postraciones y mantras, y guarda todo en el teléfono para que tengas los números del carnet sin depender del papel.

**La app es una herramienta, no una distracción.** No tiene rachas, felicitaciones, animaciones ni notificaciones. Se abre, se ve qué toca, se registra y se cierra.

> Estado: versión mínima para uso personal. Más adelante, si Lama Rinchen está de acuerdo, se ofrecerá al grupo del seminario.

**Abrir la app:** https://ezequielabregu.github.io/mahamudrapp/

## Qué hace hoy

- **Hoy:** fecha, trimestre y día del trimestre, reflexión y soporte del día con su página del libro, estado de la sesión de Shiné, postraciones del día y del trimestre con la meta diaria sugerida, y mantras de Chenresi del año.
- **Contador:** un botón grande que ocupa media pantalla, sumas rápidas (+10, +21, +108; +1 mala de Chenresi suma 100), "Deshacer el último", sonido suave opcional y pantalla siempre encendida. Cada toque se guarda al instante: si se corta la batería, no se pierde nada.
- **Registrar:** sesiones y conteos con fecha pasada, para la práctica hecha sin la app, y correcciones que restan.
- **Copia de seguridad:** exporta todos los registros en un archivo JSON, para enviarlo por WhatsApp, mail o Drive, o para descargarlo. Si pasan más de 7 días sin copia, la app lo recuerda.
- **Ajustes:** nivel de compromiso (mínimo, medio o completo), tamaño del texto, sonido y fecha de inicio del año de práctica (por defecto, 14 de octubre de 2026).
- Funciona **sin conexión** después de la primera carga.

## Instalarla en el teléfono

Conviene instalarla **antes** de empezar a registrar: lo que se anota en la pestaña del navegador no pasa a la app instalada.

- **iPhone o iPad:** abrí el enlace en **Safari**, tocá **Compartir** (el cuadrado con la flecha hacia arriba) y elegí **Agregar a inicio**. Solo Safari permite instalarla.
- **Android:** abrí el enlace en **Chrome** y tocá **Instalar app**, o el menú **⋮** y después **Instalar app**.

Desde entonces, abrila siempre con su ícono.

## Tus datos

- Todo queda **solo en tu dispositivo**. No hay servidor, cuentas ni login, y nada se envía a ningún lado.
- Los registros de práctica **nunca se editan ni se borran**: una corrección es un registro nuevo que resta.
- Como los datos viven en el teléfono, **hacé copias seguido** desde la sección Copia y guardalas fuera del teléfono.

## Desarrollo

Requiere Node.js 24 o posterior.

```bash
npm install
npm run dev          # servidor de desarrollo (agregá -- --host para verlo en el teléfono por wifi)
npm run test         # tests unitarios (Vitest)
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # build de producción en dist/
npm run preview      # sirve el build
```

Para probar el build tal como queda publicado:

```bash
BASE_PATH=/mahamudrapp/ npm run build
BASE_PATH=/mahamudrapp/ npm run preview
```

Por http en la red local la app no se instala ni funciona sin conexión: para eso necesita https.

**Stack:** TypeScript, React, Vite, Tailwind CSS, Dexie (IndexedDB), React Router en modo hash y `vite-plugin-pwa`.

**Despliegue:** cada push a `main` corre lint, tests y build, y publica en GitHub Pages (`.github/workflows/deploy.yml`). En el repo, **Settings → Pages → Source** tiene que estar en **GitHub Actions**.

### Estructura

```
src/
├─ content/programa.json   # el programa anual: trimestres, reflexiones, soportes, metas (solo datos)
├─ domain/                 # lógica pura con tests: calendario, conteos, resumen del día, fechas
├─ db/                     # esquema de Dexie y repositorio, la única puerta de escritura
├─ backup/                 # exportación de la copia
├─ audio/                  # sonido del contador
├─ pwa/                    # instalación
├─ hooks/  components/  screens/
```

`CLAUDE.md` tiene la guía completa del proyecto: principios, contenido de la práctica, modelo de datos, accesibilidad y hoja de ruta.

## Contenido y fuentes

El programa sale del cuadernillo del programa de Mahamudra de Bokar Rinpoche, y la estructura de las sesiones, de las indicaciones de Lama Rinchen en el seminario. Las páginas citadas corresponden al libro **"El Arco Iris de la Sabiduría"** (© Ediciones Claire Lumière, traducción revisada por Lama Rinchen Kandro).

El PDF del libro y la transcripción del seminario no se publican en este repositorio. La app no inventa prácticas ni instrucciones: ante una duda de contenido, se consulta antes de cargarla.

## Próximos pasos

1. Sesión guiada de Shiné y de postraciones, paso a paso con los textos, temporizador y cuenco.
2. Importar una copia, con fusión sin duplicados.
3. Estadísticas: regularidad, acumulados y el resumen en formato del carnet.
4. Textos y sesiones de los trimestres 2 a 4 (Vajrasattva, mandala, guru yoga).
5. Copia automática opcional en Google Drive.
6. Versión para el grupo, revisada con sus integrantes.
