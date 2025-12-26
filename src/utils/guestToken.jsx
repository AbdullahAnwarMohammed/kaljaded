import { v4 as uuidv4 } from "uuid";

const GUEST_KEY = "guest_token";

export function getGuestToken() {
    let token = localStorage.getItem(GUEST_KEY);
    if (!token) {
        token = uuidv4();
        localStorage.setItem(GUEST_KEY, token);
    }
    return token;
}
