import { k } from "./kaboomCTX";
import { dialogueData, scaleFactor } from "./constants";
import { displayIntroMessage, displayDialogue, setCamScale } from "./utils";



document.addEventListener("DOMContentLoaded", () => {
    // Display introductory message
    displayIntroMessage();

    
    
    // Loading game assets
    k.loadSprite("spritesheet", "./spritesheet.png", {
        // Sprite slices
        sliceX: 39,
        sliceY: 31,
        // Idle animation frames
        anims: {
            "idle-down": 936,
            "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
            "idle-side": 975,
            "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
            "idle-up": 1014,
            "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 }
        }
    });
    k.loadSprite("map", "./map.png");



    k.setBackground(k.Color.fromHex("#311047"));

    
    
    // Game scene  
    k.scene("main", async () => {
        const mapData = await (await fetch("./map.json")).json();
        const layers = mapData.layers;
        // Add map to the game
        const map = k.add([
            k.sprite("map"),
            k.pos(0),
            k.scale(scaleFactor)
        ]);

        
        // Player object
        const player = k.make([
            k.sprite("spritesheet", { anim: "idle-down" }),
            k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }), // Player hitbox
            k.body(),
            k.anchor("center"),
            k.pos(),
            k.scale(scaleFactor),
            {
                speed: 250,
                direction: "down",
                isInDialogue: false
            },
            "player",
        ]);


        // Map layers
        for (let layer of layers) {
            if (layer.name === "boundaries") {
                // Boundaries and collision detection
                for (let boundary of layer.objects) {
                    map.add([
                        k.area({
                            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                        }),
                        k.body({ isStatic: true }),
                        k.pos(boundary.x, boundary.y),
                        boundary.name,
                    ]);
                    // Triggers dialogue when colliding with a boundary
                    if (boundary.name) {
                        player.onCollide(boundary.name, () => {
                            player.isInDialogue = true;
                            displayDialogue(dialogueData[boundary.name], () => player.isInDialogue = false);
                        });
                    }
                }
                continue;
            }


            // Set initial player position
            if (layer.name === "spawnpoints") {
                for (let entity of layer.objects) {
                    if (entity.name === "player") {
                        player.pos = k.vec2(
                            (map.pos.x + entity.x) * scaleFactor,
                            (map.pos.y + entity.y) * scaleFactor
                        );

                        k.add(player);
                        continue;
                    }
                }
            }
        }



        // Initial camera scale
        setCamScale(k);
        // Update camera scale on resize
        k.onResize(() => {
            setCamScale(k);
        });
        // Update camera position to follow the player
        k.onUpdate(() => {
            k.camPos(player.pos.x, player.pos.y + 100);
        });



        // Enable player movement with left mouse button
        k.onMouseDown((mouseBtn) => {
            if (mouseBtn !== "left" || player.isInDialogue) return;
        
            const worldMousePos = k.toWorld(k.mousePos());
            player.moveTo(worldMousePos, player.speed);
        
            // Update player animation based on mouse direction
            const mouseAngle = player.pos.angle(worldMousePos);
        
            const lowerBound = 50;
            const upperBound = 125;
        
            if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up") {
                player.play("walk-up");
                player.direction = "up";
            } else if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down") {
                player.play("walk-down");
                player.direction = "down";
            } else if (Math.abs(mouseAngle) > upperBound) {
                player.flipX = false;
                if (player.curAnim() !== "walk-side") player.play("walk-side");
                player.direction = "right";
            } else if (Math.abs(mouseAngle) < lowerBound) {
                player.flipX = true;
                if (player.curAnim() !== "walk-side") player.play("walk-side");
                player.direction = "left";
            }
        });
        // Disable player movement
        k.onMouseRelease(() => {
            if (player.direction === "down") {
                player.play("idle-down");
                return;
            } else if (player.direction === "up") {
                player.play("idle-up");
                return;
            } else {
                player.play("idle-side");
                return;
            }
        });
    });



    // Start game
    k.go("main");
});


