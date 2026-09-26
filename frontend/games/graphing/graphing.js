const canvas =
    document.getElementById("graphCanvas");

const ctx =
    canvas.getContext("2d");

const expressionInput =
    document.getElementById("expression");

const plotBtn =
    document.getElementById("plotBtn");

const resetBtn =
    document.getElementById("resetBtn");

const resetViewBtn =
    document.getElementById("resetView");

const zoomInBtn =
    document.getElementById("zoomIn");

const zoomOutBtn =
    document.getElementById("zoomOut");

const gridToggle =
    document.getElementById("gridToggle");

const axisToggle =
    document.getElementById("axisToggle");

const coordinates =
    document.getElementById("coordinates");

const errorMessage =
    document.getElementById("errorMessage");

const functionDisplay =
    document.getElementById("functionDisplay");

const xRange =
    document.getElementById("xRange");

const yRange =
    document.getElementById("yRange");


/* ==========================================
   GRAPH SETTINGS
========================================== */

let scale = 45;

let offsetX = 0;
let offsetY = 0;

let expression = "x^2";

let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let startOffsetX = 0;
let startOffsetY = 0;


/* ==========================================
   CANVAS SIZE
========================================== */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    drawGraph();
}


/* ==========================================
   WORLD → SCREEN
========================================== */

function worldToScreen(x, y) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    return {

        x:
            width / 2 +
            offsetX +
            x * scale,

        y:
            height / 2 +
            offsetY -
            y * scale
    };
}


/* ==========================================
   SCREEN → WORLD
========================================== */

function screenToWorld(x, y) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    return {

        x:
            (x -
                width / 2 -
                offsetX) /
            scale,

        y:
            -(y -
                height / 2 -
                offsetY) /
            scale
    };
}


/* ==========================================
   GRID
========================================== */

function drawGrid() {

    if (!gridToggle.checked) {
        return;
    }

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    ctx.lineWidth = 1;

    /*
        Determine grid spacing.
    */

    let gridStep = 1;

    if (scale < 25) {
        gridStep = 2;
    }

    if (scale < 12) {
        gridStep = 5;
    }

    const left =
        screenToWorld(0, 0).x;

    const right =
        screenToWorld(width, 0).x;

    const top =
        screenToWorld(0, 0).y;

    const bottom =
        screenToWorld(0, height).y;


    ctx.strokeStyle = "#eee9e1";

    ctx.beginPath();


    const startX =
        Math.floor(left / gridStep) *
        gridStep;

    for (
        let x = startX;
        x <= right;
        x += gridStep
    ) {

        const screen =
            worldToScreen(x, 0);

        ctx.moveTo(
            screen.x,
            0
        );

        ctx.lineTo(
            screen.x,
            height
        );
    }


    const startY =
        Math.floor(bottom / gridStep) *
        gridStep;

    for (
        let y = startY;
        y <= top;
        y += gridStep
    ) {

        const screen =
            worldToScreen(0, y);

        ctx.moveTo(
            0,
            screen.y
        );

        ctx.lineTo(
            width,
            screen.y
        );
    }

    ctx.stroke();


    /*
        Labels
    */

    ctx.fillStyle = "#aaa39b";

    ctx.font = "10px Inter, Arial";

    for (
        let x = startX;
        x <= right;
        x += gridStep
    ) {

        if (Math.abs(x) < 0.0001) {
            continue;
        }

        const screen =
            worldToScreen(x, 0);

        if (
            screen.x > 5 &&
            screen.x < width - 5
        ) {

            ctx.fillText(
                formatNumber(x),
                screen.x + 3,
                worldToScreen(0, 0).y + 13
            );
        }
    }


    for (
        let y = startY;
        y <= top;
        y += gridStep
    ) {

        if (Math.abs(y) < 0.0001) {
            continue;
        }

        const screen =
            worldToScreen(0, y);

        if (
            screen.y > 5 &&
            screen.y < height - 5
        ) {

            ctx.fillText(
                formatNumber(y),
                worldToScreen(0, 0).x + 5,
                screen.y - 3
            );
        }
    }
}


/* ==========================================
   AXES
========================================== */

function drawAxes() {

    if (!axisToggle.checked) {
        return;
    }

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    const origin =
        worldToScreen(0, 0);

    ctx.strokeStyle = "#3c3832";

    ctx.lineWidth = 1.5;

    ctx.beginPath();


    /*
        X axis
    */

    ctx.moveTo(
        0,
        origin.y
    );

    ctx.lineTo(
        width,
        origin.y
    );


    /*
        Y axis
    */

    ctx.moveTo(
        origin.x,
        0
    );

    ctx.lineTo(
        origin.x,
        height
    );

    ctx.stroke();


    /*
        Axis arrows
    */

    ctx.fillStyle = "#3c3832";

    ctx.beginPath();

    ctx.moveTo(
        width - 8,
        origin.y - 4
    );

    ctx.lineTo(
        width - 1,
        origin.y
    );

    ctx.lineTo(
        width - 8,
        origin.y + 4
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        origin.x - 4,
        8
    );

    ctx.lineTo(
        origin.x,
        1
    );

    ctx.lineTo(
        origin.x + 4,
        8
    );

    ctx.fill();
}


/* ==========================================
   FUNCTION PARSER
========================================== */

function compileFunction(input) {

    let expr =
        input
            .toLowerCase()
            .replace(/\s+/g, "");

    /*
        Power:
        x^2 → Math.pow(x,2)
    */

    expr =
        expr.replace(
            /([a-z0-9().]+)\^([a-z0-9().]+)/g,
            "Math.pow($1,$2)"
        );


    /*
        Functions
    */

    expr =
        expr.replace(
            /sqrt\(/g,
            "Math.sqrt("
        );

    expr =
        expr.replace(
            /abs\(/g,
            "Math.abs("
        );

    expr =
        expr.replace(
            /sin\(/g,
            "Math.sin("
        );

    expr =
        expr.replace(
            /cos\(/g,
            "Math.cos("
        );

    expr =
        expr.replace(
            /tan\(/g,
            "Math.tan("
        );

    expr =
        expr.replace(
            /log\(/g,
            "Math.log("
        );

    expr =
        expr.replace(
            /ln\(/g,
            "Math.log("
        );

    expr =
        expr.replace(
            /exp\(/g,
            "Math.exp("
        );


    /*
        Constants
    */

    expr =
        expr.replace(
            /\bpi\b/g,
            "Math.PI"
        );

    expr =
        expr.replace(
            /\be\b/g,
            "Math.E"
        );


    /*
        Basic multiplication.

        2x → 2*x
    */

    expr =
        expr.replace(
            /(\d)(x)/g,
            "$1*$2"
        );

    expr =
        expr.replace(
            /(x)(\d)/g,
            "$1*$2"
        );


    /*
        Create function.
    */

    try {

        const fn =
            new Function(
                "x",
                `"use strict"; return (${expr});`
            );

        /*
            Test it.
        */

        const test =
            fn(1);

        if (
            typeof test !== "number" ||
            Number.isNaN(test)
        ) {

            throw new Error(
                "Invalid expression"
            );
        }

        return fn;

    } catch {

        throw new Error(
            "Could not understand this function."
        );
    }
}


/* ==========================================
   DRAW FUNCTION
========================================== */

function drawFunction(fn) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    const left =
        screenToWorld(0, 0).x;

    const right =
        screenToWorld(width, 0).x;

    const samples =
        Math.max(
            800,
            Math.floor(width * 2)
        );

    const step =
        (right - left) /
        samples;


    ctx.strokeStyle = "#b8832a";

    ctx.lineWidth = 2.5;

    ctx.lineJoin = "round";

    ctx.lineCap = "round";


    let previous = null;

    ctx.beginPath();


    for (
        let i = 0;
        i <= samples;
        i++
    ) {

        const x =
            left +
            i * step;

        let y;

        try {

            y = fn(x);

        } catch {

            previous = null;

            continue;
        }


        if (
            typeof y !== "number" ||
            !Number.isFinite(y)
        ) {

            previous = null;

            continue;
        }


        /*
            Prevent huge jumps
            across asymptotes.
        */

        if (
            Math.abs(y) > 100000
        ) {

            previous = null;

            continue;
        }


        const point =
            worldToScreen(x, y);


        if (
            previous &&
            Math.abs(
                point.y -
                previous.y
            ) < height * 2
        ) {

            ctx.lineTo(
                point.x,
                point.y
            );

        } else {

            ctx.moveTo(
                point.x,
                point.y
            );
        }

        previous = point;
    }

    ctx.stroke();
}


/* ==========================================
   MAIN DRAW
========================================== */

function drawGraph() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    if (!width || !height) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawGrid();

    drawAxes();


    try {

        const fn =
            compileFunction(
                expression
            );

        drawFunction(fn);

        errorMessage.textContent = "";

    } catch (error) {

        errorMessage.textContent =
            error.message;
    }


    updateRangeDisplay();
}


/* ==========================================
   PLOT
========================================== */

function plot() {

    const value =
        expressionInput.value.trim();

    if (!value) {

        errorMessage.textContent =
            "Enter a function first.";

        return;
    }

    expression = value;

    functionDisplay.textContent =
        `f(x) = ${value}`;

    drawGraph();
}


/* ==========================================
   RESET VIEW
========================================== */

function resetView() {

    scale = 45;

    offsetX = 0;

    offsetY = 0;

    drawGraph();
}


/* ==========================================
   ZOOM
========================================== */

function zoom(factor) {

    scale *= factor;

    scale =
        Math.max(
            5,
            Math.min(
                300,
                scale
            )
        );

    drawGraph();
}


/* ==========================================
   RANGE DISPLAY
========================================== */

function updateRangeDisplay() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    const left =
        screenToWorld(0, 0).x;

    const right =
        screenToWorld(width, 0).x;

    const bottom =
        screenToWorld(0, height).y;

    const top =
        screenToWorld(0, 0).y;

    xRange.textContent =
        `${formatNumber(left)} → ${formatNumber(right)}`;

    yRange.textContent =
        `${formatNumber(bottom)} → ${formatNumber(top)}`;
}


/* ==========================================
   NUMBER FORMAT
========================================== */

function formatNumber(number) {

    if (
        Math.abs(number) < 0.001
    ) {

        return "0";
    }

    return Number(
        number.toFixed(2)
    ).toString();
}


/* ==========================================
   MOUSE POSITION
========================================== */

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();

        const x =
            event.clientX -
            rect.left;

        const y =
            event.clientY -
            rect.top;

        const point =
            screenToWorld(x, y);

        coordinates.textContent =
            `x: ${point.x.toFixed(2)}   y: ${point.y.toFixed(2)}`;


        /*
            Pan
        */

        if (isDragging) {

            offsetX =
                startOffsetX +
                (
                    event.clientX -
                    dragStartX
                );

            offsetY =
                startOffsetY +
                (
                    event.clientY -
                    dragStartY
                );

            drawGraph();
        }
    }
);


/* ==========================================
   DRAG START
========================================== */

canvas.addEventListener(
    "mousedown",
    event => {

        isDragging = true;

        dragStartX =
            event.clientX;

        dragStartY =
            event.clientY;

        startOffsetX =
            offsetX;

        startOffsetY =
            offsetY;

        canvas.style.cursor =
            "grabbing";
    }
);


/* ==========================================
   DRAG END
========================================== */

window.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

        canvas.style.cursor =
            "crosshair";
    }
);


/* ==========================================
   WHEEL ZOOM
========================================== */

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        const rect =
            canvas.getBoundingClientRect();

        const mouseX =
            event.clientX -
            rect.left;

        const mouseY =
            event.clientY -
            rect.top;


        /*
            Keep the point
            underneath the cursor
            fixed while zooming.
        */

        const before =
            screenToWorld(
                mouseX,
                mouseY
            );


        const factor =
            event.deltaY < 0
                ? 1.15
                : 0.87;

        scale *= factor;

        scale =
            Math.max(
                5,
                Math.min(
                    300,
                    scale
                )
            );


        const after =
            screenToWorld(
                mouseX,
                mouseY
            );


        offsetX +=
            (after.x - before.x) *
            scale;

        offsetY -=
            (after.y - before.y) *
            scale;

        drawGraph();
    },
    {
        passive: false
    }
);


/* ==========================================
   BUTTONS
========================================== */

plotBtn.addEventListener(
    "click",
    plot
);

expressionInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            plot();
        }
    }
);


zoomInBtn.addEventListener(
    "click",
    () => zoom(1.25)
);

zoomOutBtn.addEventListener(
    "click",
    () => zoom(.8)
);

resetViewBtn.addEventListener(
    "click",
    resetView
);

resetBtn.addEventListener(
    "click",
    () => {

        expressionInput.value =
            "x^2";

        expression =
            "x^2";

        resetView();
    }
);


gridToggle.addEventListener(
    "change",
    drawGraph
);

axisToggle.addEventListener(
    "change",
    drawGraph
);


/* ==========================================
   EXAMPLES
========================================== */

document
    .querySelectorAll(
        ".examples button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                expressionInput.value =
                    button.dataset.expression;

                plot();
            }
        );
    });


/* ==========================================
   INITIALIZE
========================================== */

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

plot();