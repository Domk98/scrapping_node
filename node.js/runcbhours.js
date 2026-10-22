import 'dotenv/config';
import { consultarValores, cerrarBrowser } from "./index.js";
import fs from "fs";

process.on("exit", async () => {
    await cerrarBrowser();
});

process.on("SIGINT", async () => {
    await cerrarBrowser();
    process.exit();
});

process.on("SIGTERM", async () => {
    await cerrarBrowser();
    process.exit();
});

const API_URL = process.env.SOURCE_API_URL;
if (!API_URL) throw new Error('Configure SOURCE_API_URL in .env');
const CONCURRENCIA = Number(process.env.CONCURRENCY || 5);
if (!Number.isInteger(CONCURRENCIA) || CONCURRENCIA < 1 || CONCURRENCIA > 20) throw new Error('CONCURRENCY must be an integer from 1 to 20');

const LOG_FILE = './cbhours_script.log';

const ERROR_LOG = './cbhours_errors.log';

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(line.trim());
    fs.appendFileSync(LOG_FILE, line);
}

function errorLog(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.error(line.trim());
    fs.appendFileSync(ERROR_LOG, line);
}

(async () => {

    const startTime = Date.now();

    log("🚀 Inicio del proceso CBHours");

    try {

        const stats = await consultarValores(
            API_URL,
            CONCURRENCIA,
            log,
            errorLog
        );

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        const mem = process.memoryUsage();

        log("✅ Proceso terminado correctamente");

        log(`📊 Nicks procesados: ${stats.procesados}`);
        log(`❌ Errores: ${stats.errores}`);

        if (stats.procesados > 0) {
            log(`⏱ Promedio por nick: ${(duration / stats.procesados).toFixed(3)}s`);
        }

        log(`💾 Memoria usada: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);

        log(`⏱ Tiempo total: ${duration} segundos`);

    } catch (error) {

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        errorLog("❌ Error fatal ejecutando proceso: " + error.message);
        process.exitCode = 1;
        log(`⏱ Tiempo antes del fallo: ${duration} segundos`);
    }

})();