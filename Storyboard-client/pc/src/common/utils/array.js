const parser = (array, field) => {
  if (array.constructor !== Array || field.constructor !== String)
    throw new Error("args invalid");
  if (array.length === 0) return [];
  if (!field) return array;
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

const arrayEqual = (arrA, arrB, params = []) => {
  if (arrA.constructor !== Array || arrB.constructor !== Array) return false;
  if (arrA === arrB) return true;
  if (arrA.length !== arrB.length) return false;
  if (params.length > 0) {
    params.forEach(param => {
      let arrAWithParam = arrA.map(val => val[param]);
      let arrBWithParam = arrB.map(val => val[param]);
      arrAWithParam.forEach(val => {
        if (arrBWithParam.indexOf(val) === -1) return false;
      });
    });
    return true;
  }
  arrA.forEach(val => {
    if (arrB.indexOf(val) === -1) {
      return false;
    }
  });
  return true;
};

const arrayFilter = (arr, callback) => {
  if (!arr || arr.constructor !== Array) return [];
  return arr.filter(val => callback(val));
};

export { parser, isEqual, arrayEqual, arrayFilter };
