# 🚀 Script de Desarrollo: Planificaciones

## ¿Qué hace este script?

El comando `npm run dev:planificacion` hace **TODO automáticamente**:

1. ✅ Limpia puertos ocupados (3000 y 3001)
2. ✅ Levanta Backend (API) en `http://localhost:3001`
3. ✅ Levanta Frontend (Web) en `http://localhost:3000`
4. ✅ Espera a que ambos servidores estén listos
5. ✅ Abre automáticamente 3 pestañas en tu navegador:
   - Portal Admin → `/admin/planificaciones`
   - Portal Docente → `/docente/planificaciones`
   - Portal Estudiante → `/estudiante/planificaciones`
6. ✅ Muestra logs en tiempo real

---

## 📖 Cómo Usar

### Comando Principal:

```bash
npm run dev:planificacion
```

Eso es TODO lo que necesitás. El script hace el resto.

---

## 🖥️ Qué Vas a Ver

### En la Terminal:

```
🚀 Iniciando entorno de desarrollo - Planificaciones

📦 Levantando servidores...
✅ Servidores iniciados (PID: 12345)
⏳ Esperando a que los servidores estén listos...

✅ API Backend listo en puerto 3001!
✅ Frontend Next.js listo en puerto 3000!

🎉 Servidores listos!

⏳ Compilando páginas iniciales...

🌐 Abriendo páginas de Planificaciones en el navegador...
📖 Abriendo: Portal Admin - Planificaciones
📖 Abriendo: Portal Docente - Planificaciones
📖 Abriendo: Portal Estudiante - Planificaciones

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Entorno de desarrollo listo!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 URLs disponibles:

  🔧 Admin - Crear Planificación:
     http://localhost:3000/admin/planificaciones

  👨‍🏫 Docente - Gestionar Planificaciones:
     http://localhost:3000/docente/planificaciones

  🎓 Estudiante - Mis Planificaciones:
     http://localhost:3000/estudiante/planificaciones

  🔌 API Backend:
     http://localhost:3001/api

  📚 API Docs (Swagger):
     http://localhost:3001/api/docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Los cambios en el código se reflejarán automáticamente
ℹ️  Ver logs en: tail -f /tmp/dev-planificacion.log
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 Para detener los servidores: Ctrl+C o ejecuta 'npm run stop:all'

📝 Logs en tiempo real:
[Aquí verás los logs de ambos servidores]
```

### En tu Navegador:

Se abrirán **3 pestañas automáticamente**:

1. **Admin:** `http://localhost:3000/admin/planificaciones`
2. **Docente:** `http://localhost:3000/docente/planificaciones`
3. **Estudiante:** `http://localhost:3000/estudiante/planificaciones`

---

## 🔥 Hot Reload = Cambios en Tiempo Real

Cuando yo (Claude) edite cualquier archivo `.tsx`, **vas a ver los cambios INSTANTÁNEAMENTE** en tu navegador sin refrescar.

### Ejemplo:

```
1. Yo edito: apps/web/src/app/admin/planificaciones/crear/page.tsx
2. Agrego un botón: <button>Hola</button>
3. Guardo el archivo
4. Tu navegador se actualiza SOLO en ~500ms
5. Ves el botón "Hola" sin hacer nada
```

---

## 🛑 Cómo Detener los Servidores

### Opción 1: Desde la terminal donde corriste el script

```bash
Ctrl + C
```

### Opción 2: Comando manual

```bash
npm run stop:all
```

Esto mata todos los procesos y libera los puertos.

---

## 📝 Ver Logs Completos

Si querés ver más detalle de los logs (sin el streaming en vivo):

```bash
tail -f /tmp/dev-planificacion.log
```

O abrir el archivo completo:

```bash
cat /tmp/dev-planificacion.log
```

---

## 🐛 Troubleshooting

### Problema: "Puerto 3000 ocupado"

**Solución:** El script lo limpia automáticamente, pero si no funciona:

```bash
npm run stop:all
npm run dev:planificacion
```

### Problema: "No se abrió el navegador"

**Solución:** Abrí manualmente las URLs que muestra el script en tu navegador favorito.

### Problema: "Páginas muestran 404"

**Solución:** Espera 10-20 segundos más. Next.js está compilando las páginas por primera vez.

### Problema: "API no responde"

**Solución:** Verificá los logs:

```bash
tail -f /tmp/dev-planificacion.log | grep "ERROR"
```

---

## 🎯 Workflow Recomendado

### Para Desarrollo Solo:

```bash
# 1. Arrancás el script
npm run dev:planificacion

# 2. Se abren las 3 pestañas automáticamente
# 3. Dejás la terminal abierta viendo logs
# 4. Trabajás en tu editor (VSCode, etc.)
# 5. Los cambios se reflejan en el navegador SOLOS
# 6. Probás cada portal mientras desarrollo
```

### Para Testing con Otra Persona:

```bash
# 1. Vos corrés:
npm run dev:planificacion

# 2. Compartís las URLs:
# Admin: http://localhost:3000/admin/planificaciones
# Docente: http://localhost:3000/docente/planificaciones
# Estudiante: http://localhost:3000/estudiante/planificaciones

# 3. La otra persona abre las URLs en SU navegador
# 4. Ambos ven lo mismo en tiempo real
```

---

## 🚀 URLs Rápidas

| Portal                           | URL                                              |
| -------------------------------- | ------------------------------------------------ |
| **Admin - Planificaciones**      | http://localhost:3000/admin/planificaciones      |
| **Docente - Planificaciones**    | http://localhost:3000/docente/planificaciones    |
| **Estudiante - Planificaciones** | http://localhost:3000/estudiante/planificaciones |
| **API Backend**                  | http://localhost:3001/api                        |
| **API Docs (Swagger)**           | http://localhost:3001/api/docs                   |

---

## 💡 Tips

- **Multi-monitor:** Dejá una pantalla con el navegador y otra con la terminal de logs
- **Split screen:** Dividí la pantalla entre navegador (arriba) y terminal (abajo)
- **Hot keys:** Usa `Ctrl + Tab` para navegar entre las 3 pestañas rápidamente
- **DevTools:** Abrí F12 en cada pestaña para ver errores de consola

---

## 📂 Archivos Relacionados

- Script principal: `scripts/dev-planificacion.sh`
- Package.json: `package.json` (línea del script `dev:planificacion`)
- Logs temporales: `/tmp/dev-planificacion.log`

---

**Última actualización:** 27 de Octubre de 2025
