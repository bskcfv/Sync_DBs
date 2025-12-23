from fastapi import FastAPI
from pydantic import BaseModel
from sql_mongo_converter import mongo_to_sql

'''
Objetivo de Este Micro Servicio
    -> Hacer uso de la Libreria sql_mongo_converter
    -> Poder traducir sentencias de Mongo a SQL
    -> Ejecutar Sentencias Traducidas en la base de datos Central
    -> Tener Consistencia de Datos en Mongo y NeonDb
'''
app = FastAPI()

#Creacion de Schemas para cada tipo de Request
class insertRequest(BaseModel):
    collection: str
    operation: str
    document: dict

class updateRequest(BaseModel):
    collection: str
    operation: str
    filter: dict
    update: dict 

class deleteRequest(BaseModel):
    collection: str
    operation: str
    filter: dict

#Endpoints Respectivos
@app.post("/insert")
def convert_insert(req: insertRequest):
    try:
        #Generar Formato
        mongo_obj = {
            "collection": req.collection,
            "operation": req.operation,
            "document": req.document
        }
        #Obtener Query Traducida a SQL
        sql = mongo_to_sql(mongo_obj)
        #Retornar Respuesta
        return { "sql": sql }
    except Exception as e:
        return { "error": str(e) }
    
@app.put("/update")
def convert_update(req: updateRequest):
    try:
        print(req)
        mongo_obj = {
                "collection": req.collection,
                "operation": req.operation,
                "filter": req.filter,
                "update": req.update
        }

        sql = mongo_to_sql(mongo_obj)

        return { "sql": sql}
    except Exception as e:
        return { "error": str(e) }
    
@app.delete("/delete")
def convert_delete(req: deleteRequest):
    try:
        print(req)
        mongo_obj = {
                "collection": req.collection,
                "operation": req.operation,
                "filter": req.filter
        }

        sql = mongo_to_sql(mongo_obj)

        return { "sql": sql}
    except Exception as e:
        return { "error": str(e) }
