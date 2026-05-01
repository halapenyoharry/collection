class Visualizer {
    constructor(canvas, analyser) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.analyser = analyser;
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Animation state
        this.animationId = null;
        this.isRunning = false;
        
        // Visual settings
        this.backgroundColor = '#0a0a0a';
        this.waveformColor = '#4a9eff';
        this.spectrumColor = '#2ecc71';
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.draw();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    draw() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Get frequency data
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Draw spectrum
        this.drawSpectrum(dataArray);
        
        // Draw overtone markers
        this.drawOvertoneMarkers();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.draw());
    }
    
    drawSpectrum(dataArray) {
        const barWidth = this.width / dataArray.length * 2.5;
        let x = 0;
        
        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, this.height, 0, 0);
        gradient.addColorStop(0, this.spectrumColor);
        gradient.addColorStop(1, this.waveformColor);
        
        this.ctx.fillStyle = gradient;
        
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * this.height * 0.8;
            
            this.ctx.fillRect(x, this.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
            
            if (x > this.width) break;
        }
    }
    
    drawOvertoneMarkers() {
        if (!window.throatSingingEngine || !window.throatSingingEngine.fundamental) return;
        
        const fundamental = window.throatSingingEngine.fundamental;
        const nyquist = window.throatSingingEngine.audioContext.sampleRate / 2;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Draw lines for fundamental and first few overtones
        for (let h = 1; h <= 8; h++) {
            const freq = fundamental * h;
            if (freq > nyquist) break;
            
            const x = (freq / nyquist) * this.width;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
            
            // Label
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(`${h}x`, x + 2, 12);
        }
        
        this.ctx.setLineDash([]);
    }
}

// Initialize visualizer when engine is ready
let visualizer = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('visualizer');
    
    // Wait for audio engine to be initialized
    const checkEngine = setInterval(() => {
        if (window.throatSingingEngine && window.throatSingingEngine.analyser) {
            clearInterval(checkEngine);
            visualizer = new Visualizer(canvas, window.throatSingingEngine.analyser);
            window.visualizer = visualizer;
        }
    }, 100);
});