import { move } from "./client-socket";
/** Callback function that calls correct movement from key */

const MAX_MAGNITUDE = 50;

export const handleInput = (e) => {
    const rect = e.target.getBoundingClientRect();
    // cal the middle point and then set it as a origin(0,0)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Calculate the magnitude (length) of the vector
    const magnitude = Math.min(Math.sqrt(x * x + y * y), MAX_MAGNITUDE); // 限制 newMagnitude 不超过 MAX_MAGNITUDE
    // Calculate the direction of the vector
    const direction = Math.atan2(y, x);

    // Send the magnitude and direction to the server
    move({ magnitude: magnitude, direction: direction });
};
