# CLAUDE.md

Guía para Claude Code en este repositorio. Leer completo antes de escribir código.

## 1. Qué es este proyecto

App web instalable (PWA) para organizar y registrar la práctica diaria del **programa de Mahamudra de Bokar Rinpoche** (linaje Karma Kagyu), tal como se enseña en el seminario dirigido por Lama Rinchen.

Cada día, la app le dice al practicante qué hacer en cada sesión, lo guía paso a paso con los textos (fonética tibetana y español), mide el tiempo con sonido de cuenco, cuenta postraciones y mantras, y registra todo para mostrar estadísticas de avance.

- **Etapa actual:** uso personal del autor (Ezequiel). Cuando la app funcione bien, se la mostrará a Lama Rinchen; si está de acuerdo, se avanza con la versión grupal.
- **Etapa futura:** distribución al grupo del seminario, que incluye varios **adultos mayores con pocos conocimientos tecnológicos**. Toda decisión de diseño debe pensar en ellos.
- Una sola app para Android, iPhone y iPad. No hay versión nativa ni publicación en tiendas.

Documento de producto con las decisiones y su justificación: `docs/arquitectura.md`.

## 2. Principios no negociables

La máxima: **la app es una herramienta, nunca una distracción.** Ante cualquier duda de diseño, elegir lo que menos llama la atención y lo que menos tiempo de pantalla pide. Abrirla, ver qué toca, registrar y cerrarla.

1. **Nunca perder datos de práctica.** Son años de registros. Toda escritura es inmediata, los registros solo se agregan (nunca se editan ni se borran) y siempre hay una vía de respaldo. Única excepción: el borrado total desde Ajustes, a pedido del autor, con resguardos (ver 7).
2. **Local primero.** Los datos viven en el dispositivo. No hay servidor propio, ni cuentas, ni login obligatorio.
3. **Funciona sin conexión.** Después de la primera carga, todo (textos, audio, estadísticas) funciona offline.
4. **Accesible para adultos mayores.** Letra grande, alto contraste, botones enormes, cero gestos ocultos.
5. **Sobria.** La app acompaña la práctica, no distrae de ella. Nada de gamificación ruidosa, badges ni notificaciones push.
6. **Fiel a la enseñanza.** El contenido (programa, textos, páginas) se toma de las fuentes documentadas en la sección 6. No inventar prácticas ni instrucciones.
7. **Simple de mantener.** Pocas dependencias, todas estándar y con buen mantenimiento.

## 3. Stack

| Capa | Elección |
| --- | --- |
| Lenguaje | TypeScript (modo `strict`) |
| UI | React 18+ |
| Build y dev server | Vite |
| Estilos | Tailwind CSS v4 |
| Tipografías | `@fontsource-variable/atkinson-hyperlegible-next` y `@fontsource-variable/fraunces` (ver 8.5) |
| Base de datos local | Dexie.js (sobre IndexedDB) |
| PWA, offline, actualizaciones | `vite-plugin-pwa` (Workbox) |
| Ruteo | React Router (modo hash, compatible con GitHub Pages) |
| Gráficos | SVG propio (sin librería: pocos gráficos, más liviano y accesible) |
| Fechas | `src/domain/fechas.ts`: fechas locales `YYYY-MM-DD` con aritmética en UTC (sin librería) |
| IDs | `nuevoId()` en `src/db/ids.ts`: `crypto.randomUUID()` con alternativa para http en la red local |
| Tests unitarios | Vitest (+ `fake-indexeddb` para el repositorio) |
| Tests end to end | Playwright (perfiles móvil iPhone y Android), pendiente |
| Lint y formato | ESLint + Prettier |
| Hosting | GitHub Pages vía GitHub Actions (repo público) |

No agregar librerías de estado global (Redux, Zustand, etc.) salvo necesidad demostrada: alcanza con hooks de React y `useLiveQuery` de Dexie. No usar Bootstrap ni librerías de componentes pesadas.

**Hosting y origen de los datos.** IndexedDB queda atado al origen (dominio). En `usuario.github.io` todos los proyectos de Pages comparten origen, y mudar la app a otro dominio obliga a exportar e importar. Para la etapa personal alcanza con GitHub Pages; **antes de repartir la app al grupo**, fijar la URL definitiva, idealmente un subdominio propio (por ejemplo `mahamudra.ezequielabregu.net`, como dominio personalizado de Pages o en el VPS) y no cambiarla más.

**Textos y repo público.** El repo es público. Se publican solo los textos que usa la app; el PDF del libro y la transcripción del seminario (tiene nombres y comentarios de participantes) están en `.gitignore`. Antes de distribuir al grupo, consultar a Lama Rinchen por el uso de los textos (© Claire Lumière).

## 4. Comandos

```bash
npm install          # dependencias
npm run dev          # servidor de desarrollo (usar --host para probar en el teléfono por wifi)
npm run build        # build de producción en dist/
npm run preview      # sirve el build localmente
npm run test         # Vitest
npm run test:e2e     # Playwright
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

El despliegue ocurre solo al hacer push a `main` (workflow `.github/workflows/deploy.yml`). La ruta base sale de la variable `BASE_PATH` (el workflow la pone en `/<nombre-del-repo>/`; con dominio propio va `/`). Repo: `https://github.com/ezequielabregu/mahamudrapp`, así que la app queda en `https://ezequielabregu.github.io/mahamudrapp/`. Para probar el build local: `BASE_PATH=/mahamudrapp/ npm run build && BASE_PATH=/mahamudrapp/ npm run preview`.

Node.js se instaló con Homebrew (`brew install node`).

Antes de dar una tarea por terminada: `npm run typecheck && npm run lint && npm run test`.

## 5. Estructura del repositorio

```
/
├─ CLAUDE.md
├─ referencias/
│  ├─ Arco Iris, COMPLETO.pdf               # textos de las plegarias (no se versiona)
│  ├─ Mahamudra_guia_de_practica_compressed.pdf  # fotos del cuadernillo (no se versiona)
│  ├─ Programa_Mahamudra_Bokar_Rinpoche.xlsx      # transcripción del cuadernillo, también en formato de datos
│  └─ indicaciones_Lama_Rinchen.md          # transcripción del seminario (no se versiona)
├─ public/
│  ├─ audio/                   # cuenco-inicio.mp3, cuenco-fin.mp3, campana.mp3, tick.mp3
│  └─ icons/                   # íconos PWA (192, 512, maskable, apple-touch-icon)
├─ src/
│  ├─ content/                 # datos del programa, SOLO datos, sin lógica
│  │  ├─ programa.json         # trimestres, semana tipo, metas
│  │  ├─ sesiones.json         # estructura de pasos de cada tipo de sesión
│  │  ├─ textos.json           # plegarias: fonética, español, páginas
│  │  └─ reflexiones.json      # guías breves de las 4 reflexiones y del tong-len
│  ├─ domain/                  # lógica pura y testeable (sin React, sin Dexie)
│  │  ├─ calendario.ts         # qué toca hoy: trimestre, día, reflexión, soporte
│  │  ├─ estadisticas.ts       # regularidad, rachas, acumulados, proyecciones
│  │  └─ conteos.ts            # sumas con correcciones
│  ├─ db/
│  │  ├─ schema.ts             # Dexie: tablas, índices, versiones y migraciones
│  │  └─ repositorio.ts        # única puerta de lectura y escritura a la base
│  ├─ backup/
│  │  ├─ exportar.ts           # JSON completo y CSV
│  │  ├─ importar.ts           # restauración con validación y deduplicación por id
│  │  └─ googleDrive.ts        # etapa 2 (ver 9.3)
│  ├─ audio/                   # reproducción de cuencos (ver 8.3)
│  ├─ components/              # componentes de UI reutilizables
│  ├─ screens/                 # Hoy, Programa, Contador, Registrar, Respaldo, Ajustes, Instalar (y luego Practica, Estadisticas)
│  ├─ hooks/
│  └─ main.tsx
└─ tests/e2e/
```

Regla: la lógica de negocio va en `src/domain/` como funciones puras, con tests unitarios. Los componentes solo presentan.

## 6. Contenido de la práctica

### 6.1 Fuentes

1. **Cuadernillo del programa anual** (`referencias/Mahamudra_guia_de_practica_compressed.pdf` y su transcripción en `referencias/Programa_Mahamudra_Bokar_Rinpoche.xlsx`): semana tipo por trimestre, niveles, metas y "recuento".
2. **Transcripción del seminario con Lama Rinchen** (`referencias/indicaciones_Lama_Rinchen.md`): estructura de las sesiones e instrucciones.
3. **"El Arco Iris de la Sabiduría"** (`referencias/Arco Iris, COMPLETO.pdf`): textos de las plegarias.

Ante una duda de contenido, no inventar: dejar un `TODO(contenido)` y preguntar al autor.

### 6.2 Programa anual

- El año de práctica arranca en **octubre de 2026** (fecha de inicio configurable en Ajustes; por defecto `2026-10-14`). Cada trimestre dura 3 meses.
- **Nivel** del programa (1 a 6), elegido en Ajustes. Metas por nivel según "La progresión de las prácticas" del cuadernillo, en `programa.json` → `niveles` y `src/domain/niveles.ts`:
  - Niveles 2 y 3: 10.000 de cada preliminar y 100.000 de Chenresi.
  - Niveles 4 y 5: continuar con los preliminares (sin meta), 1 millón de mantras del yidam (exterior, interior), Chenresi optativo.
  - Nivel 6: 1 millón de mantras del yidam secreto; los preliminares ya no forman parte del compromiso.
  - TODO(contenido): el cuadernillo no dice si la semana tipo, las sesiones o el texto "Shiné sin soporte (o lhaktong)" cambian en los niveles 2 a 6. Por ahora todos los niveles ven el mismo programa semanal.
- Compromiso del Nivel 1, elegido en Ajustes (por defecto, **Medio**):
  - **Mínimo:** media hora de meditación por día + 100.000 mantras de Chenresi al año.
  - **Medio:** lo mismo + 5.000 de cada preliminar.
  - **Completo:** lo mismo + 10.000 de cada preliminar.
- Preliminar de cada trimestre: 1º postraciones (refugio), 2º mantras de Vajrasattva, 3º ofrendas de mandala, 4º plegarias de guru yoga.

Semana tipo. Las **reflexiones** son iguales en los cuatro trimestres:

| Día | Reflexión preliminar |
| --- | --- |
| Lunes | La preciosa existencia humana |
| Martes | Bodhicitta y breve visualización de tong-len |
| Miércoles | La muerte y la impermanencia |
| Jueves | Bodhicitta y breve visualización de tong-len |
| Viernes | La ley del karma |
| Sábado | Bodhicitta y breve visualización de tong-len |
| Domingo | La naturaleza decepcionante del samsara |

**Soportes de meditación** por trimestre:

| Día | 1º trimestre | 2º trimestre | 3º trimestre | 4º trimestre |
| --- | --- | --- | --- | --- |
| Lunes | 7 veces 21 respiraciones | 7 veces 21 respiraciones | 7 veces 21 respiraciones | Shiné sin soporte |
| Martes | Los cinco elementos | Los cinco elementos | Tigle en el entrecejo | 7 veces 21 respiraciones |
| Miércoles | Soporte exterior impuro de pequeño tamaño | Tigle en el entrecejo | Shiné sin soporte | Shiné sin soporte |
| Jueves | Tigle en el entrecejo | Buda visualizado enfrente | Buda visualizado enfrente | Tigle en el entrecejo |
| Viernes | Buda visualizado enfrente | Shiné sin soporte | Shiné sin soporte | Shiné sin soporte |
| Sábado | Tigle (o Lama) en el corazón | Tigle (o Lama) en el corazón | Tigle (o Lama) en el corazón | Tigle (o Lama) en el corazón |
| Domingo | Shiné sin soporte | Shiné sin soporte | Shiné sin soporte | Shiné sin soporte |

"Shiné sin soporte" puede figurar como "(o lhaktong)" según el nivel. Todo esto va en `programa.json`, nunca hardcodeado en componentes.

### 6.3 Páginas: libro impreso vs PDF

**La app siempre muestra la página del libro**, la que da Lama Rinchen y la que figura en el índice. Verificado en todo el PDF: **el número de página del visor del PDF coincide con la página del libro** (8 refugio, 12 Milarepa, 13 linaje, 23 resumen, 69 dedicación, 71 a 86 abreviados, 87 Chenresi, 118 Aspiración, 268 Dedicaciones). El número impreso dentro de cada página del PDF es un resto del borrador (corrido en 2 y después en 18): ignorarlo. Cada texto en `textos.json` guarda una sola página:

```json
{
  "id": "refugio-breve",
  "titulo": "Refugio",
  "pagina": 8,
  "repeticiones": 3,
  "fonetica": ["SANGYE CHÖ DANG TSOK KYI CHOK NAM LA /", "..."],
  "espanol": ["En el Buda, el dharma y la sanga sublime,", "..."]
}
```

| Texto | Página |
| --- | --- |
| Refugio breve | 8 |
| Invocación a Milarepa | 12 |
| Corta plegaria al linaje | 13 |
| Preliminares comunes (resumen de las 4 reflexiones) | 23 |
| Deseos de dedicación (dos estrofas) | 69 |
| Preliminares abreviados (inicio) | 71 |
| Visualización del refugio: desde "RANG DÜN NAM KAR..." (p. 72) hasta "Concentrados, nos refugiamos..." (p. 73), leer una vez | 72 y 73 |
| Refugio que se repite con cada postración: las tres líneas de "DA DANG SEMCHEN TAMCHE..." | 73 |
| Voto de bodhisattva (3 veces) y versos finales (una vez) | 74 |
| Disolución en luz (una línea, no hay nada para recitar) y consejos entre sesiones | 75 |

El texto del PDF se extrae limpio con PDFKit de macOS (script Swift), con las barras y las indicaciones de repetición.

Al extraer textos del PDF, copiar fonética y español **literalmente**, respetando las barras `/` y `//` y las indicaciones de repetición. Revisar a mano: el PDF tiene saltos de línea y guiones de corte.

### 6.4 Estructura de las sesiones

Se definen en `sesiones.json` como lista ordenada de pasos. Cada paso: `id`, `titulo`, `tipo` (`instruccion` | `texto` | `reflexion` | `meditacion` | `conteo` | `reposo`), `textoId?`, `repeticiones?`, `duracionSugeridaMin?`, `condicion?` (por ejemplo "solo domingos", "solo primera sesión del día").

**Sesión 1: Shiné** (mañana, idealmente antes del desayuno; 30 a 45 minutos):

1. Tres expulsiones del aire residual. Recomendadas en la primera sesión del día; en la segunda son opcionales ("si vinieron de trabajar... lo pueden hacer tantas veces como quieran").
2. Toma de refugio, 3 veces (p. 8).
3. Corta plegaria al linaje (p. 13).
4. Reflexión del día, 5 a 10 minutos (resumen en p. 23). Los días de bodhicitta, sugerir una variante de tong-len: con uno mismo, seres queridos, desconocidos o seres no queridos; énfasis en dar o en tomar.
5. **Solo los días de Shiné sin soporte:** Invocación a Milarepa (p. 12), para entrar en la meditación apoyados en la devoción.
6. Shiné con el soporte del día. Antes de terminar, soltar el soporte y reposar unos momentos. Con las respiraciones, el reposo va entre cada ciclo de 21. Las "7 veces" son orientativas: manda el tiempo de la sesión y las pausas no se miden en minutos. Este paso es un temporizador de la sesión, **nunca un contador de ciclos ni de respiraciones**.
7. Dedicación (p. 69).

**Sesión 2: Preliminar del trimestre** (tarde o noche; en el 1º trimestre, postraciones):

1. Instrucción: soltar las ocho preocupaciones mundanas (felicidad/sufrimiento, agradable/desagradable, fama/anonimato, riqueza/pobreza), sentarse en postura correcta.
2. Leer una vez la visualización del refugio (p. 72).
3. **Conteo:** recitar el refugio de la p. 73 con cada postración. Pantalla de contador.
4. Voto de bodhisattva, 3 veces, y los versos que siguen (p. 74).
5. Disolución en luz (p. 75) y **reposo de al menos 5 minutos** (temporizador).
6. Dedicación (p. 69): la primera estrofa es obligatoria, la segunda opcional.

Las expulsiones del aire no se repiten en la segunda sesión del día. El usuario puede elegir hacer las dos sesiones seguidas, en cualquier orden.

**Fuera de sesión:** mantras de Chenresi (OM MANI PADME HUNG, como lo escribe el libro) en cualquier momento, con el contador.

Implementado en `src/content/sesiones.json` y `src/domain/sesiones.ts`. La pantalla Hoy muestra cada sesión como lista ordenada de pasos, **solo con título, veces y página del libro**, y la reflexión y el soporte del día resaltados. Los minutos sugeridos (`duracion`) y la explicación (`detalle`) quedan detrás del botón "i" de cada paso, para que la pantalla no se llene de texto; los pasos con `condicion` (Milarepa) solo aparecen los días que corresponde. Las sesiones de Vajrasattva, mandala y guru yoga todavía no están cargadas: la app lo dice en lugar de inventarlas. TODO(contenido): confirmar si la sesión de postraciones empieza leyendo la apertura de la p. 71 ("Lama Karmapa...") o directamente en la p. 72.

### 6.5 Reglas de conteo

- **Malas de Chenresi:** una mala son 108 cuentas pero **suma 100**; las 8 restantes son "de regalo", por indicación de la Lama. El contador ofrece "+1 mala (100)" y también conteo individual.
- **Postraciones:** conteo individual y botón de suma manual ("+10", "+21", "+108") para quien cuenta con mala. TODO(contenido): confirmar si la regla de "108 suma 100" vale también para las postraciones o solo para Chenresi.
- Meta diaria sugerida = (meta del trimestre según compromiso) / (días del trimestre), redondeada hacia arriba. Con compromiso completo en el 1º trimestre, unas 110 postraciones por día; medio, unas 55. Sugerir empezar con 10 o 20 e ir subiendo.
- **Regularidad anual** (dato que pide el carnet): % de días con al menos una sesión de Shiné registrada desde la fecha de inicio. Indicación de la Lama: (días del año menos días sin practicar) / días del año; 366 en bisiestos.
- **Práctica hecha fuera de la app** (retiros, mala de papel, días anteriores a instalarla): se carga desde "Registrar" con fecha pasada. Nunca fechas futuras.
- **Preliminares en el carnet:** se anotan acumulados de todos los años. Chenresi se anota por año.

## 7. Modelo de datos (Dexie)

Principio: **append-only**. Nunca `update` ni `delete` sobre registros de práctica. Una corrección es un registro nuevo con monto negativo o con `corrigeId`.

**Única excepción: `borrarRegistros()`** (botón al final de Ajustes, pedido por el autor). Borra sesiones, conteos, borradores y el log de copias, y conserva los ajustes. Resguardos: el repositorio la rechaza si no hay una copia de seguridad **hecha ese mismo día**, y la pantalla pide una confirmación que dice cuántos registros se borran. Lo borrado se recupera restaurando la copia de ese día.

Todo registro lleva: `id` (UUID), `creadoEn` (ISO con zona), `fechaLocal` (`YYYY-MM-DD` según la zona del dispositivo, define a qué día pertenece), `dispositivoId`, `version` (del esquema).

La definición vigente está en `src/db/schema.ts`; resumen:

```ts
interface Sesion {
  id: string;
  tipo: 'shine' | 'preliminar';
  origen: 'app' | 'manual'; // manual = cargada desde Registrar
  fechaLocal: string;
  inicio?: string;         // ISO (falta en las manuales)
  fin?: string;            // ISO
  duracionSeg: number;
  trimestre?: 1 | 2 | 3 | 4; // falta si la fecha es anterior al inicio del programa
  diaSemana: number;       // 0 = domingo
  reflexion?: string;      // id de reflexión
  soporte?: string;        // id de soporte (shine)
  pasosCompletados: string[];
  nota?: string;
  creadoEn: string;
  dispositivoId: string;
  version: number;
}

interface Conteo {
  id: string;
  practica: 'postraciones' | 'vajrasattva' | 'mandala' | 'guruyoga' | 'chenresi';
  cantidad: number;        // negativo = corrección
  origen: 'contador' | 'sesion' | 'manual' | 'correccion' | 'importacion';
  sesionId?: string;
  corrigeId?: string;
  fechaLocal: string;
  creadoEn: string;
  dispositivoId: string;
  version: number;
}

interface Ajuste { clave: string; valor: unknown; actualizadoEn: string; }
// claves actuales: dispositivoId, fechaInicio, nivel, compromiso, escalaTexto, sonidoContador, apariencia
// previstas: sonidoInicio, sonidoFin, campanaIntermedia, mostrarFonetica

interface Borrador {        // conteo en curso, NO es registro de práctica
  practica: Practica;       // clave
  fechaLocal: string;       // día del primer toque
  iniciadoEn: string;
  actualizadoEn: string;
  pasos: number[];          // cada suma, para "deshacer el último"
}
```

Tablas: `sesiones`, `conteos`, `ajustes`, `respaldos` (log de exportaciones) y `borradores`. Índices: `fechaLocal`, `practica`, `[practica+fechaLocal]`, `[tipo+fechaLocal]`.

- **Borradores:** el contador escribe cada toque en `borradores` (así un corte de batería no pierde nada) y al tocar "Terminar" lo consolida en **un solo** `Conteo` dentro de una transacción. Si el borrador quedó de otro día, se guarda en su día antes de seguir sumando. Es la única tabla, junto con `ajustes`, que se modifica.

- Cambios de esquema solo con nueva `version()` de Dexie y migración probada. Nunca romper datos existentes.
- Al iniciar, llamar `navigator.storage.persist()` y mostrar en Ajustes si fue concedido.
- Toda escritura pasa por `db/repositorio.ts`.

## 8. Interfaz

### 8.1 Pantallas

- **Hoy:** fecha, trimestre, reflexión y soporte del día, estado de las dos sesiones (pendiente / hecha), progreso del preliminar del trimestre, y un botón principal enorme: "Comenzar la práctica de hoy". Indicador de respaldo ("Última copia: hoy" / "Hace 10 días sin copia").
- **Práctica (modo guiado):** un paso por pantalla, botones "Anterior" y "Siguiente" grandes, texto del paso con fonética y español, página del libro visible ("Libro, p. 13"). Temporizador cuando corresponde.
- **Contador:** botón que ocupa al menos la mitad de la pantalla, número gigante, sonido suave en cada toque, botón "deshacer último", sumas rápidas.
- **Avance (estadísticas):** dos partes. **De un vistazo** (solo gráficos, cada uno elegido según su función): regularidad del año (cifra grande + barra), metas como barra simple contra la meta, con "315 de 10.000 · 3%" (se probó un "ritmo parejo a hoy" y se sacó porque confundía), calendario de calor del trimestre, columnas de los últimos 14 días del preliminar contra lo sugerido por día, y columnas de minutos de Shiné por semana. **En números**: meditación (regularidad, días, sesiones, minutos, promedios, rachas), cada práctica (% de la meta, promedio, mejor día, proyección, lo que falta por día, días restantes) y el recuento del carnet. Lógica en `src/domain/estadisticas.ts`. La pestaña se llama "Avance" porque "Estadísticas" no entra en la barra con letra grande.
- **Programa:** la semana tipo de cada trimestre como en el cuadernillo (botones 1º a 4º, abre en el trimestre en curso, con el día de hoy resaltado), las fechas del trimestre, la meta del preliminar según el nivel, el recuadro "Desarrollo de una sesión" y "Durante el año" literales del cuadernillo.
- **Respaldo:** exportar, importar, estado de Google Drive (etapa 2). Se entra desde Ajustes.
- **Registrar:** práctica hecha fuera de la app y correcciones. Se entra desde Ajustes o desde Hoy: "Registrar sin temporizador" (Sesión 1) y "Registrar sin contador" (preliminar, Chenresi y yidam), que abre el formulario con la práctica ya elegida (`?que=conteo&practica=...`).
- **Ajustes:** arriba, accesos a Registrar y Copia; después nivel, compromiso (solo nivel 1), tamaño de texto, sonido, fecha de inicio, estado del teléfono; al final, borrar todos los registros.
- **Navegación:** cuatro pestañas abajo, Hoy · Programa · Avance · Ajustes. Las subpantallas (Registrar, Copia, Instalar) tienen un botón visible "← Ajustes" en la banda.
- **Instalar:** guía ilustrada según el sistema detectado (ver 9.1).

### 8.2 Accesibilidad (obligatorio)

- Tamaño base de texto: **18 px por defecto** (escala "Pequeño", decisión del autor), textos de práctica ≥ 24 px, todo en `rem` para respetar el tamaño configurado en el teléfono. Escalas en Ajustes: Pequeño (18 px, por defecto), Normal (20 px), Grande y Muy grande. Para la versión grupal, reconsiderar el tamaño por defecto con usuarios reales (ver 12.6).
- Pestañas de abajo: sin contorno de foco (en Android aparecía al tocar, como un cuadrado amarillo). La activa se marca con texto dorado y rayita.
- Contraste mínimo WCAG AA; apuntar a AAA en textos de práctica.
- Áreas táctiles de al menos 56 × 56 px; botones principales de 72 px de alto o más.
- Solo toques simples. Nada de deslizar, mantener presionado, doble toque ni menús ocultos.
- Etiquetas claras en español, sin iconos sin texto. Única excepción, pedida por el autor: el botón "i" de cada paso, con `aria-label` ("Ver la explicación de...") y área táctil de 60 px.
- Acciones destructivas o irreversibles con confirmación explícita.
- Respetar `prefers-reduced-motion`; `prefers-color-scheme` se respeta con la Apariencia "Automática".
- Navegable con lector de pantalla (roles y `aria-label` correctos).

### 8.3 Modo práctica sobrio

- Tema oscuro dentro de la sesión, sin elementos ajenos al paso actual.
- **Pantalla siempre encendida** durante la sesión con la Screen Wake Lock API; si no está disponible, avisar al usuario.
- Temporizador basado en marcas de tiempo (`Date.now()`), nunca en contar `setInterval`, para que no se desfase.
- **Temporizador de Shiné** (`screens/SesionShine.tsx`, ruta `/sesion/shine`), entrada principal de la Sesión 1 en Hoy:
  - Duración elegible (preferencia `minutosShine`, 30 por defecto), anillo de reloj, cuenco al comenzar y al terminar, y **registro automático** de la sesión (`origen: 'app'`, con inicio y fin).
  - La sesión en curso se guarda en `ajustes` (clave `shineEnCurso`): sobrevive a recargas y cierres. `cerrarShine` es atómica e idempotente (nunca registra dos veces). Si el tiempo se cumplió fuera de la pantalla, Hoy la registra al volver (`cerrarShineSiTermino`).
  - El cuenco final se agenda en el reloj de audio desde el inicio; si el sistema pausó el audio en segundo plano, suena al volver (hasta 1 minuto tarde; después, solo se registra). Si se retoma tras cerrar la app, el navegador pide un toque ("Activar el cuenco final").
  - "Terminar antes": guardar lo transcurrido (si es al menos 1 minuto), no guardar, o seguir.
  - La sesión pertenece al día en que empezó.
- Aviso: en iPhone, si la app pasa a segundo plano el JavaScript se suspende y el cuenco final puede no sonar. Por eso la pantalla debe quedar encendida.

### 8.4 Audio

- **Cuenco sintetizado** con Web Audio (`src/audio/cuenco.ts`): parciales inarmónicos con batido y decaimiento lento (pico 0,45, se apaga en unos 20 s). Un golpe al comenzar, tres al terminar. Sin archivos ni licencias. Si más adelante se usa una grabación, va en `public/audio/` con su licencia en `public/audio/LICENCIAS.md`.
- Un único `AudioContext` para toda la app (`src/audio/contexto.ts`).
- El audio en iOS solo se habilita tras un toque del usuario: desbloquear el contexto de audio en el toque de "Comenzar".
- En iOS, el interruptor de silencio puede silenciar Web Audio: usar `navigator.audioSession.type = 'playback'` cuando exista y probar con el interruptor activado.
- `navigator.vibrate` no existe en iOS Safari: usar sonido suave como respuesta táctil y vibración solo donde esté disponible.

### 8.5 Estilo visual

Elegante y moderno, inspirado en la tradición tibetana sin caer en el kitsch. Los tokens están en `src/index.css`; nunca usar colores sueltos en los componentes.

- **Paleta:** granate de los hábitos (`acento` #7b1e22, `banda` #5e1418), oro azafrán (`oro` #8f5b00 para texto, `oro-claro` #f2b33d sobre granate) y papel cálido (`fondo` #f7f1e6). Los cinco colores de las banderas de oración (lungta: azul, blanco, rojo, verde, amarillo, en ese orden) van solo como franja fina arriba de cada pantalla (`components/Lungta.tsx`), tomados de la paleta "Colors of Buddhism" (schemecolor.com), con el azul y el amarillo algo más profundos. Todos los pares de texto verificados en WCAG AA o más.
- **Apariencia** (Ajustes): Automática (sigue al teléfono, `prefers-color-scheme`), Clara u Oscura. **Por defecto, Oscura**: para meditar no se busca una pantalla luminosa. `src/tema.ts` pone `data-tema` en `<html>` y el color de la barra del sistema; un script en `index.html` pinta el tema antes de cargar la app (copia en localStorage, la preferencia real está en la base). `color-scheme` declarado para que Chrome no oscurezca la app por su cuenta. El contador usa siempre `.tema-practica`.
- **Tipografías** (servidas desde la app, funcionan sin conexión): **Atkinson Hyperlegible Next** para el texto (diseñada por el Braille Institute para baja visión) y **Fraunces** para títulos y números grandes. Las cifras 0 a 9 se toman de Fraunces en todo el texto (`@font-face 'Cifras'` con `unicode-range`), porque Atkinson dibuja el cero con barra.
- **Estructura:** cada pantalla usa `Pantalla`: banda granate de **alto fijo e igual en todas las pantallas**, con una línea chica (fecha, año, o "← Ajustes" en subpantallas), el título en un solo renglón (nombres cortos: Programa, Copia, Instalar, Sesión, Conteo) y Vajradhara a la derecha. Nada más va en la banda: en Hoy, junto al título, el **mandala del año** (`components/MandalaAnio.tsx`): cuatro arcos, uno por trimestre, en oro los cumplidos, el actual llenándose según el día y los que faltan apagados, con el número del trimestre en el centro y "día 6 de 92" debajo, pegado al mandala. Mandala, imagen y margen tienen tope según el ancho de pantalla (`min(rem, vw)`) para que el título nunca se corte. Se probó una línea fina de progreso en el borde y se descartó porque parecía un error y `Tarjeta` o `Seccion` para los bloques. Botones en forma de píldora.
- **Separación de secciones** (`components/GrupoSeccion.tsx`): en Hoy (Sesión 1, Sesión 2, Durante el día) y en Avance (De un vistazo, En números), un rótulo discreto fuera de las tarjetas, en dorado y mayúsculas con una línea fina, que **queda fijo arriba** mientras se lee su sección. Más aire entre secciones. Se descartó dar color de fondo o de borde a cada sección: llamaba demasiado la atención.
- **Imagen:** Vajradhara, escultura tibetana del siglo XV del Metropolitan Museum (dominio público, CC0), con el fondo recortado. Autoría y cambios en `public/imagenes/LICENCIAS.md`. No va en el contador: la práctica es sin elementos ajenos.
- **Gráficos:** SVG propio siguiendo la guía de dataviz: una sola serie en oro, marcas finas, sin doble eje, y siempre una tabla o texto con los mismos valores.

## 9. PWA, instalación y respaldo

### 9.1 Instalación

- Manifest completo (nombre, íconos, `display: standalone`, colores) y service worker con `vite-plugin-pwa` en modo `prompt` (no `autoUpdate`, que recarga sola la página), precacheando contenido y audio.
- **En iPhone, primero instalar y después usar.** Safari borra el almacenamiento de los sitios que no se visitan en 7 días (las apps instaladas en la pantalla de inicio están exentas), y la app instalada **no comparte datos** con la pestaña de Safari. Si la app corre en el navegador del teléfono, Hoy muestra "Instalá la app antes de empezar a usarla".
- Detectar sistema y mostrar la guía adecuada:
  - **iPhone/iPad (Safari):** guía ilustrada (`screens/Instalar.tsx`, maquetas en `components/IlustracionesIOS.tsx`): Compartir (o ⋯ → Compartir, como en iOS 26) → Agregar a inicio → "Abrir como app web" activado (solo se muestra en iOS 26 o más, o si no se sabe la versión) → Agregar → abrir desde el ícono. Apple no permite que una web dispare la instalación: en iOS siempre es manual.
  - **iPhone/iPad fuera de Safari** (Chrome, Firefox, Instagram, Facebook...; `pwa/navegadorIOS.ts`, con tests): aviso "Primero, abrila en Safari" con "Abrir en Safari" (enlace `x-safari-https://`, no documentado por Apple: funciona en iOS 15, 17 y posteriores, no en 16) y "Copiar el enlace" como respaldo.
  - **Android (Chrome):** botón "Instalar app" con el evento `beforeinstallprompt`.
- Si la app ya está instalada (`display-mode: standalone`), no mostrar la guía.
- Cuando hay una actualización, avisar con un mensaje simple **solo en la pantalla Hoy**, primero que todo ("Actualizar ahora"), nunca en medio de una sesión o del contador. El aviso es una banda roja (`components/AvisoActualizacion.tsx`, token `destacado` #9b1c1f, igual en los dos temas) para que no se confunda con los avisos dorados ni con los botones.

### 9.2 Respaldo, etapa 1 (manual)

- **Exportar:** JSON completo (todas las tablas, con versión de esquema) y CSV de sesiones y conteos para análisis. Usar la Web Share API para enviarlo (WhatsApp, mail, Archivos, iCloud Drive) y descarga directa como alternativa.
- **Importar** (hecho, `src/backup/importar.ts` + `importarCopia` en el repositorio; en Ajustes → Copia de seguridad → "Restaurar una copia"): valida el JSON (rechaza archivos ajenos y copias de versiones más nuevas, descarta y cuenta registros dañados), fusiona por `id` (nunca duplica ni sobrescribe) y muestra un resumen antes de confirmar. Ajustes: solo los que el teléfono no tiene elegidos; nunca `dispositivoId` ni `shineEnCurso`. Un conteo sin terminar de la copia entra como conteo de su día, con id estable.
- Recordatorio dentro de la app si pasaron más de 7 días sin copia. Registrar cada exportación en `respaldos`.

### 9.3 Respaldo, etapa 2 (Google Drive automático, opcional)

- Google Identity Services (token client, sin backend), scope `https://www.googleapis.com/auth/drive.appdata`: la app solo ve su propia carpeta privada, no el resto del Drive.
- Sube el JSON completo al terminar cada sesión (o una vez por día) y conserva las últimas N copias.
- "Restaurar desde Google Drive" en un dispositivo nuevo.
- Antes de construir esta etapa, probar en un iPhone real el flujo OAuth dentro de la app instalada: los popups en modo standalone de iOS suelen fallar.
- Requiere un OAuth Client ID con el origen de GitHub Pages autorizado. Leerlo de una variable de entorno de Vite (`VITE_GOOGLE_CLIENT_ID`); nunca commitear secretos.
- El token dura alrededor de una hora: renovar sin molestar al usuario y, si falla, mostrar "Reconectar con Google" sin bloquear la práctica.

## 10. Tests

- `src/domain/` con cobertura alta: cálculo del día y trimestre (incluyendo cambios de trimestre, años bisiestos, zona horaria de Argentina), estadísticas y sumas con correcciones.
- Importación: no duplica, rechaza JSON inválido, conserva todo.
- E2E en perfiles iPhone y Android: completar una sesión de Shiné, contar postraciones, exportar e importar.
- Nunca un test que borre la base real de desarrollo.

## 11. Convenciones

- **Idioma:** interfaz, contenido, nombres de dominio y commits en español. Términos técnicos de librerías en inglés.
- Tono de la interfaz: cálido y simple, tratando de "vos" (español rioplatense). Nunca usar el guion largo "—" en textos de la app ni de la documentación.
- Componentes chicos, funciones puras en `domain/`, sin lógica en los JSON de contenido.
- Commits pequeños y descriptivos. Nada de código muerto ni `console.log` en `main`.
- **Claude nunca hace `git commit` ni `git push`.** Los hace siempre el autor. Claude deja los cambios en el árbol de trabajo y propone el mensaje de commit.
- Antes de agregar una dependencia, justificarla en el mensaje del commit.

## 12. Hoja de ruta

0. **Versión mínima (hecha, octubre 2026):** pantalla Hoy (qué toca, estado, progreso), contador con borrador a prueba de cortes, registro manual con fecha (sesiones, conteos y correcciones), copia JSON por Compartir o descarga con recordatorio, Ajustes, guía de instalación, PWA offline.
0.1. **Temporizador de Shiné (hecho):** cuenco sintetizado, anillo de reloj, registro automático.
1. **Prototipo:** pantalla Hoy, sesión guiada de Shiné y de postraciones del 1º trimestre, temporizador con cuenco, contador, registro local, instalación como PWA.
2. **Respaldo manual:** exportar e importar JSON y CSV, recordatorio.
3. **Estadísticas:** regularidad, rachas, acumulados, proyección, resumen tipo carnet.
4. **Contenido completo:** textos y sesiones de los trimestres 2 a 4 (Vajrasattva, mandala, guru yoga).
5. **Google Drive automático.**
6. **Versión grupal:** revisión de accesibilidad con usuarios reales del grupo y guía de instalación para el encuentro presencial.

## 13. Fuera de alcance (por ahora)

- Servidor propio, cuentas de usuario o sincronización entre personas.
- Apps nativas o publicación en tiendas.
- Notificaciones push.
- Funciones sociales o de comparación entre practicantes.