const parser = (array, field) => {
  if (array.constructor !== Array || field.constructor !== String)
    throw new Error("args invalid");
  return array.map(item => item[field]);
};

const isEqual = (objX, objY, params = []) => {
  if (typeof objX !== "object" || typeof objY !== "object") return false;
  if (objX === objY) return true;
  if (Object.keys(objX).length !== Object.keys(objy).length) return false;
  if (params.length > 0) {
    for (let param in params) {
      if (objX[param] !== objY[param]) return false;
    }
    return true;
  }
  for (let prop in objX) {
    if (objY.hasOwnProperty(prop) && objX[prop] !== objY[prop]) return false;
  }
  return true;
};

export { parser, isEqual };
