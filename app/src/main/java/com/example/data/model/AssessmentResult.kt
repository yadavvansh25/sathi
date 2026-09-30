package com.example.data.model

import org.json.JSONArray
import org.json.JSONObject

data class CriticalViolation(
    val ruleCode: String,
    val description: String,
    val hazardType: String
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("ruleCode", ruleCode)
            put("description", description)
            put("hazardType", hazardType)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): CriticalViolation {
            return CriticalViolation(
                ruleCode = json.optString("ruleCode", "SAFETY-VIOLATION"),
                description = json.optString("description", "Critical violation detected"),
                hazardType = json.optString("hazardType", "GENERAL_HAZARD")
            )
        }
    }
}

data class WorkerFeedback(
    val hindi: String,
    val english: String,
    val olChikiSantali: String,
    val santaliLatin: String
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("hindi", hindi)
            put("english", english)
            put("olChikiSantali", olChikiSantali)
            put("santaliLatin", santaliLatin)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): WorkerFeedback {
            return WorkerFeedback(
                hindi = json.optString("hindi", ""),
                english = json.optString("english", ""),
                olChikiSantali = json.optString("olChikiSantali", ""),
                santaliLatin = json.optString("santaliLatin", "")
            )
        }
    }
}

data class ReDrillStep(
    val minute: String,
    val action: String,
    val physicalFocus: String
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("minute", minute)
            put("action", action)
            put("physicalFocus", physicalFocus)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): ReDrillStep {
            return ReDrillStep(
                minute = json.optString("minute", "00:00 - 01:00"),
                action = json.optString("action", ""),
                physicalFocus = json.optString("physicalFocus", "")
            )
        }
    }
}

data class ThreeMinuteReDrill(
    val drillTitle: String,
    val objective: String,
    val steps: List<ReDrillStep>,
    val supervisorSignOffChecklist: List<String>
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("drillTitle", drillTitle)
            put("objective", objective)
            val stepsArr = JSONArray()
            steps.forEach { stepsArr.put(it.toJson()) }
            put("steps", stepsArr)
            val signOffArr = JSONArray()
            supervisorSignOffChecklist.forEach { signOffArr.put(it) }
            put("supervisorSignOffChecklist", signOffArr)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): ThreeMinuteReDrill {
            val stepsList = mutableListOf<ReDrillStep>()
            val stepsArr = json.optJSONArray("steps")
            if (stepsArr != null) {
                for (i in 0 until stepsArr.length()) {
                    stepsList.add(ReDrillStep.fromJson(stepsArr.getJSONObject(i)))
                }
            }
            val checkList = mutableListOf<String>()
            val checkArr = json.optJSONArray("supervisorSignOffChecklist")
            if (checkArr != null) {
                for (i in 0 until checkArr.length()) {
                    checkList.add(checkArr.getString(i))
                }
            }
            return ThreeMinuteReDrill(
                drillTitle = json.optString("drillTitle", "Targeted Physical Re-Drill"),
                objective = json.optString("objective", "Immediate muscle memory remediation"),
                steps = stepsList,
                supervisorSignOffChecklist = checkList
            )
        }
    }
}

data class RegulatoryCompliance(
    val dgmsCompliant: Boolean,
    val oshaCompliant: Boolean,
    val applicableStandards: List<String>
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("dgmsCompliant", dgmsCompliant)
            put("oshaCompliant", oshaCompliant)
            val arr = JSONArray()
            applicableStandards.forEach { arr.put(it) }
            put("applicableStandards", arr)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): RegulatoryCompliance {
            val list = mutableListOf<String>()
            val arr = json.optJSONArray("applicableStandards")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    list.add(arr.getString(i))
                }
            }
            return RegulatoryCompliance(
                dgmsCompliant = json.optBoolean("dgmsCompliant", false),
                oshaCompliant = json.optBoolean("oshaCompliant", false),
                applicableStandards = list
            )
        }
    }
}

data class AssessmentResult(
    val verdict: String, // "PASS" or "FAIL"
    val masteryStatus: String, // "MASTERED" or "NOT_MASTERED"
    val executionMode: String, // "AR_MODE" or "2D_FALLBACK_MODE"
    val riskClassification: String, // "LOW", "MEDIUM", "CRITICAL"
    val score: Int, // 0 - 100
    val criticalViolationDetected: Boolean,
    val criticalViolations: List<CriticalViolation>,
    val workerFeedback: WorkerFeedback,
    val threeMinuteReDrill: ThreeMinuteReDrill,
    val regulatoryCompliance: RegulatoryCompliance,
    val evaluatedAt: String,
    val engineMode: String = "DGMS_DETERMINISTIC_RULES"
) {
    fun toJsonString(indent: Int = 2): String {
        val root = JSONObject().apply {
            put("verdict", verdict)
            put("masteryStatus", masteryStatus)
            put("executionMode", executionMode)
            put("riskClassification", riskClassification)
            put("score", score)
            put("criticalViolationDetected", criticalViolationDetected)
            
            val vioArr = JSONArray()
            criticalViolations.forEach { vioArr.put(it.toJson()) }
            put("criticalViolations", vioArr)

            put("workerFeedback", workerFeedback.toJson())
            put("threeMinuteReDrill", threeMinuteReDrill.toJson())
            put("regulatoryCompliance", regulatoryCompliance.toJson())
            put("evaluatedAt", evaluatedAt)
            put("engineMode", engineMode)
        }
        return if (indent > 0) root.toString(indent) else root.toString()
    }

    companion object {
        fun fromJsonString(jsonString: String): AssessmentResult {
            val json = JSONObject(jsonString)
            val violationsList = mutableListOf<CriticalViolation>()
            val vioArr = json.optJSONArray("criticalViolations")
            if (vioArr != null) {
                for (i in 0 until vioArr.length()) {
                    violationsList.add(CriticalViolation.fromJson(vioArr.getJSONObject(i)))
                }
            }

            val verdictVal = json.optString("verdict", "FAIL")
            val defaultMastery = if (verdictVal.equals("PASS", true)) "MASTERED" else "NOT_MASTERED"

            return AssessmentResult(
                verdict = verdictVal,
                masteryStatus = json.optString("masteryStatus", defaultMastery),
                executionMode = json.optString("executionMode", "AR_MODE"),
                riskClassification = json.optString("riskClassification", "CRITICAL"),
                score = json.optInt("score", 0),
                criticalViolationDetected = json.optBoolean("criticalViolationDetected", true),
                criticalViolations = violationsList,
                workerFeedback = WorkerFeedback.fromJson(json.optJSONObject("workerFeedback") ?: JSONObject()),
                threeMinuteReDrill = ThreeMinuteReDrill.fromJson(json.optJSONObject("threeMinuteReDrill") ?: JSONObject()),
                regulatoryCompliance = RegulatoryCompliance.fromJson(json.optJSONObject("regulatoryCompliance") ?: JSONObject()),
                evaluatedAt = json.optString("evaluatedAt", ""),
                engineMode = json.optString("engineMode", "DGMS_DETERMINISTIC_RULES")
            )
        }
    }
}
