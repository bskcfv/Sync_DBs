

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" width="120" alt="PostgreSQL Logo"/>
</p>

<h1 align="center">🔄 Sync_DBs — PostgreSQL Sync & Migration Tool</h1>

<p align="center">
  <b>Sincroniza y migra automáticamente tus bases de datos PostgreSQL locales y en deploy en tiempo real.</b><br/>
  <sub>Desarrollado con <b>Node.js + PostgreSQL + FS</b></sub>
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge&logo=github&logoColor=black"/>
</p>

---

## ⚙️ Configuración Inicial

### 1️⃣ Instalación del entorno

Ejecuta los siguientes comandos para configurar el proyecto:

```bash
npm init -y
npm install express nodemon pg dotenv pg-listen
```

---

### 2️⃣ Variables de entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto con los siguientes valores:

```ini
# --- Base de Datos Local ---
user=tu_usuario
password=tu_password
host=localhost
port=5432
db_local=tu_db_local
db_schema=public

# --- Conexión Directa al Deploy ---
db_url=tu_db_en_deploy

# --- Base de Datos en Deploy ---
db_d_host=tu_host_deploy
db_d_dbname=tu_db_deploy
db_d_port=tu_port_deploy
db_d_user=tu_user_deploy
db_d_password=tu_password_deploy
db_d_schema=public
```

---

### 3️⃣ Configuración del `package.json`

Agrega o reemplaza las siguientes líneas:

```json
{
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

### 4️⃣ Ejecución del proyecto

Para iniciar el script principal:

```bash
nodemon server.js
```

o

```bash
npm run dev
```

---

## 🧠 Estructura del Proyecto

```
project/
├── lib/
│   ├── DbLocal.js      # Conexión a la base de datos local
│   └── DbNeon.js       # Conexión a la base de datos en deploy
├── services/
│   ├── migration.service.js
│   └── connect.service.js
├── controllers/
│   ├── migration.controller.js
│   └── connect.controller.js
├── server.js
└── .env
```

---

## 🧰 Conexión a Bases de Datos

Las conexiones se manejan desde:

* `lib/DbLocal.js` → conexión local
* `lib/DbNeon.js` → conexión remota (deploy)

Cada archivo usa el módulo `pg` para conectarse mediante las credenciales definidas en `.env`.

---

## 🧩 Servicios

### `services/migration.service.js`

| Función                            | Descripción                                                           |
| ---------------------------------- | --------------------------------------------------------------------- |
| **getLocalTables()**               | Obtiene el nombre de las tablas en la base local.                     |
| **getDeployTables()**              | Obtiene el nombre de las tablas en la base deploy.                    |
| **AlterTableNameLocal(TableName)** | Convierte `tablename` en `tablename_local`.                           |
| **prepareTable(TableName)**        | Actualiza los datos de una tabla local con los de la tabla en deploy. |
| **DropTable(TableName)**           | Elimina tablas locales que no existen en la base deploy.              |
| **getDataByTable(TableName)**      | (En desarrollo) Obtiene los datos de una tabla específica.            |

---

### `services/connect.service.js`

| Función                         | Descripción                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| **ActivateExtension()**         | Activa la extensión `postgres_fdw` para conectar bases externas.      |
| **createServer()**              | Crea el servidor remoto de conexión con la base de datos en deploy.   |
| **connectUsers()**              | Enlaza usuarios locales con los del deploy.                           |
| **importForeignTable(Table)**   | Importa tablas foráneas desde deploy hacia local.                     |
| **cloneTable(TableName)**       | Clona una tabla foránea, replicando su estructura y datos localmente. |
| **dropForeignTable(TableName)** | Elimina una tabla foránea importada.                                  |
| **alterTableName(TableName)**   | Convierte `tablename_local` nuevamente en `tablename`.                |
| **DropCon()**                   | Elimina la conexión con el servidor remoto.                           |

---

## 🎮 Controladores

### `controllers/migration.controller.js`

| Función                       | Descripción                                              |
| ----------------------------- | -------------------------------------------------------- |
| **migration.CleanSchema()**   | Elimina tablas locales que no existen en la base deploy. |
| **migration.importTables()**  | Crea tablas faltantes en local según las del deploy.     |
| **migration.prepareTables()** | Actualiza los datos en tablas locales.                   |
| **migration.getData()**       | (En cuarentena) Funcionalidad pendiente de revisión.     |

---

### `controllers/connect.controller.js`

| Función                      | Descripción                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| **Con.GenerateConnection()** | Genera la conexión entre la base local y la base en deploy. |

---

## 🚀 Ejemplo de Ejecución (`server.js`)

```js
import { migration } from "./controllers/migration.controller.js";
import { Con } from "./controllers/connect.controller.js";


(async() => {
    console.log("Iniciando Sincronización")
    await Con.GenerateConnection()
    await migration.CleanSchema()
    await migration.importTables()
    await migration.prepareTables()
    //await migration.getData()
    console.log("Sincronización Finalizada")
})();
```

---

## 📦 Dependencias

| Paquete     | Descripción                                   |
| ----------- | --------------------------------------------- |
| **express** | Framework opcional para crear endpoints REST. |
| **pg**      | Cliente oficial de PostgreSQL para Node.js.   |
| **dotenv**  | Carga de variables de entorno.                |
| **nodemon** | Recarga automática en entorno de desarrollo.  |

---

## 📘 Estado del Proyecto

* **Versión:** 0.2.0
* **Estado:** En desarrollo (migración y sincronización estable)
* **Objetivo:** Sincronizar esquemas y datos entre bases locales y remotas (Neon/PostgreSQL).

---

## 👨‍💻 Autor

**Cristian Valderrama**
📧 [cristianvalderrama1014@gmail.com](mailto:cristianvalderrama1014@gmail.com)
🌐 [GitHub: bskcfv](https://github.com/bskcfv)


