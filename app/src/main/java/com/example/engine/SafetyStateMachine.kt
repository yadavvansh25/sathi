package com.example.engine

import java.util.UUID

/**
 * Deterministic State Machine & Rules-based Competency Engine for SurakshaAR (SIH 26041)
 * Zero Fake ML: Explicit deterministic graph of states, transitions, required/forbidden actions
 */

enum class SimulationModuleType {
    FIRE_EVACUATION,
    CONFINED_SPACE_GAS_LEAK
}

enum class FireState {
    IDLE,
    CABINET_FIRE_IGNITION,
    EXIT_A_DYNAMICALLY_BLOCKED,
    ALARM_RAISED,
    EXTINGUISHER_DEPLOYED,
    EVACUATING_VIA_BLOCKED_A, // CRITICAL FAILURE
    EVACUATING_VIA_SAFE_B,
    ARRIVED_ASSEMBLY_POINT
}

enum class ConfinedSpaceState {
    IDLE,
    AT_SUMP_ENTRY,
    SIGNAGE_INSPECTED,
    PPE_VERIFIED,
    GAS_TEST_COMPLETED,
    BUDDY_PERMIT_VERIFIED,
    ENTERED_CHAMBER_UNSAFE, // CRITICAL FAILURE
    ESCALATED_DO_NOT_ENTER // TARGET SAFE OUTCOME
}

data class CompetencyEvaluationResult(
    val moduleType: SimulationModuleType,
    val verdict: String, // "PASS" or "FAIL"
    val competencyStatus: String, // "MASTERED" or "NOT_MASTERED"
    val competencyCode: String, // e.g. "ERR_GAS_TEST_MISSING", "ERR_BLOCKED_EXIT_ATTEMPT"
    val score: Int,
    val criticalErrorFlag: Boolean,
    val auditTrail: List<String>,
    val remedialDrillTitle: String,
    val remedialDrillAction: String
)

object SafetyStateMachine {

    /**
     * Module 1 Evaluator: Fire & Emergency Evacuation Lab
     * DGMS CMR 2017 Reg 139 / OSHA 1910.38 / 1910.157
     */
    fun evaluateFireEvacuation(
        alarmRaised: Boolean,
        extinguisherSelected: String, // "CO2_DRY_POWDER", "WATER_TYPE", "NONE"
        evacuationRouteTaken: String // "SAFE_EXIT_B_ASSEMBLY", "BLOCKED_EXIT_A"
    ): CompetencyEvaluationResult {
        val auditTrail = mutableListOf<String>()
        auditTrail.add("Triggered: Electrical cabinet fire detected in underground pump room.")
        auditTrail.add("Spatial dynamic: Exit A is BLOCKED by heavy smoke barrier.")

        var criticalErrorFlag = false
        var competencyCode = "COMPETENCY_MASTERED"
        var remedialTitle = "Routine Quarterly Refresher"
        var remedialAction = "Maintain tactical awareness of primary and secondary lifelines."

        if (alarmRaised) {
            auditTrail.add("Action: Manual fire call point pressed. Evacuation sirens active.")
        } else {
            auditTrail.add("Non-conformance: Fire alarm was not sounded before evacuation.")
            competencyCode = "ERR_EVACUATION_ALARM_OMITTED"
        }

        if (extinguisherSelected == "WATER_TYPE") {
            criticalErrorFlag = true
            competencyCode = "ERR_ELECTRICAL_FIRE_WATER_MISUSE"
            auditTrail.add("CRITICAL VIOLATION: Used water-based extinguisher on live energized electrical panel.")
        } else if (extinguisherSelected == "CO2_DRY_POWDER") {
            auditTrail.add("Conforming action: Appropriate Class C/E CO2 dry chemical agent deployed.")
        }

        // CONSEQUENCE RULE: Moving towards blocked route = Instant Critical Failure
        if (evacuationRouteTaken == "BLOCKED_EXIT_A") {
            criticalErrorFlag = true
            competencyCode = "ERR_BLOCKED_EXIT_ATTEMPT"
            auditTrail.add("CRITICAL FATAL ACTION: Moved towards blocked Exit A corridor engulfed in smoke.")
            remedialTitle = "Blindfold Lifeline Tactical Evacuation Drill"
            remedialAction = "Practice tactile lifeline navigation directly to Exit B Assembly Point away from smoke barriers."
        } else {
            auditTrail.add("Safe maneuver: Observed spatial blockade and redirected directly via safe Exit B to Assembly Point.")
        }

        val verdict = if (criticalErrorFlag || !alarmRaised) "FAIL" else "PASS"
        val mastery = if (criticalErrorFlag || !alarmRaised) "NOT_MASTERED" else "MASTERED"
        val score = when {
            criticalErrorFlag -> 20
            !alarmRaised -> 45
            else -> 95
        }

        return CompetencyEvaluationResult(
            moduleType = SimulationModuleType.FIRE_EVACUATION,
            verdict = verdict,
            competencyStatus = mastery,
            competencyCode = competencyCode,
            score = score,
            criticalErrorFlag = criticalErrorFlag,
            auditTrail = auditTrail,
            remedialDrillTitle = remedialTitle,
            remedialDrillAction = remedialAction
        )
    }

    /**
     * Module 2 Evaluator: Gas Leak & Confined Space Entry Lab
     * OSHA 1910.146 / DGMS Tech Circular 02/2019
     */
    fun evaluateConfinedSpace(
        signageChecked: Boolean,
        ppeVerified: Boolean,
        gasClearanceTested: Boolean,
        buddyStandbyVerified: Boolean,
        finalAction: String // "DO_NOT_ENTER_ESCALATE" (Safe) or "ENTERED_CHAMBER" (Failure)
    ): CompetencyEvaluationResult {
        val auditTrail = mutableListOf<String>()
        auditTrail.add("Approached Virtual Sump Incline Portal.")

        var criticalErrorFlag = false
        var competencyCode = "COMPETENCY_MASTERED"
        var remedialTitle = "Routine Confined Space Recertification"
        var remedialAction = "Continue following standard 4-gas and buddy protocols."

        if (signageChecked) auditTrail.add("Signage verified: Danger Permit-Required Confined Space.")
        if (ppeVerified) auditTrail.add("PPE verified: 4-gas detector, self-rescuer, safety harness, anti-static boots.")

        if (!gasClearanceTested) {
            auditTrail.add("Omission: Atmospheric 4-gas sniffer test was NOT performed.")
        } else {
            auditTrail.add("Conforming action: Sniffer test performed: O2: 18.2% (Deficient), CH4: 1.4% (Dangerous).")
        }

        if (!buddyStandbyVerified) {
            auditTrail.add("Omission: No standby buddy or PTW Entry Supervisor confirmed at portal.")
        }

        // CRITICAL RULE:
        // Entering without gas clearance or without buddy = Automatic Instant FAIL & NOT_MASTERED
        if (finalAction == "ENTERED_CHAMBER") {
            criticalErrorFlag = true
            competencyCode = when {
                !gasClearanceTested -> "ERR_GAS_TEST_MISSING"
                !buddyStandbyVerified -> "ERR_NO_BUDDY_STANDBY"
                else -> "ERR_TOXIC_GAS_ENTRY_VIOLATION"
            }
            auditTrail.add("CRITICAL FATAL ACTION: Worker entered toxic/oxygen-deficient chamber.")
            remedialTitle = "3-Minute Lockout & Escalation Reflex Drill"
            remedialAction = "Inculcate immediate physical stop and verbal escalation whenever gas or buddy checks fail."
        } else {
            // Target Safe Outcome: Worker intentionally selects "DO NOT ENTER / ESCALATE"
            auditTrail.add("TARGET SAFE OUTCOME ACHIEVED: Worker recognized hazard and selected DO NOT ENTER / ESCALATE.")
        }

        val verdict = if (criticalErrorFlag) "FAIL" else "PASS"
        val mastery = if (criticalErrorFlag) "NOT_MASTERED" else "MASTERED"
        val score = if (criticalErrorFlag) 25 else 100

        return CompetencyEvaluationResult(
            moduleType = SimulationModuleType.CONFINED_SPACE_GAS_LEAK,
            verdict = verdict,
            competencyStatus = mastery,
            competencyCode = competencyCode,
            score = score,
            criticalErrorFlag = criticalErrorFlag,
            auditTrail = auditTrail,
            remedialDrillTitle = remedialTitle,
            remedialDrillAction = remedialAction
        )
    }
}
