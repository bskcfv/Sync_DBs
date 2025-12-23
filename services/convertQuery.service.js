//Llamado al Servicio de Conversion de Mongo a SQL para Insercion de Datos
export const insertMongoToSql = async(collection, operation, document) => {
    const result = await fetch("http://localhost:8000/insert", {
        method:'POST',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({
            collection, 
            operation, 
            document
        })
    })

    if(!result.ok) throw new Error(`/insert -> HTTP error ${result.status}`);

    const json = await result.json();

    if(json.error) throw new Error(json.error);

    return json.sql
}
//Llamado al Servicio de Conversion de Mongo a SQL para Actualizar de Datos
export const updateMongoToSql = async(collection, operation, filter, update) => {
    const result = await fetch("http://localhost:8000/update", {
        method:'PUT',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({
            collection, 
            operation, 
            filter, 
            update
        })
    })

    if(!result.ok) throw new Error(`/update -> HTTP error ${result.status}`);

    const json = await result.json();

    if(json.error) throw new Error(json.error);

    return json.sql
}
//Llamado al Servicio de Conversion de Mongo a SQL para Eliminar de Datos
export const deleteMongoToSql = async(collection, operation, filter) => {
    const result = await fetch("http://localhost:8000/delete", {
        method:'DELETE',
        headers:{'Content-type': 'application/json'},
        body: JSON.stringify({
            collection, 
            operation, 
            filter
        })
    })

    if(!result.ok) throw new Error(`/delete -> HTTP error ${result.status}`);

    const json = await result.json();

    if(json.error) throw new Error(json.error);

    return json.sql
}