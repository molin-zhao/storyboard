const generateRandomNumber = (min, max) => {
  if (typeof min !== "number" || typeof max !== "number" || min > max)
    throw new Error(ERROR.SEVICE_ERROR.ARGUMENTS_INVALID);
  return parseInt(Math.random() * (max - min + 1) + min, 10);
};

export { generateRandomNumber };
