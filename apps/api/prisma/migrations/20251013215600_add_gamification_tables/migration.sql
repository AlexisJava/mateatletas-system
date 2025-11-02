-- CreateTable
CREATE TABLE "acciones_puntuables" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acciones_puntuables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "imagen_url" TEXT,
    "requisito" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_obtenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "accion_id" TEXT NOT NULL,
    "clase_id" TEXT,
    "puntos" INTEGER NOT NULL,
    "contexto" TEXT,
    "fecha_otorgado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_obtenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros_desbloqueados" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "logro_id" TEXT NOT NULL,
    "docente_id" TEXT,
    "fecha_obtenido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contexto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logros_desbloqueados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "acciones_puntuables_nombre_key" ON "acciones_puntuables"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "logros_nombre_key" ON "logros"("nombre");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_estudiante_id_idx" ON "puntos_obtenidos"("estudiante_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_docente_id_idx" ON "puntos_obtenidos"("docente_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_accion_id_idx" ON "puntos_obtenidos"("accion_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_fecha_otorgado_idx" ON "puntos_obtenidos"("fecha_otorgado");

-- CreateIndex
CREATE INDEX "logros_desbloqueados_estudiante_id_idx" ON "logros_desbloqueados"("estudiante_id");

-- CreateIndex
CREATE INDEX "logros_desbloqueados_logro_id_idx" ON "logros_desbloqueados"("logro_id");

-- CreateIndex
CREATE INDEX "logros_desbloqueados_fecha_obtenido_idx" ON "logros_desbloqueados"("fecha_obtenido");

-- CreateIndex
CREATE UNIQUE INDEX "logros_desbloqueados_estudiante_id_logro_id_key" ON "logros_desbloqueados"("estudiante_id", "logro_id");

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_accion_id_fkey" FOREIGN KEY ("accion_id") REFERENCES "acciones_puntuables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logros_desbloqueados" ADD CONSTRAINT "logros_desbloqueados_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logros_desbloqueados" ADD CONSTRAINT "logros_desbloqueados_logro_id_fkey" FOREIGN KEY ("logro_id") REFERENCES "logros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logros_desbloqueados" ADD CONSTRAINT "logros_desbloqueados_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
