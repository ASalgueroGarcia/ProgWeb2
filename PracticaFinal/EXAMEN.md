# Defensa Proyecto Final - Programación Web II
###### Hecho por Antonio Pedro Salguero García | INSV 3ºC

## Problema detectado

`getOne` y `getPdf` en `src/controllers/deliverynote.controller.js` filtraban los albaranes únicamente por `company`, lo que permitía que cualquier usuario autenticado de la misma compañía pudiera leer el detalle y descargar el PDF de un albarán creado por otro usuario. El campo `user` del albarán no se comparaba en ningún momento con `req.user._id`, ignorando completamente la regla de negocio del enunciado: "solo el creador o un guest de su compañía".

## Solución implementada

### 1. `src/models/User.js`
Actualizo el enum de `role` de `["user"]` a `["admin", "guest", "user"]` con default de `"admin"`. El rol de `"guest"` es un usuario de la compañía con permisos de lectura sobre ficheros ajenos, mientras que `"admin"`es el creador estándar con acceso solo a sus propios recursos.

### 2. `src/controllers/deliverynote.controller.js`
Se extrajo la lógica de autorización en una función `assertCanRead(note, user, next)` 
- Compara `note.user` con `req.user._id` (manejando tanto el caso de campo populado como ObjectId crudo).
- Permite el acceso si el usuario es el creador o tiene `role === "guest"`.
- Devuelve `AppError(..., 403)` en caso contrario.

Esta función se invoca en `getOne` y `getPdf` después de verificar que el albarán existe (404 si no existe, 403 si existe pero no tienes permiso).

La consulta a MongoDB sigue filtrando por `company` como defensa en profundidad: un usuario de otra compañía nunca llega a la comprobación de rol porque el documento no aparece.

### 3. `tests/deliverynote.test.js`
Se añadieron 4 tests nuevos, 2 por endpoint:
- **`GET /:id`**: usuario de la misma compañía sin ser creador → 403. Usuario `guest` de la misma compañía → 200.
- **`GET /pdf/:id`**: ídem para el PDF.

---

## Justificación

### ¿Por qué 403 y no 401?

- `401 Unauthorized`: petición carece de credenciales válidas o no está autenticada. 
- `403 Forbidden`: usuario sí está autenticado pero no tiene permiso sobre el recurso concreto. 
    - Usuario tiene un JWT válido y pertenece a la compañía correcta
    - Devolver 401 sería incorrecto. 
    - El estándar HTTP y la RFC 7231 son explícitos en esta distinción.

### ¿Por qué la regla de negocio vive en el controlador y no en un middleware?

Usamos un controlador ya que un middleware genérico de autorización no tiene acceso al documento concreto sin hacer una consulta extra. El controlador recupera el albarán de la BD para devolverlo, añadir una comprobación aqui evita la segunda consulta y mantiene la lógica cerca del dato. Lo metemos a `assertCanRead` para que sea algo resutilizable y dividir responsabilidades.

### ¿Por qué mantener el filtro por `company` si ya comprobamos `user`?

Defensa en profundidad: si en el futuro se introduce un bug en la lógica de roles, el filtro por `company` sigue evitando que un usuario de otra compañía acceda al documento. Las capas de seguridad no deben depender unas de otras para funcionar.

### ¿Por qué `guest` puede leer albaranes ajenos?

El enunciado especifica que un guest es un "lector de su compañía". Es un rol de solo lectura pensado para, por ejemplo, un contable que necesita revisar todos los albaranes de la empresa sin ser el creador de ninguno. Darle acceso de lectura es intencional y explícito en el modelo de negocio.

### ¿Qué pasaría si se usara el mismo patrón en `sign` y `remove`?

`sign` y `remove` son operaciones de escritura. Aplicar `assertCanRead` a escrituras sería incorrecto semánticamente. Para esas operaciones la regla de negocio podría ser distinta (por ejemplo, solo el creador puede firmar, un guest nunca). No se modifica este comportamiento en este commit porque el enunciado solo pide reforzar `getOne` y `getPdf`.

---

## Preguntas socráticas sobre el código

### 1. ¿Por qué filtrar por `company` no basta para cumplir la regla "solo el creador o un guest"?

El filtro `{ _id: req.params.id, company: req.user.company._id }` garantiza aislamiento *entre* compañías: un usuario de la empresa A nunca verá documentos de la empresa B. Pero dentro de la misma compañía todos los usuarios pasan ese filtro, porque todos comparten el mismo `company._id`.

**Escenario concreto de fuga:** la empresa "Constructoras SL" tiene dos empleados, Ana (creadora del albarán `ALB-001`) y Borja (empleado sin relación con ese albarán). Borja está autenticado con un JWT válido y pertenece a la misma compañía. Antes del fix, `GET /api/deliverynote/ALB-001` devolvía 200 a Borja porque el único filtro era `company`, que Borja sí cumple. Borja podía descargar el PDF con datos comerciales confidenciales de un cliente de Ana sin ningún permiso explícito. El campo `note.user` apuntaba a Ana, pero nunca se comparaba con `req.user._id`.

---

### 2. ¿Por qué `JWT_SECRET || "test_secret"` es problemático en producción?

Si `process.env.JWT_SECRET` no está definido en producción (variable de entorno no inyectada, fallo en el despliegue, contenedor mal configurado), `jsonwebtoken` usará `"test_secret"` sin avisar. Esto tiene dos consecuencias graves:

- **Cualquier token firmado con `"test_secret"`** —incluyendo los generados en entornos de desarrollo o por un atacante que conozca el fallback— **será válido en producción**. Es una escalada de privilegios trivial.
- **No hay señal de alarma**: la app arranca sin error, los logs no muestran nada anómalo, y el problema solo se detecta si alguien audita el código o si ocurre un incidente.

**Error HTTP que correspondería si el secret faltara al arrancar:** si en lugar del fallback se lanzara un error al iniciar, sería un fallo de servidor (`500 Internal Server Error`) antes de que cualquier petición llegara al middleware de auth. La solución correcta es validar la presencia del secret en el arranque de la aplicación (`src/index.js`) y abortar con `process.exit(1)` si no está definido, antes de llamar a `httpServer.listen()`:

```js
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined");
  process.exit(1);
}
```

Esto convierte un fallo silencioso en producción en un fallo ruidoso y detectable en el despliegue.

---

### 3. ¿Cuál es el código HTTP correcto: 400, 403 o 409 para firmar un albarán ya firmado?

El código actual usa `400 Bad Request` en `sign` (línea 88) cuando el albarán ya está firmado, y `403 Forbidden` en `remove` (línea 116) cuando se intenta borrar un albarán firmado. Analisis de cada código:

- **400 Bad Request**: indica que la petición está malformada o tiene datos inválidos. Es apropiado cuando el *input del cliente* es incorrecto (campo faltante, formato inválido). Aquí el input es técnicamente correcto: un ID válido, autenticación válida. El problema no es la petición sino el *estado actual del recurso*.

- **403 Forbidden**: indica que el servidor entiende la petición pero se niega a ejecutarla por motivos de autorización. Es correcto para `remove` de un albarán firmado porque es una restricción de negocio permanente sobre ese recurso: nadie puede borrar un albarán firmado, independientemente de quién sea.

- **409 Conflict**: indica que la petición no puede completarse por un *conflicto con el estado actual del recurso*. Es el código semánticamente más preciso para `sign` cuando el albarán ya está firmado: la petición es válida, el usuario tiene permiso, pero hay un conflicto de estado (ya firmado). RFC 7231 lo define explícitamente para casos donde la operación es lógicamente imposible por el estado del recurso.

**Conclusión:** `sign` debería devolver `409` (conflicto de estado), no `400`. `remove` devuelve correctamente `403` porque la restricción es una regla de negocio de autorización (un firmado es inmutable), no un conflicto transitorio.

---

### 4. ¿Qué pasa con tokens emitidos antes de añadir `role` al JWT?

El JWT emitido en `user.controller.js:52-56` contiene el payload `{ id, companyId }`. El campo `role` **no está en el payload del token**, sino que se lee de la base de datos en cada petición a través de `auth.middleware.js:10` (`User.findById(decoded.id).populate("company")`). Esto significa que `req.user.role` siempre refleja el valor actual en MongoDB, no el valor en el momento de emitir el token.

**Ciclo de vida del token:** el token se firma con una clave secreta y una expiración de 7 días. Su payload es inmutable: no cambia aunque el usuario cambie de rol en la BD. Sin embargo, como el middleware hace un `findById` en cada petición, `req.user` siempre tiene los datos actualizados de la BD. Por tanto:

- Un token emitido antes del cambio de `role` sigue siendo válido (misma firma, mismo secret).
- La primera petición con ese token antiguo cargará el usuario de la BD y obtendrá el `role` actualizado (`"admin"` en lugar de `"user"`).
- **No hay problema de compatibilidad** porque el rol no viaja en el token, solo el `id`.

Si en el futuro se decidiera incluir `role` en el payload del JWT (para evitar la consulta a BD en cada request), entonces sí habría un problema: tokens antiguos tendrían `role: "user"` en su payload y no serían actualizados hasta que expiraran. La solución en ese caso sería una lista de revocación de tokens o reducir el tiempo de expiración a algo corto (15 minutos con refresh tokens).

---

### 5. ¿Es razonable la asimetría entre el middleware HTTP y el handshake del socket?

**La asimetría actual:** el middleware HTTP (`auth.middleware.js:10`) hace `findById` en cada petición para obtener el usuario completo con su compañía. El handshake del socket (`app.js:23`) solo verifica la firma del JWT con `jwt.verify` sin tocar la BD.

**Justificación de la asimetría:**

El middleware HTTP carga el usuario de la BD porque los controladores necesitan `req.user.company._id` para filtrar documentos y `req.user.role` para autorizar acciones. Sin esa consulta los controladores no funcionan.

El handshake del socket solo necesita saber a qué sala (`companyId`) unir el socket, información que ya está en el payload del token (`decoded.companyId`). No ejecuta lógica de negocio, no accede a documentos, no necesita `role`. Hacer un `findById` en el handshake añadiría latencia a la conexión WebSocket sin ningún beneficio funcional.

**Trade-off concreto y cuándo cambiaría:**

La asimetría introduce un riesgo: si se revoca un usuario (por ejemplo, `deleted: true`) su socket ya conectado seguiría activo hasta que se desconecte, porque el handshake no consultó la BD. Si la aplicación requiriera revocación inmediata de acceso por WebSocket (por ejemplo, en un sistema con datos muy sensibles o con gestión de usuarios en tiempo real), la solución sería añadir el `findById` también en el handshake y aceptar el coste de la consulta extra por conexión. Para el caso de uso actual (notificaciones de albaranes), la asimetría es razonable: el riesgo de que un usuario borrado reciba una notificación durante unos minutos es despreciable frente al coste de consultar la BD en cada handshake.