document.addEventListener('DOMContentLoaded', () => {
    const engine = window.throatSingingEngine;
    
    // Start button
    const startButton = document.getElementById('start-button');
    let isStarted = false;
    
    startButton.addEventListener('click', async () => {
        if (!isStarted) {
            await engine.init();
            engine.start();
            startButton.textContent = 'Stop Audio';
            startButton.classList.add('active');
            
            // Start visualizer
            if (window.visualizer) {
                window.visualizer.start();
            }
            
            isStarted = true;
        } else {
            engine.stop();
            startButton.textContent = 'Start Audio';
            startButton.classList.remove('active');
            
            // Stop visualizer
            if (window.visualizer) {
                window.visualizer.stop();
            }
            
            isStarted = false;
        }
    });
    
    // Style buttons
    const styleButtons = document.querySelectorAll('.style-button');
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            styleButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            // Set engine style
            const style = parseInt(button.dataset.style);
            engine.setStyle(style);
        });
    });
    
    // Fundamental frequency
    const fundamentalSlider = document.getElementById('fundamental');
    const fundamentalValue = document.getElementById('fundamental-value');
    
    fundamentalSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        fundamentalValue.textContent = `${value} Hz`;
        engine.setFundamental(value);
    });
    
    // Overtone emphasis
    const overtoneSlider = document.getElementById('overtone');
    const overtoneValue = document.getElementById('overtone-value');
    
    overtoneSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 100;
        overtoneValue.textContent = `${e.target.value}%`;
        engine.setOvertoneEmphasis(value);
    });
    
    // Throat tension
    const tensionSlider = document.getElementById('tension');
    const tensionValue = document.getElementById('tension-value');
    
    tensionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 100;
        tensionValue.textContent = `${e.target.value}%`;
        engine.setThroatTension(value);
    });
    
    // Volume
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volume-value');
    
    volumeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 100;
        volumeValue.textContent = `${e.target.value}%`;
        engine.setVolume(value);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            startButton.click();
        }
        
        // Number keys for styles
        if (e.key >= '1' && e.key <= '3') {
            const styleIndex = parseInt(e.key) - 1;
            styleButtons[styleIndex]?.click();
        }
    });
});