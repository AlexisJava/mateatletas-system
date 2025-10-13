# Configuración de GitHub - Pasos Manuales

Este documento describe los pasos manuales necesarios para configurar el repositorio en GitHub.

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Configura el repositorio:
   - **Repository name**: `mateatletas` (o el nombre que prefieras)
   - **Description**: "Mateatletas - Platform for athletes built with Next.js and NestJS"
   - **Visibility**: Public o Private (según prefieras)
   - **NO marcar**: "Initialize this repository with a README" (ya tenemos uno)

3. Click en **Create repository**

## Paso 2: Agregar Remote y Push

Una vez creado el repositorio en GitHub, ejecuta estos comandos:

```bash
# Agregar el remote
git remote add origin https://github.com/TU-USUARIO/mateatletas.git

# Cambiar nombre del branch principal a main (si es necesario)
git branch -M main

# Push del código
git push -u origin main
```

## Paso 3: Crear Branch Develop

```bash
# Crear branch develop desde main
git checkout -b develop

# Push develop a GitHub
git push -u origin develop
```

## Paso 4: Configurar Branch Develop como Default

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (en la barra superior del repo)
3. En el menú lateral, click en **Branches**
4. En "Default branch":
   - Click en el botón de cambiar (con flechas)
   - Selecciona **develop**
   - Click en **Update**
   - Confirma el cambio

## Paso 5: Configurar Branch Protection Rules

### Para branch `main`:

1. En **Settings** > **Branches**
2. Click en **Add branch protection rule**
3. En "Branch name pattern": `main`
4. Habilitar:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
   - ✅ **Require status checks to pass before merging**
     - Buscar y agregar: `lint-and-typecheck` y `build`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**
5. Click en **Create**

### Para branch `develop`:

1. Repetir el proceso anterior
2. En "Branch name pattern": `develop`
3. Configurar las mismas opciones que `main`

## Paso 6: Configurar Secrets (Opcional, para CI/CD futuro)

Si necesitas configurar secrets para CI/CD:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Click en **New repository secret**
3. Agrega los secrets necesarios:
   - `DATABASE_URL` (si usas una DB externa)
   - `JWT_SECRET`
   - etc.

## Paso 7: Verificar GitHub Actions

1. Ve a la pestaña **Actions** en tu repositorio
2. Deberías ver el workflow "CI" listado
3. Haz un cambio menor y push para verificar que CI funciona:

```bash
# Hacer un cambio menor
echo "# Test CI" >> README.md

# Commit y push
git add README.md
git commit -m "test: verificar CI"
git push
```

4. Ve a la pestaña **Actions** y verifica que el workflow se ejecuta

## Paso 8: Configurar Issues y Projects (Opcional)

### Habilitar Issues

1. Ve a **Settings** > **General**
2. En "Features", asegúrate que **Issues** esté habilitado

### Crear Labels

En **Issues** > **Labels**, agrega labels útiles:

- `bug` - Algo no funciona
- `enhancement` - Nueva característica
- `documentation` - Mejoras en documentación
- `good first issue` - Bueno para nuevos contribuidores
- `help wanted` - Se necesita ayuda
- `question` - Pregunta
- `wontfix` - No se trabajará en esto

## Paso 9: Configurar Colaboradores (Si es un equipo)

1. Ve a **Settings** > **Collaborators and teams**
2. Click en **Add people**
3. Agrega usuarios por su username o email

## Resumen de URLs

Una vez completado, tendrás:

- **Repositorio**: https://github.com/TU-USUARIO/mateatletas
- **Actions**: https://github.com/TU-USUARIO/mateatletas/actions
- **Pull Requests**: https://github.com/TU-USUARIO/mateatletas/pulls
- **Issues**: https://github.com/TU-USUARIO/mateatletas/issues

## Verificación Final

Checklist para verificar que todo está configurado:

- [ ] Repositorio creado en GitHub
- [ ] Código pushed a `main`
- [ ] Branch `develop` creado y pushed
- [ ] `develop` configurado como default branch
- [ ] Branch protection configurada en `main` y `develop`
- [ ] CI workflow aparece en Actions
- [ ] Template de PR funciona al crear un PR
- [ ] Issues habilitados

## Siguientes Pasos

Después de configurar GitHub:

1. Invitar colaboradores al proyecto
2. Crear issues para las próximas tareas
3. Comenzar a trabajar en features usando el flujo de trabajo descrito en
   [CONTRIBUTING.md](./CONTRIBUTING.md)

## Comandos Útiles

```bash
# Ver remotes configurados
git remote -v

# Ver todos los branches (local y remote)
git branch -a

# Actualizar desde develop
git checkout develop
git pull origin develop

# Crear nuevo feature branch
git checkout -b feature/nombre-feature

# Subir cambios
git push -u origin feature/nombre-feature
```

## Troubleshooting

### Error: remote origin already exists

```bash
# Ver remote actual
git remote -v

# Cambiar URL del remote
git remote set-url origin https://github.com/TU-USUARIO/mateatletas.git
```

### Error: push rejected

```bash
# Hacer pull primero
git pull origin main --rebase

# Luego push
git push origin main
```

### GitHub Actions no se ejecuta

- Verifica que el archivo `.github/workflows/ci.yml` existe
- Verifica que está en el branch correcto
- Revisa la pestaña Actions para ver errores

## Recursos

- [GitHub Docs - Creating a repo](https://docs.github.com/en/repositories/creating-and-managing-repositories)
- [GitHub Docs - Branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
