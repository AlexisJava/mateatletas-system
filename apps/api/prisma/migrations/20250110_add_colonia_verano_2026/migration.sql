-- CreateTable
CREATE TABLE "colonia_inscripciones" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'active',
    "descuento_aplicado" INTEGER NOT NULL,
    "total_mensual" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_estudiantes" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "pin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_estudiante_cursos" (
    "id" TEXT NOT NULL,
    "colonia_estudiante_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_area" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "time_slot" TEXT NOT NULL,
    "precio_base" INTEGER NOT NULL,
    "precio_con_descuento" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_estudiante_cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_pagos" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "mercadopago_preference_id" TEXT,
    "mercadopago_payment_id" TEXT,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colonia_estudiantes_pin_key" ON "colonia_estudiantes"("pin");

-- CreateIndex
CREATE INDEX "colonia_inscripciones_tutor_id_idx" ON "colonia_inscripciones"("tutor_id");

-- CreateIndex
CREATE INDEX "colonia_inscripciones_estado_idx" ON "colonia_inscripciones"("estado");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_inscripcion_id_idx" ON "colonia_estudiantes"("inscripcion_id");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_estudiante_id_idx" ON "colonia_estudiantes"("estudiante_id");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_pin_idx" ON "colonia_estudiantes"("pin");

-- CreateIndex
CREATE INDEX "colonia_estudiante_cursos_colonia_estudiante_id_idx" ON "colonia_estudiante_cursos"("colonia_estudiante_id");

-- CreateIndex
CREATE INDEX "colonia_estudiante_cursos_course_id_idx" ON "colonia_estudiante_cursos"("course_id");

-- CreateIndex
CREATE INDEX "colonia_pagos_inscripcion_id_idx" ON "colonia_pagos"("inscripcion_id");

-- CreateIndex
CREATE INDEX "colonia_pagos_estado_idx" ON "colonia_pagos"("estado");

-- CreateIndex
CREATE INDEX "colonia_pagos_fecha_vencimiento_idx" ON "colonia_pagos"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "colonia_pagos_mercadopago_preference_id_idx" ON "colonia_pagos"("mercadopago_preference_id");

-- AddForeignKey
ALTER TABLE "colonia_inscripciones" ADD CONSTRAINT "colonia_inscripciones_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiantes" ADD CONSTRAINT "colonia_estudiantes_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "colonia_inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiantes" ADD CONSTRAINT "colonia_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiante_cursos" ADD CONSTRAINT "colonia_estudiante_cursos_colonia_estudiante_id_fkey" FOREIGN KEY ("colonia_estudiante_id") REFERENCES "colonia_estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_pagos" ADD CONSTRAINT "colonia_pagos_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "colonia_inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
