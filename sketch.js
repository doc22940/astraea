const size = 64
const w = size * 2
const h = size * 2 + 15
let px
let scaling
let p8Pal
let p8Font

let planet

function preload() {
    // https://www.lexaloffle.com/bbs/?tid=3760
    p8Font = loadFont("PICO-8_mono_upper.ttf")
}

function setup() {
    const minScale = 2
    scaling = Math.floor(Math.max(Math.min(windowWidth / w, (windowHeight - 485) / h), minScale)) // 最低倍率をminScale倍として、スクロールしないで画面に収まる最大倍率 
    const canvas = createCanvas(w * scaling, h * scaling)
    canvas.parent("canvas")
    px = createGraphics(w, h)
    noSmooth()

    setPalette()
    px.noStroke()
    px.textFont(p8Font, 5)
    px.textAlign(CENTER, TOP)
    px.fill(p8Pal.black)

    noiseSeed(0)
    planet = new Planet(size)
}

function draw() {
    px.background(p8Pal.lightGray)
    px.loadPixels()
    {
        planet.drawPlane(0, 7)
        planet.drawSphere(w / 2, planet.grid.height + 14)
    }
    px.updatePixels()
    {
        px.text("plane", w / 2, 1)
        px.text("sphere", w / 2, planet.grid.height + 8)
    }

    scale(scaling)
    image(px, 0, 0)

    // print(`fps: ${Math.floor(frameRate())}`)
}
