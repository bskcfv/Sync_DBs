/**
 * Verificador de Inputs
 * 
 *  Objetivo: Evitar la Entrada de Sql Inyection
 * 
 * @param {String} name 
 * @returns String 
 */
export const validateIdentifier = (name) => {
  const valid = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!valid.test(name)) {
    throw new Error(`Identificador SQL inválido: ${name}`);
  }
  return name;
}
