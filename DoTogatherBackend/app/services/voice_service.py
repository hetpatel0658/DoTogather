import speech_recognition as sr
import base64
import io
import wave
import tempfile
import os
from pydub import AudioSegment
import logging

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        
    async def speech_to_text(self, audio_data: str) -> str:
        """Convert base64 encoded audio to text"""
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name
            
            try:
                # Load audio file
                with sr.AudioFile(temp_file_path) as source:
                    # Adjust for ambient noise
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    # Record the audio
                    audio = self.recognizer.record(source)
                
                # Recognize speech using Google Speech Recognition
                try:
                    text = self.recognizer.recognize_google(audio)
                    logger.info(f"Speech recognition successful: {text}")
                    return text
                except sr.UnknownValueError:
                    logger.warning("Speech recognition could not understand audio")
                    return ""
                except sr.RequestError as e:
                    logger.error(f"Could not request results from speech recognition service: {e}")
                    return ""
                    
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Error in speech to text conversion: {str(e)}")
            return ""
    
    async def text_to_speech(self, text: str) -> str:
        """Convert text to speech and return base64 encoded audio"""
        try:
            # This is a placeholder implementation
            # In a real app, you would use a TTS service like:
            # - Google Cloud Text-to-Speech
            # - Amazon Polly
            # - Azure Cognitive Services Speech
            # - OpenAI's TTS API
            
            # For now, return empty string as we're focusing on STT
            logger.info(f"TTS requested for text: {text}")
            return ""
            
        except Exception as e:
            logger.error(f"Error in text to speech conversion: {str(e)}")
            return ""
    
    def detect_wake_word(self, audio_data: str, wake_word: str = "chota ustad") -> bool:
        """Detect wake word in audio data"""
        try:
            # Convert audio to text
            text = self.speech_to_text(audio_data)
            
            if not text:
                return False
            
            # Check if wake word is present (case insensitive)
            wake_word_lower = wake_word.lower()
            text_lower = text.lower()
            
            # Simple wake word detection
            if wake_word_lower in text_lower:
                logger.info(f"Wake word '{wake_word}' detected in: {text}")
                return True
            
            # Also check for variations
            wake_words = [
                wake_word_lower,
                wake_word_lower.replace(" ", ""),
                "chota",
                "ustad",
                "hey chota",
                "hello chota"
            ]
            
            for word in wake_words:
                if word in text_lower:
                    logger.info(f"Wake word variation '{word}' detected in: {text}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error in wake word detection: {str(e)}")
            return False
    
    def preprocess_audio(self, audio_data: str) -> str:
        """Preprocess audio for better recognition"""
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Load audio with pydub
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
            
            # Normalize audio
            audio = audio.normalize()
            
            # Convert to mono if stereo
            if audio.channels > 1:
                audio = audio.set_channels(1)
            
            # Set sample rate to 16kHz (good for speech recognition)
            audio = audio.set_frame_rate(16000)
            
            # Export back to bytes
            output_buffer = io.BytesIO()
            audio.export(output_buffer, format="wav")
            output_buffer.seek(0)
            
            # Encode back to base64
            processed_audio = base64.b64encode(output_buffer.read()).decode('utf-8')
            
            return processed_audio
            
        except Exception as e:
            logger.error(f"Error preprocessing audio: {str(e)}")
            return audio_data  # Return original if preprocessing fails