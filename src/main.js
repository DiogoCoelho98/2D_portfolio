import { k } from "./kaboomCTX";
import { dialogueData, scaleFactor } from "./constants";
import { displayDialogue, setCamScale } from "./utils";
// Note message
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        function note(text) {
            const noteElement = document.querySelector(".note");

            let currentText = "";
            let index = 0;

            function displayCharacter() {
                if (index < text.length) {
                    currentText += text[index];
                    noteElement.innerHTML = currentText;
                    index++;
                    setTimeout(displayCharacter, 50);
                } else {
                    setTimeout(() => {
                        noteElement.innerHTML = "";
                    }, 7000);
                }
            }
            displayCharacter();
        }
        note("Tap/Press the mouse to move<br>and explore my portfolio!<br>Tip: Get near the items close to the walls.<br>Have Fun!");
    }, 2000);
});

// Loading assets
k.loadSprite("spritesheet", "./spritesheet.png", {
    // Frames
    sliceX: 39, // IMG width/tiles width (16)
    sliceY: 31,
    anims: {
        // 3 animations for 4 char positions
        "idle-down": 936, // one frame
        "walk-down": { from: 936, to: 939, loop: true, speed: 8},
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8},
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 }
    }
});

k.loadSprite("map", "./map.png");
k.setBackground(k.Color.fromHex("#311047"));

// Create a scene
k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    // Game object
    const map = k.add([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor)
    ]);
    // Player object
    const player = k.make([
        k.sprite("spritesheet", { anim: "idle-down" }), 
        k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }), // position, width, height
        k.body(),
        k.anchor("center"), // x, y coordenates start in the center 
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false // When the dialogue is open prevents the player from moving
        },
        "player",
    ]);

    for (let layer of layers) {
        if (layer.name === "boundaries") {
                for (let boundary of layer.objects) {
                    map.add([
                        // Position of game object
                        k.area({
                            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                        }),
                        // Position for the hitbox, area for the game object
                        k.body({ isStatic: true}), // Creates walls that not allow the char to overlap
                        k.pos(boundary.x, boundary.y),
                        boundary.name,
                    ]);

                    if (boundary.name) {
                        player.onCollide(boundary.name, () => {
                            player.isInDialogue = true;
                            displayDialogue(dialogueData[boundary.name], () => player.isInDialogue = false);
                        })
                    }
                }
                continue;
        }

        if (layer.name === "spawnpoints") {
            for (let entity of layer.objects) {
                if (entity.name === "player") {
                    // Player position
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                        (map.pos.y + entity.y) * scaleFactor
                    )
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    })

    // Camera follow the player
    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });
    // Player movement
    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        // Animations sprite to rotate the char
        const mouseAngle = player.pos.angle(worldMousePos);
        
        const lowerBound = 50;
        const upperBound = 125;
        // player up 
        if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up") {
            player.play("walk-up");
            player.direction = "up";
            return;
        }
        // player down
        if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down") {
            player.play("walk-down");
            player.direction = "down";
            return;
        }
        // player right
        if (Math.abs(mouseAngle) > upperBound) {
            player.flipX = false;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            return;
        }
        // player left
        if (Math.abs(mouseAngle) < lowerBound) {
            player.flipX = true;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            return;
        }
    });

    // Stops the movement animation of the player
    k.onMouseRelease(() => {
        if (player.direction === "down") {
            player.play("idle-down");
            return;
        } 
        if (player.direction === "up") {
            player.play("idle-up");
            return;
        }

        player.play("idle-side");
    });
});

k.go("main");