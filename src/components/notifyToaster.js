import { toast } from 'react-toastify';

export const notifyToaster = (msg = "") => {
    toast(msg);
}
