/*
    scatter: {
        ratio: float,
        opacity: float,
        fill: string | CanvasGradient,
        fillType: "color" | "gradient",
        placement: "random" | "center",
        center?: { x: number, y: number },
        placementOffset?: number
        placementOffsetVariation?: number
        drawShape: (ctx) => void
    }
*/

function drawShapeRectangle({
    size,
    sizeVariation = 0,
    elongation = 2,
    elongationVariation = 0,
    stroke = false,
    lineWidth = 0.1,
    glow = 0,
}) {
    return (ctx) => {
        var cSize = size * (1 + Math.random() * sizeVariation);
        const rand = Math.random();
        const flipped = Math.random() > 0.5;
        if (flipped) {
            ctx.scale(
                Math.round(Math.random()) == 1 ? 1 : -1,
                Math.round(Math.random()) == 1 ? 1 : -1
            );
        }
        ctx.shadowBlur = glow * size;
        ctx.lineWidth = size * lineWidth;
        ctx.beginPath();
        // rotate 45 deg
        ctx.rotate(45 * Math.PI / 180);
        const lSize = cSize * (elongation + rand * elongationVariation);
        ctx.translate(-cSize / 2, -lSize / 2);
        ctx.roundRect(0, 0, cSize, lSize, [cSize]);
        if (stroke) ctx.stroke();
        else ctx.fill();
    }
}

class WallpaperGen {
    constructor({
        width,
        height,
        backgroundColor = "#2c2c2c",
        scatters = [],
        center = { x: width / 2, y: height / 2 },
        gapSize = 0
    }) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width + gapSize;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;
        this.scatters = scatters;
        this.center = center;
        this.gapSize = gapSize;
    }

    generate() {
        const { ctx, canvas } = this;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const scatter of this.scatters) {
            console.log(scatter);
            this.drawScatter(scatter);
        }
    }

    drawScatter(scatter) {
        switch (scatter.fillType) {
            case "color":
                this._drawColorScatter(scatter);
                break;
            case "gradient":
                this._drawGradientScatter(scatter);
                break;
        }
    }

    _drawColorScatter(scatter, ctx = this.ctx, canvas = this.canvas) {
        const scatterCount = (canvas.width * canvas.height ** 0.5) * scatter.ratio;
        console.log(scatterCount);
        ctx.fillStyle = scatter.fill;
        ctx.strokeStyle = scatter.fill;
        ctx.shadowColor = scatter.fill;
        let x, y;
        for (let i = 0; i < scatterCount; i++) {
            if (scatter.placement === "random") {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            }
            else if (scatter.placement === "center") {
                const centerX = this.center.x;
                const centerY = this.center.y;
                let offset = scatter.placementOffset || 0;
                if (scatter.placementOffsetVariation) {
                    offset += Math.random() * scatter.placementOffsetVariation;
                }
                const angle = Math.random() * Math.PI * 2;
                x = centerX + Math.cos(angle) * offset;
                y = centerY + Math.sin(angle) * offset;
            }
            ctx.save();
            ctx.globalAlpha = scatter.opacity;
            ctx.translate(x, y);
            scatter.drawShape(ctx);
            ctx.restore();
        }
    }

    _drawGradientScatter(scatter) {
        const newCanvas = document.createElement('canvas');
        const ctx2 = newCanvas.getContext('2d');
        newCanvas.width = this.canvas.width;
        newCanvas.height = this.canvas.height;
        ctx2.clearRect(0, 0, newCanvas.width, newCanvas.height);

        this._drawColorScatter({
            ...scatter,
            opacity: 1,
            fill: "#ffffff",
            fillType: "color"
        }, ctx2, newCanvas);

        let gradient;
        if (scatter.gradientStart != undefined) {
            gradient = ctx2.createLinearGradient(scatter.gradientStart || 0, 0, scatter.gradientEnd || newCanvas.width, 0);
        }
        else {
            gradient = ctx2.createRadialGradient(this.center.x, this.center.y, 200, this.center.x, this.center.y, newCanvas.height);
        }
        for (let i = 0; i < scatter.fill.length; i++) {
            gradient.addColorStop(i / scatter.fill.length, scatter.fill[i]);
        }
        ctx2.fillStyle = gradient;
        ctx2.globalCompositeOperation = "source-in";
        ctx2.fillRect(0, 0, newCanvas.width, newCanvas.height);

        this.ctx.globalAlpha = scatter.opacity;
        this.ctx.drawImage(newCanvas, 0, 0);
    }

    download() {
        const link = document.createElement("a");
        link.download = "wallpaper.png";

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;

        ctx.drawImage(
            this.canvas,
            0,
            0
        )
        ctx.drawImage(
            this.canvas,
            this.width / 2 + this.gapSize,
            0,
            this.width / 2,
            this.height,

            this.width / 2,
            0,
            this.width / 2,
            this.height
        );

        const url = canvas.toDataURL("image/png");
        link.href = url;
        link.click();
    }
}

const gapSize = 64;
const width = 3840;
const height = 1080;
const baseSize = 200;

const gradients = ["#e91e63", "#9c27b0", "#8bc34a", "#03a9f4", "#e91e63", "#9c27b0", "#8bc34a", "#03a9f4", "#e91e63", "#9c27b0", "#8bc34a", "#03a9f4"]

const wallgen = new WallpaperGen({
    width,
    height,
    gapSize,
    backgroundColor: "#2c2c2c",
    center: {
        x: width * 0.75,
        y: height / 2
    },
    scatters: [
        // Background

        {
            ratio: 0.0001,
            opacity: 1,
            fill: "#222222",
            fillType: "color",
            placement: "random",
            drawShape: drawShapeRectangle({
                size: baseSize / 1.25,
                sizeVariation: 0.3,
                elongation: 2,
                elongationVariation: 3
            })
        }, {
            ratio: 0.0001,
            opacity: 1,
            fill: "#222222",
            fillType: "color",
            placement: "random",
            drawShape: drawShapeRectangle({
                size: baseSize / 1.25,
                sizeVariation: 0.3,
                elongation: 2,
                elongationVariation: 4,
                stroke: true,
                lineWidth: 0.05
            })
        }, {
            ratio: 0.00025,
            opacity: 0.8,
            fill: "#111111",
            fillType: "color",
            placement: "random",
            drawShape: drawShapeRectangle({
                size: baseSize / 2,
                elongation: 2,
                elongationVariation: 3,
            })
        }, {
            ratio: 0.0001,
            opacity: 0.8,
            fill: "#111111",
            fillType: "color",
            placement: "random",
            drawShape: drawShapeRectangle({
                size: baseSize / 2,
                elongation: 2,
                elongationVariation: 3,
                lineWidth: 0.05,
                stroke: true
            })
        },
        {
            ratio: 0.00025,
            opacity: 0.8,
            fill: "#111111",
            fillType: "color",
            placement: "center",
            placementOffset: baseSize / 4,
            placementOffsetVariation: baseSize,
            drawShape: drawShapeRectangle({
                size: baseSize / 3,
                elongation: 2,
                elongationVariation: 4,
            })
        },
        // Foreground
        {
            ratio: 0.0005,
            opacity: 0.5,
            fill: gradients.sort(() => Math.random() - 0.5),
            fillType: "gradient",
            placement: "center",
            placementOffset: baseSize * 2,
            placementOffsetVariation: baseSize * 8,
            gradientStart: 0,
            drawShape: drawShapeRectangle({
                size: baseSize / 8,
                sizeVariation: 4,
                elongation: 2,
                elongationVariation: 3,
                lineWidth: 0.1,
                stroke: true
            })
        }, {
            ratio: 0.0005,
            opacity: 1,
            fill: gradients.sort(() => Math.random() - 0.5).slice(0, 4),
            fillType: "gradient",
            placement: "center",
            placementOffset: baseSize,
            placementOffsetVariation: baseSize * 1.5,
            drawShape: drawShapeRectangle({
                size: baseSize / 6,
                sizeVariation: 0,
                elongation: 2,
                elongationVariation: 3,
                lineWidth: 0.1,
                glow: 1,
                stroke: true
            })
        }, {
            ratio: 0.0015,
            opacity: 1,
            fill: gradients.sort(() => Math.random() - 0.5),
            fillType: "gradient",
            placement: "center",
            gradientStart: 0,
            placementOffset: baseSize * 2,
            placementOffsetVariation: baseSize * 27,
            drawShape: drawShapeRectangle({
                size: baseSize / 6,
                sizeVariation: 0,
                elongation: 2,
                elongationVariation: 3,
                lineWidth: 0.1,
                glow: 2,
                stroke: true
            })
        }
    ]
});

wallgen.generate();
document.body.appendChild(wallgen.canvas);

wallgen.canvas.addEventListener("click", () => {
    wallgen.download();
})