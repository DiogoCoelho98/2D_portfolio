import kaboom from "kaboom";



// Initialize Kaboom game engine
export const k = kaboom({
    global: false,
    touchToMouse: true, // touch-to-mouse for mobile devices
    canvas: document.getElementById("game"),
});