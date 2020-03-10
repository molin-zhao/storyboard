const parser = (array, field) => {
  if (array.constructor !== Array || field.constructor !== String)
    throw new Error("args invalid");
  return array.map(item => item[field]);
};

export { parser };
