package com.example.engine

import android.util.Log
import com.example.BuildConfig
import com.example.data.model.AssessmentResult
import com.example.data.model.CriticalViolation
import com.example.data.model.ReDrillStep
import com.example.data.model.RegulatoryCompliance
import com.example.data.model.SimulationDrillSession
import com.example.data.model.ThreeMinuteReDrill
import com.example.data.model.WorkerFeedback
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.TimeUnit

class GeminiRemediationService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    // Primary models in order of preference supported by Google Generative Language API
    private val candidateModels = listOf(
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite-preview"
    )

    suspend fun evaluateDrill(session: SimulationDrillSession): AssessmentResult = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isNullOrBlank() || apiKey == "MY_GEMINI_API_KEY") {
            Log.d("GeminiRemediation", "No valid GEMINI_API_KEY provided; using deterministic DGMS Safety Rule Engine.")
            return@withContext DgmsSafetyRuleEngine.evaluate(session)
        }

        val systemInstruction = """
            You are the Safety Remediation & Assessment Engine for "SurakshaAR" (SIH Project).
            Target Environment: Industrial and mining workers in India, running on Android 11 (API Level 30) budget/mid-range devices.

            OPERATING RULES:
            1. Strict Safety Overrides: Any critical safety violation (e.g., entering confined space without gas testing, moving towards a blocked exit during fire) results in an immediate and non-negotiable "FAIL" and "NOT_MASTERED" status, regardless of reaction time or points scored.
            2. Mode Awareness: Acknowledge whether the drill was executed in "AR_MODE" or "2D_FALLBACK_MODE".
            3. Localization & Simplicity: Feedback for workers must be direct, simple, conversational Hindi (plain Devanagari) suitable for audio readout, avoiding dense jargon.
            4. Output Format: Strictly output valid JSON matching the exact schema requested. Do not include markdown wraps or backticks outside the JSON.
        """.trimIndent()

        val prompt = """
            Analyze raw simulation event telemetry from the mobile app:
            Execution Mode: ${session.executionMode}
            Drill Category: ${session.category}
            Drill Telemetry:
            ${session.toJsonString(0)}

            Strictly output valid JSON matching this exact schema (no markdown backticks):
            {
              "verdict": "FAIL" or "PASS",
              "masteryStatus": "NOT_MASTERED" or "MASTERED",
              "executionMode": "${session.executionMode}",
              "riskClassification": "CRITICAL" or "MEDIUM" or "LOW",
              "score": 35,
              "criticalViolationDetected": true,
              "criticalViolations": [
                {
                  "ruleCode": "DGMS-CMR-2017-R139 / OSHA-1910.36",
                  "description": "Specific physical violation description",
                  "hazardType": "FIRE_BLOCKED_EXIT_TRAP"
                }
              ],
              "workerFeedback": {
                "hindi": "Direct, simple, conversational Hindi in plain Devanagari suitable for clear spoken audio readout...",
                "english": "Direct conversational English feedback...",
                "olChikiSantali": "Genuine Ol Chiki script text for Santali miners...",
                "santaliLatin": "Santali Latin transliteration..."
              },
              "threeMinuteReDrill": {
                "drillTitle": "3-Minute Targeted Physical Re-drill",
                "objective": "Immediate muscle memory correction",
                "steps": [
                  {"minute": "00:00 - 01:00", "action": "Physical action description", "physicalFocus": "Muscle memory target"},
                  {"minute": "01:00 - 02:00", "action": "Step 2", "physicalFocus": "Target 2"},
                  {"minute": "02:00 - 03:00", "action": "Step 3", "physicalFocus": "Target 3"}
                ],
                "supervisorSignOffChecklist": [
                  "Checklist item 1",
                  "Checklist item 2"
                ]
              },
              "regulatoryCompliance": {
                "dgmsCompliant": false,
                "oshaCompliant": false,
                "applicableStandards": ["DGMS Coal Mines Regulations (CMR) 2017", "OSHA 29 CFR 1910"]
              }
            }
        """.trimIndent()

        val requestJson = JSONObject().apply {
            val contentsArr = JSONArray().apply {
                put(JSONObject().apply {
                    put("parts", JSONArray().apply {
                        put(JSONObject().put("text", prompt))
                    })
                })
            }
            put("contents", contentsArr)

            put("systemInstruction", JSONObject().apply {
                put("parts", JSONArray().apply {
                    put(JSONObject().put("text", systemInstruction))
                })
            })

            put("generationConfig", JSONObject().apply {
                put("responseMimeType", "application/json")
                put("temperature", 0.1)
            })
        }

        val requestBody = requestJson.toString().toRequestBody("application/json".toMediaType())

        for (modelName in candidateModels) {
            val cleanModel = modelName.removePrefix("models/")
            val url = "https://generativelanguage.googleapis.com/v1beta/models/$cleanModel:generateContent?key=$apiKey"
            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            var attempts = 0
            val maxAttempts = 2

            while (attempts < maxAttempts) {
                attempts++
                try {
                    val response = client.newCall(request).execute()
                    val respCode = response.code
                    val respString = response.body?.string()

                    if (response.isSuccessful && !respString.isNullOrBlank()) {
                        val parsedResult = parseGeminiResponse(respString, session.executionMode)
                        if (parsedResult != null) {
                            return@withContext parsedResult
                        }
                    }

                    if (respCode == 503 || respCode == 429 || respCode == 500) {
                        Log.w("GeminiRemediation", "Model $cleanModel returned HTTP $respCode (attempt $attempts/$maxAttempts). Waiting before retry/fallback.")
                        if (attempts < maxAttempts) {
                            delay(1000)
                            continue
                        }
                    } else {
                        Log.w("GeminiRemediation", "Model $cleanModel returned HTTP $respCode; trying next candidate.")
                        break
                    }
                } catch (e: Exception) {
                    Log.w("GeminiRemediation", "Transient network error for $cleanModel: ${e.message}")
                    if (attempts < maxAttempts) {
                        delay(1000)
                        continue
                    }
                }
            }
        }

        Log.i("GeminiRemediation", "Engaging offline DGMS Deterministic Rule Engine fallback.")
        val fallback = DgmsSafetyRuleEngine.evaluate(session)
        fallback.copy(engineMode = "DGMS_OFFLINE_RULES")
    }

    private fun parseGeminiResponse(rawResponseBody: String, sessionMode: String): AssessmentResult? {
        return try {
            val respJson = JSONObject(rawResponseBody)
            val candidates = respJson.optJSONArray("candidates")
            val firstCandidate = candidates?.optJSONObject(0)
            val content = firstCandidate?.optJSONObject("content")
            val parts = content?.optJSONArray("parts")
            val rawText = parts?.optJSONObject(0)?.optString("text") ?: return null

            val cleanJson = if (rawText.contains("{")) {
                rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1)
            } else {
                rawText
            }

            val parsedObj = JSONObject(cleanJson)

            var verdict = parsedObj.optString("verdict", "FAIL")
            var masteryStatus = parsedObj.optString("masteryStatus", "NOT_MASTERED")
            var risk = parsedObj.optString("riskClassification", "CRITICAL")
            var score = parsedObj.optInt("score", 30)
            val criticalViolationsDetected = parsedObj.optBoolean("criticalViolationDetected", false)
            val vioArr = parsedObj.optJSONArray("criticalViolations")
            val hasViolations = criticalViolationsDetected || (vioArr != null && vioArr.length() > 0)

            // OPERATING RULE 1:
            // Any critical safety violation results in an immediate and non-negotiable "FAIL" and "NOT_MASTERED" status
            if (hasViolations) {
                verdict = "FAIL"
                masteryStatus = "NOT_MASTERED"
                risk = "CRITICAL"
                if (score > 50) {
                    score = 40
                }
            }

            val violationsList = mutableListOf<CriticalViolation>()
            if (vioArr != null) {
                for (i in 0 until vioArr.length()) {
                    violationsList.add(CriticalViolation.fromJson(vioArr.getJSONObject(i)))
                }
            }

            val feedbackObj = parsedObj.optJSONObject("workerFeedback") ?: JSONObject()
            val feedback = WorkerFeedback.fromJson(feedbackObj)

            val reDrillObj = parsedObj.optJSONObject("threeMinuteReDrill") ?: JSONObject()
            val reDrill = ThreeMinuteReDrill.fromJson(reDrillObj)

            val complianceObj = parsedObj.optJSONObject("regulatoryCompliance") ?: JSONObject()
            val compliance = RegulatoryCompliance.fromJson(complianceObj)

            val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }

            AssessmentResult(
                verdict = verdict,
                masteryStatus = masteryStatus,
                executionMode = parsedObj.optString("executionMode", sessionMode),
                riskClassification = risk,
                score = score,
                criticalViolationDetected = hasViolations,
                criticalViolations = violationsList,
                workerFeedback = feedback,
                threeMinuteReDrill = reDrill,
                regulatoryCompliance = compliance,
                evaluatedAt = isoFormat.format(Date()),
                engineMode = "GEMINI_AI_REMEDIATION"
            )
        } catch (e: Exception) {
            Log.w("GeminiRemediation", "Error parsing response JSON: ${e.message}")
            null
        }
    }
}
