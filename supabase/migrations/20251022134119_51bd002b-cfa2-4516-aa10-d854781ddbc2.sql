-- Criar índices para melhorar performance de buscas e relacionamentos
-- Isso vai acelerar significativamente as queries com 150+ pacientes

-- Índice para busca por nome de paciente
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

-- Índice para busca por patologia
CREATE INDEX IF NOT EXISTS idx_patients_pathology ON patients(pathology);

-- Índice para relacionamento sessions -> patients
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);

-- Índice para ordenação de sessões por data
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date DESC);

-- Índice composto para buscas mais eficientes
CREATE INDEX IF NOT EXISTS idx_patients_name_pathology ON patients(name, pathology);