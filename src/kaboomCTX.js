import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    touchToMouse: true, // to work on mobile
    canvas: document.getElementById("#game"),
});