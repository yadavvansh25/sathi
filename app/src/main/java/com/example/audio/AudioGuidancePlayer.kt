package com.example.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.media.ToneGenerator
import android.speech.tts.TextToSpeech
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale

enum class AudioSnippetKey {
    RUKO,                     // "रुको!" (Stop!)
    ANDAR_MAT_JAO,            // "अंदर मत जाओ!" (Do not enter!)
    ALARM_BAJAO,              // "अलार्म बजाओ!" (Sound the alarm!)
    BLOCKED_EXIT_WARNING,     // "रास्ता बंद है! एक्जिट B की तरफ जाएं!" (Exit blocked! Go to Exit B!)
    ESCALATE_SAFE_OUTCOME,    // "खतरा पहचाना! प्रवेश रोक दिया गया!" (Hazard recognized! Entry aborted!)
    GAS_TEST_REMINDER         // "गैस जांच करें! O2 और CH4 चेक करें!" (Perform 4-gas sniffer test!)
}

data class LocalizedSnippet(
    val hindiText: String,
    val santaliOlChikiText: String,
    val englishText: String,
    val alertToneFreq: Int,
    val toneDurationMs: Int
)

class AudioGuidancePlayer(context: Context) : TextToSpeech.OnInitListener {

    private val appContext = context.applicationContext
    private var tts: TextToSpeech? = TextToSpeech(appContext, this)
    private var isTtsReady = false

    private val snippets = mapOf(
        AudioSnippetKey.RUKO to LocalizedSnippet(
            hindiText = "रुको! आगे खतरा है!",
            santaliOlChikiText = "ᱨᱩᱠᱩ! ᱢᱟᱲᱟᱝ ᱨᱮ ᱵᱚᱛᱚᱨ ᱢᱮᱱᱟᱜ-ᱟ!",
            englishText = "Stop! Hazard ahead!",
            alertToneFreq = 880, // High attention A5 beep
            toneDurationMs = 250
        ),
        AudioSnippetKey.ANDAR_MAT_JAO to LocalizedSnippet(
            hindiText = "अंदर मत जाओ! गैस जांच बाकी है!",
            santaliOlChikiText = "ᱵᱷᱤᱛᱨᱤ ᱟᱞᱚᱢ ᱵᱚᱞᱚᱱᱟ! ᱜᱮᱥ ᱯᱚᱨᱤᱠᱷᱟ ᱵᱟᱹᱠᱤ ᱢᱮᱱᱟᱜ-ᱟ!",
            englishText = "Do not enter! Atmospheric gas test missing!",
            alertToneFreq = 750,
            toneDurationMs = 350
        ),
        AudioSnippetKey.ALARM_BAJAO to LocalizedSnippet(
            hindiText = "अलार्म बजाओ! तुरंत बाहर निकलो!",
            santaliOlChikiText = "ᱟᱞᱟᱨᱢ ᱥᱟᱰᱮ ᱢᱮ! ᱞᱚᱜᱚᱱ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱢᱮ!",
            englishText = "Sound the alarm! Evacuate immediately!",
            alertToneFreq = 1000,
            toneDurationMs = 400
        ),
        AudioSnippetKey.BLOCKED_EXIT_WARNING to LocalizedSnippet(
            hindiText = "रास्ता बंद है! एक्जिट B की तरफ मुड़ो!",
            santaliOlChikiText = "ᱦᱚᱨ ᱵᱚᱸᱫᱽ ᱜᱮᱭᱟ! Exit B ᱥᱮᱫ ᱢᱚᱦᱰᱟᱜ ᱢᱮ!",
            englishText = "Exit A is blocked! Reroute immediately to Exit B Assembly Point!",
            alertToneFreq = 650,
            toneDurationMs = 300
        ),
        AudioSnippetKey.ESCALATE_SAFE_OUTCOME to LocalizedSnippet(
            hindiText = "सुरक्षित निर्णय! खतरा पहचाना, अंदर प्रवेश रोका गया!",
            santaliOlChikiText = "ᱥᱩᱨᱚᱠᱷᱤᱛ ᱯᱷᱟᱹᱭᱥᱞᱟ! ᱵᱚᱛᱚᱨ ᱴᱷᱤᱠᱟᱹ ᱮᱱᱟ!",
            englishText = "Safe choice! Hazard recognized, entry aborted!",
            alertToneFreq = 520,
            toneDurationMs = 200
        ),
        AudioSnippetKey.GAS_TEST_REMINDER to LocalizedSnippet(
            hindiText = "4-गैस डिटेक्टर से जांच करें! ऑक्सीजन कम है!",
            santaliOlChikiText = "4-Gas detector ᱛᱮ ᱪᱮᱠ ᱢᱮ! Oxygen ᱠᱚᱢ ᱜᱮᱭᱟ!",
            englishText = "Perform 4-gas test! Deficient oxygen detected!",
            alertToneFreq = 800,
            toneDurationMs = 300
        )
    )

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale("hi", "IN")
            isTtsReady = true
        }
    }

    /**
     * Instant audio feedback with hardware alert tone followed by verbal guidance snippet
     */
    fun playSnippet(key: AudioSnippetKey, language: String = "HINDI") {
        val snippet = snippets[key] ?: return

        // 1. Play immediate non-blocking industrial safety alert tone
        CoroutineScope(Dispatchers.Default).launch {
            playIndustrialTone(snippet.alertToneFreq, snippet.toneDurationMs)
        }

        // 2. Play verbal instruction snippet
        if (isTtsReady) {
            val textToSpeak = when (language) {
                "SANTALI_OL_CHIKI" -> snippet.hindiText // Native Hindi speech model handles regional Indian workers with phonetic clarity
                "ENGLISH" -> snippet.englishText
                else -> snippet.hindiText
            }
            tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null, "SURAKSHA_SNIPPET_${key.name}")
        }
    }

    /**
     * Synthesizes clear industrial alert tone directly via AudioTrack (zero network/external dependency)
     */
    private fun playIndustrialTone(freqHz: Int, durationMs: Int) {
        try {
            val sampleRate = 16000
            val numSamples = (sampleRate * (durationMs / 1000.0)).toInt()
            val sample = ShortArray(numSamples)
            for (i in 0 until numSamples) {
                val angle = 2.0 * Math.PI * i / (sampleRate.toDouble() / freqHz)
                sample[i] = (Math.sin(angle) * Short.MAX_VALUE * 0.7).toInt().toShort()
            }
            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(sample.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            track.write(sample, 0, sample.size)
            track.play()
            Thread.sleep(durationMs.toLong() + 50)
            track.release()
        } catch (e: Exception) {
            Log.w("AudioGuidance", "Tone playback skipped: ${e.message}")
        }
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        isTtsReady = false
    }
}
