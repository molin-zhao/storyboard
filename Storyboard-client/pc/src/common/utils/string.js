const sliceFromLeft = (str, len) => {
  if (str.constructor !== String) throw new Error("args invalid");
  if (str.length <= len) return str;
  return str.substr(0, len) + "...";
};

export { sliceFromLeft };
