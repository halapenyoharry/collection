class ThroatSingingEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentStyle = 0; // 0=Khoomei, 1=Sygyt, 2=Kargyraa
        
        // Audio nodes
        this.fundamentalOsc = null;
        this.subharmonicOsc = null;
        this.formantFilters = [];
        this.gainNode = null;
        this.analyser = null;
        
        // Parameters
        this.fundamental = 110;
        this.overtoneEmphasis = 0.5;
        this.throatTension = 0;
        this.volume = 0.7;
        
        // Formant configurations for each style
        this.formantConfigs = {
            0: [ // Khoomei
                { freq: 700, q: 5, gain: 0.8 },
                { freq: 1150, q: 7, gain: 0.6 },
                { freq: 2600, q: 8, gain: 0.4 },
                { freq: 3300, q: 10, gain: 0.3 },
                { freq: 4000, q: 12, gain: 0.2 }
            ],
            1: [ // Sygyt
                { freq: 300, q: 3, gain: 0.3 },
                { freq: 2800, q: 15, gain: 1.0 },
                { freq: 3500, q: 20, gain: 0.8 },
                { freq: 4200, q: 20, gain: 0.6 },
                { freq: 5000, q: 15, gain: 0.4 }
            ],
            2: [ // Kargyraa
                { freq: 400, q: 2, gain: 1.0 },
                { freq: 750, q: 3, gain: 0.8 },
                { freq: 1000, q: 4, gain: 0.6 },
                { freq: 1500, q: 5, gain: 0.4 },
                { freq: 2000, q: 6, gain: 0.3 }
            ]
        };
    }
    
    async init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create analyser for visualization
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        
        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }
    
    start() {
        if (this.isPlaying) return;
        
        // Create fundamental oscillator
        this.fundamentalOsc = this.audioContext.createOscillator();
        this.fundamentalOsc.type = 'sawtooth'; // Rich in harmonics
        this.fundamentalOsc.frequency.value = this.fundamental;
        
        // Create formant filter chain
        this.createFormantFilters();
        
        // Connect fundamental through formant filters
        let currentNode = this.fundamentalOsc;
        this.formantFilters.forEach(filter => {
            currentNode.connect(filter.input);
            currentNode = filter.output;
        });
        
        // Create harmonic emphasis
        this.harmonicNodes = [];
        for (let h = 2; h <= 8; h++) {
            const harmonic = this.audioContext.createOscillator();
            harmonic.type = 'sine';
            harmonic.frequency.value = this.fundamental * h;
            
            const harmonicGain = this.audioContext.createGain();
            harmonicGain.gain.value = this.calculateHarmonicGain(h);
            
            harmonic.connect(harmonicGain);
            harmonicGain.connect(this.gainNode);
            harmonic.start();
            
            this.harmonicNodes.push({ osc: harmonic, gain: harmonicGain });
        }
        
        // Add subharmonic for Kargyraa
        if (this.currentStyle === 2) {
            this.subharmonicOsc = this.audioContext.createOscillator();
            this.subharmonicOsc.type = 'sine';
            this.subharmonicOsc.frequency.value = this.fundamental / 2;
            
            const subGain = this.audioContext.createGain();
            subGain.gain.value = 0.7;
            
            this.subharmonicOsc.connect(subGain);
            subGain.connect(this.gainNode);
            this.subharmonicOsc.start();
        }
        
        // Final connection and start
        currentNode.connect(this.gainNode);
        this.fundamentalOsc.start();
        
        this.isPlaying = true;
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        // Stop and disconnect oscillators
        this.fundamentalOsc.stop();
        this.fundamentalOsc.disconnect();
        
        if (this.subharmonicOsc) {
            this.subharmonicOsc.stop();
            this.subharmonicOsc.disconnect();
        }
        
        // Stop harmonic oscillators
        this.harmonicNodes.forEach(node => {
            node.osc.stop();
            node.osc.disconnect();
            node.gain.disconnect();
        });
        
        // Disconnect filters
        this.formantFilters.forEach(filter => {
            filter.input.disconnect();
            filter.output.disconnect();
        });
        
        this.formantFilters = [];
        this.harmonicNodes = [];
        this.isPlaying = false;
    }
    
    createFormantFilters() {
        const config = this.formantConfigs[this.currentStyle];
        
        config.forEach(formant => {
            // Create bandpass filter
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = formant.freq * (1 + this.throatTension * 0.2);
            filter.Q.value = formant.q * (1 + this.throatTension * 0.5);
            
            // Create gain for this formant
            const gain = this.audioContext.createGain();
            gain.gain.value = formant.gain;
            
            filter.connect(gain);
            
            this.formantFilters.push({
                input: filter,
                output: gain,
                filter: filter,
                gain: gain
            });
        });
    }
    
    calculateHarmonicGain(harmonicNumber) {
        // Calculate gain based on overtone emphasis and style
        const emphasisHarmonic = Math.floor(this.overtoneEmphasis * 6) + 2;
        
        if (harmonicNumber === emphasisHarmonic) {
            return 0.3 * this.overtoneEmphasis;
        }
        
        // Natural harmonic rolloff
        return 0.1 / harmonicNumber;
    }
    
    setFundamental(freq) {
        this.fundamental = freq;
        if (this.fundamentalOsc) {
            this.fundamentalOsc.frequency.setTargetAtTime(freq, this.audioContext.currentTime, 0.01);
            
            // Update harmonics
            this.harmonicNodes.forEach((node, i) => {
                node.osc.frequency.setTargetAtTime(freq * (i + 2), this.audioContext.currentTime, 0.01);
            });
            
            // Update subharmonic
            if (this.subharmonicOsc) {
                this.subharmonicOsc.frequency.setTargetAtTime(freq / 2, this.audioContext.currentTime, 0.01);
            }
        }
    }
    
    setOvertoneEmphasis(value) {
        this.overtoneEmphasis = value;
        if (this.isPlaying) {
            // Update harmonic gains
            this.harmonicNodes.forEach((node, i) => {
                const gain = this.calculateHarmonicGain(i + 2);
                node.gain.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.01);
            });
        }
    }
    
    setThroatTension(value) {
        this.throatTension = value;
        if (this.isPlaying) {
            // Restart with new formant configuration
            this.stop();
            this.start();
        }
    }
    
    setVolume(value) {
        this.volume = value;
        if (this.gainNode) {
            this.gainNode.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.01);
        }
    }
    
    setStyle(style) {
        this.currentStyle = style;
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }
}

// Create global instance
window.throatSingingEngine = new ThroatSingingEngine();