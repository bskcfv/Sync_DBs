<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" width="120" alt="PostgreSQL Logo"/>
</p>

<h1 align="center">🔄 Sync_DBs — PostgreSQL Sync & Migration Tool</h1>

<p align="center">
  <b>Herramienta CLI para clonar, sincronizar y migrar bases de datos PostgreSQL desplegadas hacia entornos locales o MongoDB Atlas.</b><br/>
  <sub>Construido con <b>Node.js · PostgreSQL · postgres_fdw · MongoDB</b></sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge&logo=github&logoColor=black"/>
</p>

---

## 🧠 Descripción general

**Sync_DBs** es una herramienta de sincronización de bases de datos diseñada para:

- Clonar **estructuras y datos** desde PostgreSQL en producción hacia PostgreSQL local
- Sincronizar esquemas (crear, eliminar y actualizar tablas)
- Migrar datos desde PostgreSQL hacia **MongoDB Atlas**
- Evitar el uso de dumps tradicionales (`pg_dump`) usando **`postgres_fdw`**

El sistema está pensado para:
- Entornos de desarrollo
- Replicación de datos
- Testing con datos reales
- Migraciones progresivas SQL → NoSQL

---

## ✨ Características principales

- 🔗 Conexión entre PostgreSQL local y remoto mediante **Foreign Data Wrapper**
- 🧹 Limpieza automática de esquemas no coincidentes
- 🧬 Clonación de tablas y sincronización de datos
- 🔁 Actualización transaccional (BEGIN / COMMIT / ROLLBACK)
- 🍃 Migración de datos a MongoDB Atlas
- 🖥️ Arquitectura modular lista para CLI

---

## ⚙️ Configuración inicial

### 1️⃣ Instalación de dependencias

```bash
npm init -y
````

---

### 2️⃣ Variables de entorno (`.env`)

```ini
# --- Base de Datos Local ---
user=tu_usuario
password=tu_password
host=localhost
port=5432
db_local=tu_db_local
db_schema=public

# --- Base de Datos en Deploy ---
db_d_host=tu_host_deploy
db_d_dbname=tu_db_deploy
db_d_port=5432
db_d_user=tu_user_deploy
db_d_password=tu_password_deploy
db_d_schema=public

# --- URI directa DB PostgreSql ---
db_url=postgres://user:password@host:port/db
# --- URI directa DB Mongo Atlas ---
mongo_url=tu_url
```

---

### 3️⃣ Configuración del `package.json`

```json
{
   "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}
```

---

### 4️⃣ Ejecución

```bash
node server.js
```

---

## 🧱 Estructura del proyecto

```
project/
├── lib/
│   ├── DbLocal.js              # Conexión PostgreSQL local
│   ├── DbNeon.js               # Conexión PostgreSQL deploy
│   └── DbMongo.js              # Conexión MongoDB Atlas
│
├── helpers/
│   └── validateName.js         # Validación de identificadores SQL
│
├── services/
│   ├── connect.service.js      # postgres_fdw y conexión remota
│   ├── migration.service.js    # Sincronización RDB → RDB
│   └── mongo.migration.service.js # Migración RDB → Mongo
│
├── controllers/
│   ├── connect.controller.js
│   ├── migration.controller.js
│   └── mongo.controller.js
│
├── server.js                 
├── .env
└── README.md

```

---

## 🔗 Flujo de sincronización PostgreSQL

1. Activar extensión `postgres_fdw`
2. Crear servidor remoto
3. Mapear usuarios
4. Importar tablas foráneas
5. Clonar tablas localmente
6. Sincronizar datos mediante transacciones
7. Eliminar foreign tables

---

## 🧩 Servicios principales

### `connect.service.js`

| Función                | Descripción                 |
| ---------------------- | --------------------------- |
| `ActivateExtension()`  | Activa `postgres_fdw`       |
| `createServer()`       | Crea el servidor remoto     |
| `connectUsers()`       | Mapea usuarios local/remoto |
| `importForeignTable()` | Importa tablas foráneas     |
| `cloneTable()`         | Clona estructura y datos    |
| `dropForeignTable()`   | Elimina tablas foráneas     |
| `altertablename()`     | Restaura nombres originales |
| `DropCon()`            | Elimina conexión FDW        |

---

### `migration.service.js`

| Función                 | Descripción                 |
| ----------------------- | --------------------------- |
| `getLocalTables()`      | Obtiene tablas locales      |
| `getDeployTables()`     | Obtiene tablas remotas      |
| `prepareTable()`        | Sincroniza datos            |
| `AlterTableNameLocal()` | Evita conflictos de nombres |
| `DropTable()`           | Elimina tablas obsoletas    |

---

### `mongo.migration.service.js`

| Función                | Descripción                |
| ---------------------- | -------------------------- |
| `getCollections()`     | Obtiene colecciones        |
| `createCollections()`  | Crea colecciones faltantes |
| `dropCollection()`     | Elimina colecciones        |
| `truncateCollection()` | Limpia documentos          |
| `insertTo()`           | Inserta documentos         |

---

## 🚀 Ejemplo de ejecución

![Demo de ejecución](./assets/gifSync.gif)

---

## ⚠️ Limitaciones conocidas

* `CREATE TABLE AS SELECT` no copia:

  * Primary Keys
  * Foreign Keys
  * Índices
* El proyecto prioriza **datos y estructura base**
* Ideal para entornos de desarrollo y testing

---

## 🗺️ Roadmap

* [ ] CLI con flags (`sync --to mongo`)
* [x] Validación de nombres (SQL Injection safe)
* [ ] Copia de constraints
* [ ] Configuración vía YAML
* [ ] Logs y progreso

---

## 📘 Estado del proyecto

* **Versión:** 0.3.0
* **Estado:** Funcional / En evolución
* **Enfoque:** Sincronización y migración de datos PostgreSQL

---

## 👨‍💻 Autor

**Cristian Valderrama**
📧 [cristian.vcabezas@hotmail.com](mailto:cristian.vcabezas@hotmail.com)
🌐 [GitHub: bskcfv](https://github.com/bskcfv)


