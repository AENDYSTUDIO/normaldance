const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

const ToastContainer = jest.fn();

module.exports = {
  toast,
  ToastContainer,
};