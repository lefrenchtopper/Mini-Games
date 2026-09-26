let currentQRCode = null;

const textInput = document.getElementById("qrText");
const sizeInput = document.getElementById("qrSize");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const preview = document.getElementById("qrPreview");
const charCount = document.getElementById("charCount");


/* =========================
   CHARACTER COUNT
========================= */

textInput.addEventListener("input", () => {

    charCount.textContent =
        textInput.value.length;

});


/* =========================
   GENERATE
========================= */

function generateQR() {

    const text =
        textInput.value.trim();

    if (!text) {

        alert("Enter some text or a URL first.");

        textInput.focus();

        return;
    }

    preview.innerHTML = "";

    const qrContainer =
        document.createElement("div");

    qrContainer.id = "qrcode";

    preview.appendChild(qrContainer);

    currentQRCode =
        new QRCode(qrContainer, {

            text: text,

            width: Number(sizeInput.value),

            height: Number(sizeInput.value),

            colorDark: "#1c1a14",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        });

    downloadBtn.disabled = false;

    copyBtn.disabled = false;
}


/* =========================
   DOWNLOAD
========================= */

downloadBtn.addEventListener(
    "click",
    () => {

        const canvas =
            document.querySelector(
                "#qrcode canvas"
            );

        const image =
            document.querySelector(
                "#qrcode img"
            );

        let url = "";

        if (canvas) {

            url =
                canvas.toDataURL(
                    "image/png"
                );

        } else if (image) {

            url = image.src;
        }

        if (!url) {
            return;
        }

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "minihub-qr-code.png";

        document.body.appendChild(link);

        link.click();

        link.remove();
    }
);


/* =========================
   COPY
========================= */

copyBtn.addEventListener(
    "click",
    async () => {

        const text =
            textInput.value.trim();

        if (!text) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                text
            );

            copyBtn.textContent =
                "Copied!";

            setTimeout(() => {

                copyBtn.textContent =
                    "Copy";

            }, 1500);

        } catch {

            alert(
                "Unable to copy automatically."
            );
        }
    }
);


/* =========================
   QUICK OPTIONS
========================= */

document
    .querySelectorAll(".quick-options button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                textInput.value =
                    button.dataset.text;

                charCount.textContent =
                    textInput.value.length;

                generateQR();
            }
        );

    });


/* =========================
   CLEAR
========================= */

clearBtn.addEventListener(
    "click",
    () => {

        textInput.value = "";

        charCount.textContent = "0";

        preview.innerHTML = `
            <div class="empty-qr">
                <div class="empty-icon">▦</div>
                <h3>Your QR code will appear here</h3>
                <p>
                    Enter some content and click
                    Generate QR Code.
                </p>
            </div>
        `;

        downloadBtn.disabled = true;

        copyBtn.disabled = true;

        currentQRCode = null;
    }
);


/* =========================
   BUTTON
========================= */

generateBtn.addEventListener(
    "click",
    generateQR
);


/* =========================
   CTRL + ENTER
========================= */

textInput.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            generateQR();
        }
    }
);