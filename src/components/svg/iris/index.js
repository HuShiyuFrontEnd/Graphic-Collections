// https://codepen.io/samarthg/pen/bxwXLV
//path的一些方法：getTotalLength getPointAtLength
//Math.atan2 通过一组x/y值求出反切值

class PerlinNoise {
    constructor() {
        this.permutation = [
            151,
            160,
            137,
            91,
            90,
            15,
            131,
            13,
            201,
            95,
            96,
            53,
            194,
            233,
            7,
            225,
            140,
            36,
            103,
            30,
            69,
            142,
            8,
            99,
            37,
            240,
            21,
            10,
            23,
            190,
            6,
            148,
            247,
            120,
            234,
            75,
            0,
            26,
            197,
            62,
            94,
            252,
            219,
            203,
            117,
            35,
            11,
            32,
            57,
            177,
            33,
            88,
            237,
            149,
            56,
            87,
            174,
            20,
            125,
            136,
            171,
            168,
            68,
            175,
            74,
            165,
            71,
            134,
            139,
            48,
            27,
            166,
            77,
            146,
            158,
            231,
            83,
            111,
            229,
            122,
            60,
            211,
            133,
            230,
            220,
            105,
            92,
            41,
            55,
            46,
            245,
            40,
            244,
            102,
            143,
            54,
            65,
            25,
            63,
            161,
            1,
            216,
            80,
            73,
            209,
            76,
            132,
            187,
            208,
            89,
            18,
            169,
            200,
            196,
            135,
            130,
            116,
            188,
            159,
            86,
            164,
            100,
            109,
            198,
            173,
            186,
            3,
            64,
            52,
            217,
            226,
            250,
            124,
            123,
            5,
            202,
            38,
            147,
            118,
            126,
            255,
            82,
            85,
            212,
            207,
            206,
            59,
            227,
            47,
            16,
            58,
            17,
            182,
            189,
            28,
            42,
            223,
            183,
            170,
            213,
            119,
            248,
            152,
            2,
            44,
            154,
            163,
            70,
            221,
            153,
            101,
            155,
            167,
            43,
            172,
            9,
            129,
            22,
            39,
            253,
            19,
            98,
            108,
            110,
            79,
            113,
            224,
            232,
            178,
            185,
            112,
            104,
            218,
            246,
            97,
            228,
            251,
            34,
            242,
            193,
            238,
            210,
            144,
            12,
            191,
            179,
            162,
            241,
            81,
            51,
            145,
            235,
            249,
            14,
            239,
            107,
            49,
            192,
            214,
            31,
            181,
            199,
            106,
            157,
            184,
            84,
            204,
            176,
            115,
            121,
            50,
            45,
            127,
            4,
            150,
            254,
            138,
            236,
            205,
            93,
            222,
            114,
            67,
            29,
            24,
            72,
            243,
            141,
            128,
            195,
            78,
            66,
            215,
            61,
            156,
            180
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = this.permutation[i];
        }
    }
  
    noise(x = 0, y = 0, z = 0) {
      let X = Math.floor(x) & 255;
      let Y = Math.floor(y) & 255;
      let Z = Math.floor(z) & 255;
  
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
  
      let u = this.fade(x);
      let v = this.fade(y);
      let w = this.fade(z);
  
      let A = this.p[X] + Y;
      let AA = this.p[A] + Z;
      let AB = this.p[A + 1] + Z;
      let B = this.p[X + 1] + Y;
      let BA = this.p[B] + Z;
      let BB = this.p[B + 1] + Z;
  
      return this.lerp(
        w,
        this.lerp(
          v,
          this.lerp(
            u,
            this.grad(this.p[AA], x, y, z), // AND ADD
            this.grad(this.p[BA], x - 1, y, z)
          ), // BLENDED
          this.lerp(
            u,
            this.grad(this.p[AB], x, y - 1, z), // RESULTS
            this.grad(this.p[BB], x - 1, y - 1, z)
          )
        ), // FROM  8
        this.lerp(
          v,
          this.lerp(
            u,
            this.grad(this.p[AA + 1], x, y, z - 1), // CORNERS
            this.grad(this.p[BA + 1], x - 1, y, z - 1)
          ), // OF CUBE
          this.lerp(
            u,
            this.grad(this.p[AB + 1], x, y - 1, z - 1),
            this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
          )
        )
      );
    }
    //在 0 到 1之间，是一个S型的曲线
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    lerp(t, a, b) {
        return a + t * (b - a);
    }
  
    grad(hash, x, y, z) {
        let h = hash & 15;
        let u = h < 8 ? x : y;
        let v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    }
}

function pathToPerlinPolyline(path, steps, fluctuation, inc) {  
    const NS = 'http://www.w3.org/2000/svg'
    const len = path.getTotalLength()
    const delta = len / steps
    const polyline = document.createElementNS(NS, 'polyline')
    const points = []
    const p = new PerlinNoise()
    for(let i = 0; i < steps; i++) {
        const prev = i === 0 ? steps : i - 1
        const p1 = path.getPointAtLength( prev * delta )
        const p2 = path.getPointAtLength( i * delta )
        const heading = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        const perp = heading - (Math.PI * 0.5)
        const mag = fluctuation * p.noise( i * inc )
        const deltaPosX = mag * Math.cos(perp)
        const deltaPosY = mag * Math.sin(perp)
        points.push([p2.x + deltaPosX, p2.y + deltaPosY])
    }
    polyline.setAttribute('points', points.map(p => p.join(',')).join(' '))
    polyline.setAttribute('stroke', 'black')
    polyline.setAttribute('fill', 'none')
    return polyline
}

const hue = ~~(Math.random()*360)
document.body.style.background = `radial-gradient(
    hsl(${hue}, 85%, 20%) 1%, 
    hsl(${hue + 30 + ~~(Math.random()*30)}, 85%, 20%)
)`

const width = window.innerWidth
const height = window.innerHeight
const size = Math.min(width, height)
const NS = 'http://www.w3.org/2000/svg'
const svg = document.createElementNS(NS, 'svg')
svg.setAttribute('NS', NS)
svg.setAttribute('width', size)
svg.setAttribute('height', size)
svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
document.body.appendChild(svg)

// <linearGradient id="e" x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop stop-color="steelblue" offset="0" />
//         <stop stop-color="transparent" offset="1" />
//     </linearGradient>

const center = [
    size * 0.5,
    size * 0.5
]

const defs = document.createElementNS(NS, 'defs')
const gradient = document.createElementNS(NS, 'linearGradient')
gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
gradient.setAttribute('id', 'grad')
const stop1 = document.createElementNS(NS, 'stop')
stop1.setAttribute('stop-color',"white")
stop1.setAttribute('offset',"0")
const stop2 = document.createElementNS(NS, 'stop')
stop2.setAttribute('stop-color',"white")
stop2.setAttribute('offset',"0.75")
const stop3 = document.createElementNS(NS, 'stop')
stop3.setAttribute('stop-color',"white")
stop3.setAttribute('stop-opacity',"0")
stop3.setAttribute('offset',"1")
gradient.appendChild(stop1)
gradient.appendChild(stop2)
gradient.appendChild(stop3)
defs.appendChild(gradient)
svg.appendChild(defs)

const count = 200
const R = size * 0.25
const r = R * 0.25
const TAU = 2 * Math.PI
const deltaA = TAU / count

const perlin = new PerlinNoise()
for(let a = 0, i = 0; a < TAU - deltaA; a += deltaA, i++) {
    const heading = a * 180 / Math.PI
    const outerR = R + R * perlin.noise(0.05 * Math.random())
    const rStart = r + r * perlin.noise(0.075 * Math.random())
    const x1 = center[0] + rStart * Math.cos(a)
    const y1 = center[1] + rStart * Math.sin(a)
    const x2 = center[0] + outerR * Math.cos(a)
    const y2 = center[1] + outerR * Math.sin(a)
    const grad = gradient.cloneNode(true)
    grad.setAttribute('x1', x1)
    grad.setAttribute('y1', y1)
    grad.setAttribute('x2', x2)
    grad.setAttribute('y2', y2)
    grad.setAttribute('id', `grad${i}`)
    defs.appendChild(grad)
    
    const full = document.createElementNS(NS, 'path')
    full.setAttribute('d', `
        M ${x1},${y1}
        L ${x2},${y2}
    `)
    const fullLine = pathToPerlinPolyline(full, 100, 5, 0.075 * Math.random())
    fullLine.setAttribute('stroke', `url("#grad${i}")`)
    svg.appendChild(fullLine)
    const RHalf = R * 0.5 + R * perlin.noise(0.075 * Math.random())
    const outer = document.createElementNS(NS, 'path')
    const outerA = a + deltaA * 0.5
    outer.setAttribute('d', `
        M ${center[0] + RHalf * Math.cos(outerA)},${center[1] + RHalf * Math.sin(outerA)}
        L ${center[0] + outerR * Math.cos(outerA)},${center[1] + outerR * Math.sin(outerA)}
    `)
    const outerLine = pathToPerlinPolyline(outer, 100, 5, 0.075 * Math.random())
    outerLine.setAttribute('stroke', `url("#grad${i}")`)
    svg.appendChild(outerLine)
}
