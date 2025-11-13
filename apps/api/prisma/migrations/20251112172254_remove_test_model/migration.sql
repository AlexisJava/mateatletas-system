-- RemoveTestModel Migration
-- Elimina la tabla test_models que era usada solo para testing/debugging
-- Esta tabla no tiene foreign keys, por lo que es seguro eliminarla

DROP TABLE IF EXISTS "test_models";
