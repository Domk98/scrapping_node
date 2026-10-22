-- Minimal demo schema inferred from the INSERT query; no production data.
CREATE TABLE IF NOT EXISTS tiempo_cbhours (
    cd VARCHAR(191) NOT NULL,
    nick VARCHAR(191) NOT NULL,
    fecha DATE NOT NULL,
    tiempo TIME NOT NULL,
    UNIQUE KEY unique_activity (cd, nick, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
