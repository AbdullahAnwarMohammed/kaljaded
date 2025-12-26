let setLoadingGlobal = null;

export const setLoadingRef = (setter) => {
  setLoadingGlobal = setter;
};

export const getLoadingSetter = () => setLoadingGlobal;
