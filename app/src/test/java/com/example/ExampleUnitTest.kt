package com.example

import com.example.data.sample.PredefinedDrills
import com.example.engine.DgmsSafetyRuleEngine
import com.example.engine.SafetyStateMachine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun `critical safety violation forces automatic FAIL and NOT_MASTERED status`() {
        val result = DgmsSafetyRuleEngine.evaluate(PredefinedDrills.CONFINED_SPACE_FAIL)
        assertEquals("FAIL", result.verdict)
        assertEquals("NOT_MASTERED", result.masteryStatus)
        assertEquals("CRITICAL", result.riskClassification)
        assertEquals("AR_MODE", result.executionMode)
        assertTrue("Critical violation must be detected", result.criticalViolationDetected)
        assertTrue("Score must not exceed 50 for critical failure", result.score < 50)
        assertTrue("Must include DGMS or OSHA rule violation", result.criticalViolations.any { it.ruleCode.contains("DGMS") || it.ruleCode.contains("OSHA") })
        assertTrue("Hindi feedback should be non-empty plain Devanagari", result.workerFeedback.hindi.isNotBlank())
    }

    @Test
    fun `moving towards blocked exit during fire forces immediate FAIL and NOT_MASTERED`() {
        val result = DgmsSafetyRuleEngine.evaluate(PredefinedDrills.FIRE_EVACUATION_BLOCKED_EXIT_FAIL)
        assertEquals("FAIL", result.verdict)
        assertEquals("NOT_MASTERED", result.masteryStatus)
        assertEquals("CRITICAL", result.riskClassification)
        assertEquals("2D_FALLBACK_MODE", result.executionMode)
        assertTrue("Critical violation detected for blocked exit", result.criticalViolationDetected)
        assertTrue("Should cite DGMS CMR 139 or OSHA 1910.36", result.criticalViolations.any { it.hazardType == "FIRE_BLOCKED_EXIT_TRAP" })
    }

    @Test
    fun `safe escalation in confined space evaluates to PASS and MASTERED status`() {
        val result = DgmsSafetyRuleEngine.evaluate(PredefinedDrills.CONFINED_SPACE_ESCALATE_SAFE_PASS)
        assertEquals("PASS", result.verdict)
        assertEquals("MASTERED", result.masteryStatus)
        assertEquals("LOW", result.riskClassification)
        assertFalse("No critical violation should occur for intentional safe escalation", result.criticalViolationDetected)
        assertTrue("Score should be high for recognizing hazard and aborting", result.score >= 85)
    }

    @Test
    fun `state machine Module 1 - moving to blocked exit A is instant critical failure`() {
        val eval = SafetyStateMachine.evaluateFireEvacuation(
            alarmRaised = true,
            extinguisherSelected = "CO2_DRY_POWDER",
            evacuationRouteTaken = "BLOCKED_EXIT_A"
        )
        assertEquals("FAIL", eval.verdict)
        assertEquals("NOT_MASTERED", eval.competencyStatus)
        assertEquals("ERR_BLOCKED_EXIT_ATTEMPT", eval.competencyCode)
        assertTrue(eval.criticalErrorFlag)
        assertEquals(20, eval.score)
    }

    @Test
    fun `state machine Module 1 - safe route to Exit B assembly point passes`() {
        val eval = SafetyStateMachine.evaluateFireEvacuation(
            alarmRaised = true,
            extinguisherSelected = "CO2_DRY_POWDER",
            evacuationRouteTaken = "SAFE_EXIT_B_ASSEMBLY"
        )
        assertEquals("PASS", eval.verdict)
        assertEquals("MASTERED", eval.competencyStatus)
        assertEquals("COMPETENCY_MASTERED", eval.competencyCode)
        assertFalse(eval.criticalErrorFlag)
        assertEquals(95, eval.score)
    }

    @Test
    fun `state machine Module 2 - entering without gas test triggers instant FAIL`() {
        val eval = SafetyStateMachine.evaluateConfinedSpace(
            signageChecked = true,
            ppeVerified = true,
            gasClearanceTested = false,
            buddyStandbyVerified = true,
            finalAction = "ENTERED_CHAMBER"
        )
        assertEquals("FAIL", eval.verdict)
        assertEquals("NOT_MASTERED", eval.competencyStatus)
        assertEquals("ERR_GAS_TEST_MISSING", eval.competencyCode)
        assertTrue(eval.criticalErrorFlag)
    }

    @Test
    fun `state machine Module 2 - intentional safe escalation achieves MASTERED`() {
        val eval = SafetyStateMachine.evaluateConfinedSpace(
            signageChecked = true,
            ppeVerified = true,
            gasClearanceTested = true,
            buddyStandbyVerified = true,
            finalAction = "DO_NOT_ENTER_ESCALATE"
        )
        assertEquals("PASS", eval.verdict)
        assertEquals("MASTERED", eval.competencyStatus)
        assertEquals("COMPETENCY_MASTERED", eval.competencyCode)
        assertFalse(eval.criticalErrorFlag)
        assertEquals(100, eval.score)
    }
}
