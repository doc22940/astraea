const PI2 = Math.PI * 2

function setPalette() {
    p8Pal = {
        black: color(0, 0, 0),
        darkBlue: color(29, 43, 83),
        darkPurple: color(126, 37, 83),
        darkGreen: color(0, 135, 81),
        brown: color(171, 82, 54),
        darkGray: color(95, 87, 79),
        lightGray: color(194, 195, 199),
        white: color(255, 241, 232),
        red: color(255, 0, 77),
        orange: color(255, 163, 0),
        yellow: color(255, 236, 39),
        green: color(0, 228, 54),
        blue: color(41, 173, 255),
        indigo: color(131, 118, 156),
        pink: color(255, 119, 168),
        peach: color(255, 204, 170)
    }
}

function pSet(x, y, c) {
    x = Math.floor(x)
    y = Math.floor(y)
    const index = (y * w + x) * 4
    px.pixels[index] = red(c)
    px.pixels[index + 1] = green(c)
    px.pixels[index + 2] = blue(c)
    px.pixels[index + 3] = alpha(c)
}

function pGet(x, y) {
    x = Math.floor(x)
    y = Math.floor(y)
    const index = (y * w + x) * 4
    const r = px.pixels[index]
    const g = px.pixels[index + 1]
    const b = px.pixels[index + 2]
    const a = px.pixels[index + 3]
    return color(r, g, b, a)
}

function mod(a, b) { return (a % b + b) % b }

class Grid {
    #table
    constructor(width, height, init) {
        this.width = width
        this.height = height
        this.#table = new Array(this.width * this.height).fill(init)
    }
    set(x, y, val) {
        if (x < 0 || this.width <= x) {
            throw new RangeError(`The argument must be between x ${0} and ${this.width - 1}.`)
        } else if (y < 0 || this.height <= y) {
            throw new RangeError(`The argument must be between y ${0} and ${this.height - 1}.`)
        } else {
            this.#table[y * this.width + x] = val
        }
    }
    get(x, y) {
        if (x < 0 || this.width <= x) {
            x = mod(x, this.width)
        }
        if (y < 0 || this.height <= y) {
            y = mod(y, this.height)
        }
        return this.#table[y * this.width + x]
    }
}

class PixelSphere {
    #sphereWidth
    constructor(diameter, speed = 1) {
        this.diameter = diameter
        this.grid = new Grid(this.diameter * 2, this.diameter, 0)
        this.#sphereWidth = this._getSphereWidth()
        this.speed = speed
    }

    _getSphereWidth() {
        // Reference: https://github.com/nesbox/TIC-80/blob/master/src/tic.c#L948-L961
        let sphereWidth = []
        const parity = 1 - this.diameter % 2
        let r = Math.floor(this.diameter / 2) - parity
        let y = -r
        let x = 0
        let d = 2 - 2 * r

        do {
            r = d
            if (r > y || d > x) {
                sphereWidth.push(x * 2 + 1 + parity)
                d += ++y * 2 + 1
            }
            if (r <= x) {
                d += ++x * 2 + 1
            }
        } while (y <= 0)
        return sphereWidth
    }

    _getWidth(y) {
        if (y < 0 || this.diameter <= y) {
            throw new RangeError(`The argument must be between ${0} and ${this.diameter - 1}.`)
        }

        let index
        if (y < Math.floor(this.diameter / 2) + this.diameter % 2) {
            index = y
        } else {
            index = this.diameter - y - 1
        }
        return this.#sphereWidth[index]
    }
    
    sphereNoise(x, y, noiseScale, off = 0) {
        const r = this.grid.width / PI2
        const phi = x / this.grid.width * PI2
        const theta = y / this.grid.height * Math.PI
        const nx = r * (Math.sin(theta) * Math.cos(phi) + 1 + off * 2)
        const ny = r * (Math.sin(theta) * Math.sin(phi) + 1 + off * 2)
        const nz = r * (Math.cos(theta) + 1 + off * 2)
        return noise(nx * noiseScale, ny * noiseScale, nz * noiseScale)
    }

    drawPlane(offX = 0, offY = 0) {
        for (let x = 0; x < this.grid.width; x++) {
            const gx = Math.floor(x - frameCount * this.speed)
            for (let y = 0; y < this.grid.height; y++) {
                pSet(x + offX, y + offY, this.grid.get(gx, y))
            }
        }
    }

    drawSphere(offX = 0, offY = 0) {
        for (let y = 0; y < this.diameter; y++) {
            const sw = this._getWidth(y)
            for (let x = 0; x < sw; x++) {
                const gx = Math.floor((x / sw + 0.5) * this.diameter - frameCount * this.speed)
                //console.log(gx)
                pSet(x + offX - sw / 2, y + offY, this.grid.get(gx, y))
            }
        }
    }
}

class Planet extends PixelSphere {
    constructor(diameter, speed = 1) {
        super(diameter, speed)

        const noiseScale = 0.6 / Math.sqrt(this.diameter)
        for (let x = 0; x < this.grid.width; x++) {
            for (let y = 0; y < this.grid.height; y++) {
                const n = this.sphereNoise(x, y, noiseScale, 0)
                // const hue = Math.floor(x / this.grid.width * 360)
                const hue = Math.floor(n * 360)
                this.grid.set(x, y, color(`hsb(${hue}, 80%, 100%)`))
            }
        }
    }
}
