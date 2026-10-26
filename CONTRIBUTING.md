# Flujo de trabajo con Git

## Ramas
| Rama | Para qué sirve | Se crea desde | Se fusiona en |
|---|---|---|---|
| `main` | Versiones entregadas; cada punto de `main` lleva un **tag** (`vX.Y.Z`) | — | — |
| `develop` | Integración del trabajo en curso; siempre con pruebas en verde | `main` | `release/*` |
| `feature/<tema>` | Una funcionalidad o mejora | `develop` | `develop` (`--no-ff`) |
| `release/<X.Y.Z>` | Congelar versión: subir `package.json`, `CHANGELOG.md` | `develop` | `main` y `develop` |
| `hotfix/<tema>` | Corrección urgente sobre lo ya entregado | `main` | `main` y `develop` |
| `experimento/<tema>` | Pruebas descartables (reversiones, bisect) | `develop` | no se fusiona |

## Commits (Conventional Commits)
`tipo(ámbito): descripción en minúscula` — tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `style`, `revert`.
En TDD se permite un commit `test(red): …` con las pruebas que aún fallan, seguido del `feat`/`fix` que las pone en verde.

## Hooks (activar una vez por clon)
```
git config core.hooksPath .githooks
```
- `commit-msg`: rechaza mensajes que no sigan la convención.
- `pre-push`: ejecuta `npm test`; si falla, no se publica.

## Reversiones
- **Ya publicado** → `git revert <commit>` (crea un commit inverso; no reescribe la historia).
- **Solo local** → `git reset --hard <commit>`; si se pierde algo, `git reflog` + `git reset --hard HEAD@{n}`.
- **Buscar quién rompió algo** → `git bisect start; git bisect bad; git bisect good <tag>; git bisect run npm test`.
- **Un archivo** → `git restore --source=<tag> -- ruta`.

## Versiones (tag)
`git tag -a vX.Y.Z -m "…"` sobre `main` tras fusionar un `release/*` o un `hotfix/*`. Versionado semántico: MAYOR.MENOR.PARCHE.

## Base de datos y secretos
La `.db` no se versiona; se restaura con `node scripts/restaurar-bd.js`. Nunca se suben `.env`, claves ni logs.
