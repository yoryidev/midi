export class BPMDetector {
    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new AudioContext();
    }

    async detectBPM(audioBuffer: AudioBuffer): Promise<number> {
        const channelData = audioBuffer.getChannelData(0); // Use first channel
        const sampleRate = audioBuffer.sampleRate;
        
        // Create array of energy values
        const bufferSize = 1024;
        const energyValues: number[] = [];
        
        for (let i = 0; i < channelData.length; i += bufferSize) {
            let energy = 0;
            for (let j = 0; j < bufferSize && (i + j) < channelData.length; j++) {
                energy += Math.abs(channelData[i + j] ** 2);
            }
            energyValues.push(energy);
        }

        // Find peaks in energy
        const peaks = this.findPeaks(energyValues);
        
        // Calculate intervals between peaks
        const intervals = this.calculateIntervals(peaks, bufferSize, sampleRate);
        
        // Calculate BPM from intervals
        const bpm = this.calculateBPMFromIntervals(intervals);
        
        return Math.round(bpm);
    }

    private findPeaks(energyValues: number[]): number[] {
        const peaks: number[] = [];
        const threshold = 0.6; // Adjust this value based on your needs
        const minPeakDistance = 10; // Minimum distance between peaks
        
        let lastPeakIndex = -minPeakDistance;
        
        // Normalize energy values
        const max = Math.max(...energyValues);
        const normalizedEnergy = energyValues.map(e => e / max);
        
        for (let i = 1; i < normalizedEnergy.length - 1; i++) {
            if (i - lastPeakIndex >= minPeakDistance) {
                if (normalizedEnergy[i] > threshold &&
                    normalizedEnergy[i] > normalizedEnergy[i - 1] &&
                    normalizedEnergy[i] > normalizedEnergy[i + 1]) {
                    peaks.push(i);
                    lastPeakIndex = i;
                }
            }
        }
        
        return peaks;
    }

    private calculateIntervals(peaks: number[], bufferSize: number, sampleRate: number): number[] {
        const intervals: number[] = [];
        
        for (let i = 1; i < peaks.length; i++) {
            const interval = (peaks[i] - peaks[i - 1]) * bufferSize / sampleRate;
            intervals.push(interval);
        }
        
        return intervals;
    }

    private calculateBPMFromIntervals(intervals: number[]): number {
        if (intervals.length === 0) return 100; // Default BPM if no intervals found
        
        // Calculate average interval
        const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        
        // Convert to BPM
        let bpm = 60 / averageInterval;
        
        // Adjust BPM to common range (60-180)
        while (bpm < 60) bpm *= 2;
        while (bpm > 180) bpm /= 2;
        
        return bpm;
    }
}