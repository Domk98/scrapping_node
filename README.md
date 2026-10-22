# scrapping_node

Automatizacion de consultas de actividad web con Node.js, Puppeteer y MySQL. Incluye procesamiento por lotes, reintentos, reinicio periodico del navegador, almacenamiento con upsert y una API Express. Endpoints PHP opcionales permiten consultar y eliminar los registros guardados.

## Preparacion

1. Instalar Node.js 22 o posterior y MySQL/MariaDB.
2. Ejecutar `npm ci` y `npm ci --prefix node.js`. El segundo comando instala Puppeteer y puede descargar Chromium.
3. Copiar `.env.example` a `.env` en la raiz y configurar valores propios.
4. Crear una base de datos vacia e importar `schema.sql` (esquema minimo de demostracion inferido, no un volcado empresarial).
5. Configurar `SOURCE_API_URL`: respuesta JSON con forma `{ "demo": ["example_profile"] }`.
6. Configurar `SCRAPER_URL_TEMPLATE` con una URL autorizada que contenga `{nickname}`. Los selectores del scraper (`div[data-tab="activity"]` y `.activity_logs_content p`) deben corresponder al sitio utilizado. No es un extractor universal.

Ejecutar siempre desde la raiz para que dotenv cargue `.env`.

- `npm run scrape`: consulta la fuente, extrae actividad en lotes y guarda los resultados.
- `npm start`: API local en `127.0.0.1:5001`; GET `/api/horas/:nickname` consulta actividad. No incorpora autenticacion ni limitacion de peticiones; no exponer directamente a Internet.
- `npm run check`: revision de sintaxis sin conectar servicios.

## Flujo

API configurable -> lista de identificadores y perfiles -> Puppeteer -> fechas y duraciones -> MySQL. El proceso permite concurrencia configurable entre 1 y 20, hasta dos intentos de extraccion por perfil y reinicio del navegador despues de aproximadamente 200 perfiles. El formato esperado de actividad contiene fecha YYYY-MM-DD y duracion HH Hours MM Minutes.

## PHP opcional

Requiere PHP con mysqli/mysqlnd y las mismas variables DB configuradas en el entorno PHP/FPM. PHP NO carga automaticamente el `.env` de Node. Configurar `API_ACCESS_TOKEN` y enviar `Authorization: Bearer <valor>`.

- GET `php/api_horas.php?cd=demo`: devuelve registros agrupados por identificador.
- DELETE `php/delete_horas.php?cd=demo`: elimina registros de ese identificador. Es destructivo; probar unicamente con datos de demostracion.
- `TENANT_SUFFIX` permite un sufijo opcional; vacio por defecto.

El cliente debe adaptarse: esta copia usa token en cabecera y metodo DELETE; no reproduce la autenticacion ni las URLs del entorno empresarial original.

## Preparacion para GitHub

Copia independiente del proyecto de Dropbox. No contiene `.env`, registros, node_modules, datos extraidos ni historial del proyecto original. Se parametrizaron URLs, se retiro un perfil de prueba real, se sustituyeron conexiones incrustadas por variables de entorno y se excluyeron detalles internos de respuestas de error. PHP usa consultas preparadas y autenticacion explicita. No se asigna una licencia publica sin confirmar titularidad.

`.gitignore` evita incluir configuracion privada, sesiones y exportaciones. `private: true` impide publicacion accidental en npm; la visibilidad en GitHub se decide al crear el repositorio. Empezar como privado permite revisar la titularidad del codigo antes de hacerlo publico.

## Limites y validacion

Se conserva la logica del scraper existente; no se ejecuta contra plataformas ni bases empresariales durante la preparacion. Revision estatica de JavaScript y PHP, configuracion y ausencia de referencias privadas conocidas. No se afirma una prueba completa de scraping, SQL o correo. No hay correo en este proyecto.

La fuente JSON debe ser un objeto con listas de perfiles; el proceso original no valida exhaustivamente su contrato. Los errores de selector pueden no contarse en las estadisticas. Revisar estos casos antes de usarlo en produccion. El navegador conserva flags originales que desactivan su sandbox: ejecutarlo en un entorno aislado con permisos limitados. Utilizar fuentes autorizadas.
