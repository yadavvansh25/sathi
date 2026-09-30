package com.example.data.model

import org.json.JSONArray
import org.json.JSONObject

data class SimulationEvent(
    val eventId: String,
    val timestampMs: Long,
    val eventType: String,
    val zone: String,
    val hazardType: String = "",
    val details: String = "",
    val parameters: Map<String, String> = emptyMap()
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("eventId", eventId)
            put("timestampMs", timestampMs)
            put("eventType", eventType)
            put("zone", zone)
            put("hazardType", hazardType)
            put("details", details)
            val paramsObj = JSONObject()
            parameters.forEach { (k, v) -> paramsObj.put(k, v) }
            put("parameters", paramsObj)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): SimulationEvent {
            val paramsMap = mutableMapOf<String, String>()
            val paramsJson = json.optJSONObject("parameters")
            if (paramsJson != null) {
                val keys = paramsJson.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    paramsMap[key] = paramsJson.optString(key, "")
                }
            }
            return SimulationEvent(
                eventId = json.optString("eventId", "EVT-${System.currentTimeMillis()}"),
                timestampMs = json.optLong("timestampMs", System.currentTimeMillis()),
                eventType = json.optString("eventType", "GENERIC_EVENT"),
                zone = json.optString("zone", "General Area"),
                hazardType = json.optString("hazardType", ""),
                details = json.optString("details", ""),
                parameters = paramsMap
            )
        }
    }
}

data class SimulationDrillSession(
    val drillId: String,
    val drillTitle: String,
    val workerId: String,
    val workerName: String,
    val trade: String,
    val category: String, // CONFINED_SPACE, MINE_STRATA, HEMM_HAUL_ROAD, ELECTRICAL_LOTO, FIRE_EVACUATION
    val executionMode: String = "AR_MODE", // "AR_MODE" or "2D_FALLBACK_MODE"
    val targetStandard: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val events: List<SimulationEvent>
) {
    fun toJsonString(indent: Int = 2): String {
        val root = JSONObject().apply {
            put("drillId", drillId)
            put("drillTitle", drillTitle)
            put("workerId", workerId)
            put("workerName", workerName)
            put("trade", trade)
            put("category", category)
            put("executionMode", executionMode)
            put("targetStandard", targetStandard)
            put("startTimeMs", startTimeMs)
            put("endTimeMs", endTimeMs)
            val eventsArray = JSONArray()
            events.forEach { eventsArray.put(it.toJson()) }
            put("events", eventsArray)
        }
        return if (indent > 0) root.toString(indent) else root.toString()
    }

    companion object {
        fun fromJsonString(jsonString: String): SimulationDrillSession {
            val root = JSONObject(jsonString)
            val eventsList = mutableListOf<SimulationEvent>()
            val eventsArr = root.optJSONArray("events")
            if (eventsArr != null) {
                for (i in 0 until eventsArr.length()) {
                    val evtObj = eventsArr.getJSONObject(i)
                    eventsList.add(SimulationEvent.fromJson(evtObj))
                }
            }
            return SimulationDrillSession(
                drillId = root.optString("drillId", "DRILL-${System.currentTimeMillis()}"),
                drillTitle = root.optString("drillTitle", "Custom AR Drill"),
                workerId = root.optString("workerId", "EMP-UNKNOWN"),
                workerName = root.optString("workerName", "Worker"),
                trade = root.optString("trade", "General Miner"),
                category = root.optString("category", "CONFINED_SPACE"),
                executionMode = root.optString("executionMode", "AR_MODE"),
                targetStandard = root.optString("targetStandard", "DGMS CMR 2017 & OSHA 1910.146"),
                startTimeMs = root.optLong("startTimeMs", System.currentTimeMillis() - 180000),
                endTimeMs = root.optLong("endTimeMs", System.currentTimeMillis()),
                events = eventsList
            )
        }
    }
}
