import { toast } from 'react-toastify';

const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export const handleSuccess = (msg) => {
    toast.success(msg, toastOptions);
};

export const handleError = (error) => {
    let errorMessage = error;

    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
            errorMessage = detail;
        } else if (Array.isArray(detail)) {
            errorMessage = detail.map(err => err.msg).join(', ');
        }
    } else if (error.message) {
        errorMessage = error.message;
    }

    toast.error(errorMessage, toastOptions);
};