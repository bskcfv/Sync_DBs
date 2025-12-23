import { getDeployTables } from "../services/migration.service.js"

//Diccionario con los Ids Correspondientes a cada Collecion
export const idColumns = {
    clientes:'cedula',
    detalles_pedido:'id_detalles',
    devoluciones:'id_devolucion',
    metodos_pago:'id_metodo',
    pedidos:'id_pedido',
    productos:'id_producto',
    usuarios:'id_usuario'
}

export const handlerIds = async(collection, data) => {
    //Validar Integridad de las tablas y la collecion solicitada
    const tables = await getDeployTables()
    const match = tables.some(table => table.tablename == collection)
    if(!match){
        console.log("Collection doesn't exists")
        return;
    }

    //Obtener el Id Segun la Collecion Correspondiente
    //pk -> Primary Key
    const pk = idColumns[collection];
    //Ajustar Formato del Documento a Registrar
    const docs = data.map(row=>({
        //Modificar el _id generado por Mongo por el mismo Pk de PostgreSql
        _id : row[pk],
        //Mantener el Resto del Documento Igual
        ...row
    }))
    //Retornar Resultado
    return docs;
}