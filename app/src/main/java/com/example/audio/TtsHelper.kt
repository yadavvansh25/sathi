package com.example.audio

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

class TtsHelper(context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isInitialized = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            val hindiLocale = Locale.forLanguageTag("hi-IN")
            val result = tts?.setLanguage(hindiLocale)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setLanguage(Locale.US)
            }
            tts?.setSpeechRate(0.9f) // slightly slower, clear supervisor pace
            tts?.setPitch(1.0f)
        } else {
            Log.w("TtsHelper", "TextToSpeech initialization pending or unsupported: $status")
        }
    }

    fun speak(text: String, languageCode: String = "hi") {
        if (!isInitialized || tts == null) return

        if (languageCode == "hi") {
            val res = tts?.setLanguage(Locale.forLanguageTag("hi-IN"))
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setLanguage(Locale.US)
            }
        } else {
            tts?.setLanguage(Locale.US)
        }

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "SURAKSHA_TTS_UTTERANCE")
    }

    fun stop() {
        tts?.stop()
    }

    fun shutdown() {
        try {
            tts?.stop()
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            Log.w("TtsHelper", "TTS shutdown notice: ${e.message}")
        }
    }
}
