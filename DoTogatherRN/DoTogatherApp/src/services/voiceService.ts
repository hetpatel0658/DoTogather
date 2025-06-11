import Voice, { SpeechRecognizedEvent, SpeechResultsEvent, SpeechErrorEvent } from '@react-native-community/voice';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceServiceConfig {
  wakeWord: string;
  language: string;
  continuous: boolean;
  partialResults: boolean;
}

class VoiceService {
  private isListening: boolean = false;
  private isWakeWordMode: boolean = false;
  private config: VoiceServiceConfig;
  private onWakeWordDetected?: () => void;
  private onSpeechResult?: (result: string) => void;
  private onError?: (error: string) => void;

  constructor() {
    this.config = {
      wakeWord: 'chota ustad',
      language: 'en-US',
      continuous: true,
      partialResults: true,
    };

    this.initializeVoice();
  }

  private initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'DoTogather needs access to your microphone for voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  }

  async startWakeWordDetection(
    onWakeWordDetected: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone permission is required for voice commands.');
      return;
    }

    this.onWakeWordDetected = onWakeWordDetected;
    this.onError = onError;
    this.isWakeWordMode = true;

    try {
      await this.startListening();
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      this.onError?.('Failed to start wake word detection');
    }
  }

  async startVoiceCommand(
    onSpeechResult: (result: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone permission is required for voice commands.');
      return;
    }

    this.onSpeechResult = onSpeechResult;
    this.onError = onError;
    this.isWakeWordMode = false;

    try {
      await this.startListening();
    } catch (error) {
      console.error('Error starting voice command:', error);
      this.onError?.('Failed to start voice command');
    }
  }

  private async startListening(): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    }

    try {
      await Voice.start(this.config.language);
      this.isListening = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
      this.isWakeWordMode = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListening = false;
      this.isWakeWordMode = false;
    } catch (error) {
      console.error('Error destroying voice recognition:', error);
    }
  }

  private onSpeechStart(e: any): void {
    console.log('Speech recognition started');
  }

  private onSpeechRecognized(e: SpeechRecognizedEvent): void {
    console.log('Speech recognized');
  }

  private onSpeechEnd(e: any): void {
    console.log('Speech recognition ended');
    this.isListening = false;

    // Restart listening if in wake word mode
    if (this.isWakeWordMode) {
      setTimeout(() => {
        this.startListening().catch(console.error);
      }, 1000);
    }
  }

  private onSpeechError(e: SpeechErrorEvent): void {
    console.error('Speech recognition error:', e.error);
    this.onError?.(e.error?.message || 'Speech recognition error');
    
    // Restart listening if in wake word mode and it's not a fatal error
    if (this.isWakeWordMode && e.error?.message !== 'No speech input') {
      setTimeout(() => {
        this.startListening().catch(console.error);
      }, 2000);
    }
  }

  private onSpeechResults(e: SpeechResultsEvent): void {
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      console.log('Speech result:', result);

      if (this.isWakeWordMode) {
        this.checkForWakeWord(result);
      } else {
        this.onSpeechResult?.(result);
      }
    }
  }

  private onSpeechPartialResults(e: SpeechResultsEvent): void {
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      
      if (this.isWakeWordMode) {
        this.checkForWakeWord(result);
      }
    }
  }

  private checkForWakeWord(text: string): void {
    const lowerText = text.toLowerCase();
    const wakeWord = this.config.wakeWord.toLowerCase();

    // Check for exact wake word or variations
    const wakeWordVariations = [
      wakeWord,
      wakeWord.replace(' ', ''),
      'chota',
      'ustad',
      'hey chota',
      'hello chota',
    ];

    const isWakeWordDetected = wakeWordVariations.some(variation => 
      lowerText.includes(variation)
    );

    if (isWakeWordDetected) {
      console.log('Wake word detected:', text);
      this.onWakeWordDetected?.();
    }
  }

  setWakeWord(wakeWord: string): void {
    this.config.wakeWord = wakeWord;
    AsyncStorage.setItem('wakeWord', wakeWord);
  }

  async getWakeWord(): Promise<string> {
    const stored = await AsyncStorage.getItem('wakeWord');
    return stored || this.config.wakeWord;
  }

  setLanguage(language: string): void {
    this.config.language = language;
    AsyncStorage.setItem('voiceLanguage', language);
  }

  async getLanguage(): Promise<string> {
    const stored = await AsyncStorage.getItem('voiceLanguage');
    return stored || this.config.language;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isInWakeWordMode(): boolean {
    return this.isWakeWordMode;
  }

  async getAvailableLanguages(): Promise<string[]> {
    try {
      const languages = await Voice.getSpeechRecognitionServices();
      return languages || ['en-US'];
    } catch (error) {
      console.error('Error getting available languages:', error);
      return ['en-US'];
    }
  }
}

export default new VoiceService();