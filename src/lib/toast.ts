import { toast, type ToastOptions } from "react-toastify"

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
}

export const notifySuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...baseOptions, ...options })

export const notifyError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...baseOptions, autoClose: 4500, ...options })

export const notifyInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...baseOptions, ...options })

export const notifyWarning = (message: string, options?: ToastOptions) =>
  toast.warning(message, { ...baseOptions, ...options })
