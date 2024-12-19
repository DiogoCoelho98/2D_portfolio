// Game introductory message
export function displayIntroMessage() {
    const noteElement = document.getElementsByClassName("note")[0];

    function note(text) {
        let currentText = "";
        let index = 0;

        function displayCharacter() {
            if (index < text.length) {
                currentText += text[index];
                noteElement.innerHTML = currentText;
                index++;
                setTimeout(displayCharacter, 10); // Delay between characters
            } else {
                setTimeout(() => {
                    noteElement.innerHTML = "";
                }, 2500);
            }
        }
        displayCharacter();
    }

    setTimeout(() => {
        note("Click or tap the left mouse button<br>to move and explore my portfolio!<br>Tip: Get close to items on the map <br>to discover more.<br><br>I hope you enjoy the project<br>as much as I enjoyed working on it!<br><br><br>Have fun!");
    }, 1000);
}



// Displays boundaries dialogues
export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
    
    dialogueUI.style.display = "block";
    
    let index = 0;
    let currentText = "";

    
    const strippedText = stripAnchorTags(text);

    // Typing effect
    const intervalRef = setInterval(() => {
        if (index < strippedText.length) {
            currentText += strippedText[index];
            dialogue.innerHTML = currentText;
            index++;
        } else {
            dialogue.innerHTML = text;
            clearInterval(intervalRef);
        }
    }, 10);

    const closeBtn = document.getElementById("close");

    function onCloseBtnClick() {
        onDisplayEnd();

        dialogueUI.style.display = "none";
        dialogue.innerHTML = "";

        clearInterval(intervalRef);

        closeBtn.removeEventListener("click", onCloseBtnClick);
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
}
// Function to strip the href attributes and preserve inner text
function stripAnchorTags(text) {
    return text.replace(/<a[^>]*>(.*?)<\/a>/g, "$1");
}



// Adjust camera scale based on window aspect ratio
export function setCamScale(k) {
    const resizeFactor = k.width() / k.height();
    const scaleFactor = resizeFactor < 1 ? 1 : 1.5;

    k.camScale(k.vec2(scaleFactor));
}