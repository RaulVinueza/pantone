const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const frequencyAnalyser = audioContext.createAnalyser()
frequencyAnalyser.minDecibels = -100
frequencyAnalyser.maxDecibels = -2
frequencyAnalyser.smoothingTimeConstant = 0.85

const canvas = document.querySelector('#visualizer')
canvas.setAttribute('width', document.querySelector('#wrapper').clientWidth)
canvas.setAttribute('height', document.querySelector('#wrapper').clientHeight)
const canvasContext = canvas.getContext('2d')

const visualize = () => {
    let hue = 0
    let saturation = 0
    const lightness = 70
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const visualizationWidth = canvasWidth / 2
    const numberOfBars = 32
    const spaceBetweenBars = 5
    const sumOfSpaceBetween = (numberOfBars - 1) * spaceBetweenBars
    const barWidth = (visualizationWidth - sumOfSpaceBetween) / numberOfBars
    const hueStep = 360 / numberOfBars
    const visualizerBottomEdge = (canvasHeight / 2) + 64
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)
    frequencyAnalyser.fftSize = 512
    const frequencyDataArray = new Uint8Array(numberOfBars)

    const smoothChange = (curr, next) => {
        if (next > curr) return  curr + (0.005 * (next - curr))
        else return curr - (0.005 * (curr - next))
    }

    const drawFrame = () => {
        requestAnimationFrame(drawFrame)
        frequencyAnalyser.getByteFrequencyData(frequencyDataArray)
        const totalEnergy = frequencyDataArray.reduce((acc, val) => acc + val, 0)
        const averageFreq = (frequencyDataArray.reduce((acc, val, idx) => acc + (++idx * val), 0) / totalEnergy) - 1 || 0
        hue = smoothChange(hue, averageFreq * hueStep)
        saturation = smoothChange(saturation, 50 + (frequencyDataArray[Math.floor(averageFreq)] / 255) * 50)
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)
        canvasContext.fillStyle = `hsl(${hue},${saturation}%,${lightness}%)`
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)
        let barLeftEdgePosition = canvasWidth / 4     
        for (let i = 0; i <= numberOfBars; i++) {
            const barHeight = frequencyDataArray[i] / 2
            canvasContext.fillStyle = 'rgb(255,255,255)'
            canvasContext.fillRect(barLeftEdgePosition, visualizerBottomEdge - barHeight, barWidth, barHeight);
            barLeftEdgePosition += barWidth + spaceBetweenBars
        }
    }
    drawFrame()
}

if (navigator.mediaDevices.getUserMedia) {
    console.log('navigator.mediaDevices.getUserMedia supported')
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(frequencyAnalyser)
        visualize()
    })
    .catch(err => console.error(`getUserMedia error: ${err}`))
} else {
    console.error('navigator.mediaDevices.getUserMedia not supported')
}
