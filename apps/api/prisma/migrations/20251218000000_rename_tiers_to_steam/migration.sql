-- Migration: Rename Tiers to STEAM Model
-- Date: 2024-12-18
-- Description: Renombra los valores del enum TierNombre de ARCADE/ARCADE_PLUS/PRO
--              a STEAM_LIBROS/STEAM_ASINCRONICO/STEAM_SINCRONICO
-- Nota: Maneja dependencias en múltiples tablas (tiers, cursos_studio)

-- ============================================================================
-- Paso 1: Crear el nuevo enum con los valores STEAM
-- ============================================================================
CREATE TYPE "tier_nombre_new" AS ENUM ('STEAM_LIBROS', 'STEAM_ASINCRONICO', 'STEAM_SINCRONICO');

-- ============================================================================
-- Paso 2: Actualizar la columna 'nombre' en la tabla 'tiers'
-- ============================================================================
ALTER TABLE "tiers"
  ALTER COLUMN "nombre" TYPE "tier_nombre_new"
  USING (
    CASE "nombre"::text
      WHEN 'ARCADE' THEN 'STEAM_LIBROS'::tier_nombre_new
      WHEN 'ARCADE_PLUS' THEN 'STEAM_ASINCRONICO'::tier_nombre_new
      WHEN 'PRO' THEN 'STEAM_SINCRONICO'::tier_nombre_new
      -- Si ya tiene valores STEAM (re-run), mantenerlos
      WHEN 'STEAM_LIBROS' THEN 'STEAM_LIBROS'::tier_nombre_new
      WHEN 'STEAM_ASINCRONICO' THEN 'STEAM_ASINCRONICO'::tier_nombre_new
      WHEN 'STEAM_SINCRONICO' THEN 'STEAM_SINCRONICO'::tier_nombre_new
    END
  );

-- ============================================================================
-- Paso 3: Actualizar la columna 'tier_minimo' en la tabla 'cursos_studio'
-- ============================================================================
ALTER TABLE "cursos_studio"
  ALTER COLUMN "tier_minimo" TYPE "tier_nombre_new"
  USING (
    CASE "tier_minimo"::text
      WHEN 'ARCADE' THEN 'STEAM_LIBROS'::tier_nombre_new
      WHEN 'ARCADE_PLUS' THEN 'STEAM_ASINCRONICO'::tier_nombre_new
      WHEN 'PRO' THEN 'STEAM_SINCRONICO'::tier_nombre_new
      -- Si ya tiene valores STEAM (re-run), mantenerlos
      WHEN 'STEAM_LIBROS' THEN 'STEAM_LIBROS'::tier_nombre_new
      WHEN 'STEAM_ASINCRONICO' THEN 'STEAM_ASINCRONICO'::tier_nombre_new
      WHEN 'STEAM_SINCRONICO' THEN 'STEAM_SINCRONICO'::tier_nombre_new
    END
  );

-- ============================================================================
-- Paso 4: Eliminar el enum antiguo y renombrar el nuevo
-- ============================================================================
DROP TYPE "tier_nombre";
ALTER TYPE "tier_nombre_new" RENAME TO "tier_nombre";

-- ============================================================================
-- Paso 5: Actualizar los precios y descripciones en la tabla tiers
-- ============================================================================
UPDATE "tiers" SET
  "precio_mensual" = 40000,
  "descripcion" = 'Plataforma completa STEAM: Matemáticas + Programación + Ciencias'
WHERE "nombre" = 'STEAM_LIBROS';

UPDATE "tiers" SET
  "precio_mensual" = 65000,
  "descripcion" = 'STEAM completo + clases grabadas asincrónicas'
WHERE "nombre" = 'STEAM_ASINCRONICO';

UPDATE "tiers" SET
  "precio_mensual" = 95000,
  "descripcion" = 'STEAM completo + clases en vivo con docente'
WHERE "nombre" = 'STEAM_SINCRONICO';

-- ============================================================================
-- Paso 6: Renombrar columnas de precios en configuracion_precios
-- ============================================================================
ALTER TABLE "configuracion_precios"
  RENAME COLUMN "precio_arcade" TO "precio_steam_libros";

ALTER TABLE "configuracion_precios"
  RENAME COLUMN "precio_arcade_plus" TO "precio_steam_asincronico";

ALTER TABLE "configuracion_precios"
  RENAME COLUMN "precio_pro" TO "precio_steam_sincronico";

-- ============================================================================
-- Paso 7: Simplificar descuentos familiares (de 2 columnas a 1)
-- ============================================================================
-- Agregar nueva columna unificada con valor por defecto
ALTER TABLE "configuracion_precios"
  ADD COLUMN "descuento_segundo_hermano" DECIMAL(5, 2) DEFAULT 10;

-- ============================================================================
-- Paso 8: Actualizar valores de precios en configuracion_precios
-- ============================================================================
UPDATE "configuracion_precios" SET
  "precio_steam_libros" = 40000,
  "precio_steam_asincronico" = 65000,
  "precio_steam_sincronico" = 95000,
  "descuento_segundo_hermano" = 10;

-- ============================================================================
-- Paso 9: Eliminar columnas de descuento antiguas
-- ============================================================================
ALTER TABLE "configuracion_precios"
  DROP COLUMN IF EXISTS "descuento_hermano_2",
  DROP COLUMN IF EXISTS "descuento_hermano_3_mas";
