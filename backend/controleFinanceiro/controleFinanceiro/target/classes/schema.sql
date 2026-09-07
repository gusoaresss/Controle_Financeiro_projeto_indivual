CREATE TABLE IF NOT EXISTS registro (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        valor DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_registro DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    pago BOOLEAN NOT NULL
    );