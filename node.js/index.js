import { openWebPage, cerrarBrowser } from './scraper.js';
import { guardarTiempoGlobal } from './tiempo.model.js';

const isLocal = process.env.NODE_ENV !== "production";

const log = (...args) => {
    if (isLocal) console.log(...args);
};

const errorLog = (...args) => {
    if (isLocal) console.error(...args);
};

export async function consultarValores(
    apiUrl,
    concurrencia = 5,
    log = console.log,
    errorLog = console.error
) {
    let procesados = 0;
    let errores = 0;

    log('🚀 Iniciando consulta...');

    const response = await fetch(apiUrl);
    const raw = await response.json();

    const data = Object.entries(raw).flatMap(([cd, nicks]) =>
        nicks.map(nick => ({ cd, nick }))
    );

    if (!data.length) {
        log('⚠️ La API no devolvió datos');
        return { procesados, errores };
    }

    let procesadosDesdeReinicio = 0;
    const LIMITE_REINICIO = 200;

    for (let i = 0; i < data.length; i += concurrencia) {

        const lote = data.slice(i, i + concurrencia);

        await Promise.all(
            lote.map(async ({ cd, nick }) => {
                try {
                    const horas = await openWebPage(nick) || [];

                    for (const h of horas) {
                        await guardarTiempoGlobal({
                            cd,
                            nick,
                            fecha: h.fecha,
                            tiempo: h.tiempo
                        });
                    }

                    procesados++;
                    procesadosDesdeReinicio++;

                } catch (err) {
                    if (err.message.includes("Waiting for selector")) return;
                    errores++;
                    errorLog(`❌ Error ${nick}: ${err.message}`);
                }
            })
        );

        if (procesadosDesdeReinicio >= LIMITE_REINICIO) {
            log("♻️ Reiniciando navegador Puppeteer...");
            await cerrarBrowser();
            procesadosDesdeReinicio = 0;
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    await cerrarBrowser();
    log('✅ Proceso terminado');

    return { procesados, errores };
}

export { cerrarBrowser };