const init = () => {};

const toggleScan = () => {};

export const useLecomScan = ({}: LecomScanOptions = {}) => ({
  code: '',
  isDevice: false,
});

module.exports = {
  useLecomScan,
  toggleScan,
  init,
};
