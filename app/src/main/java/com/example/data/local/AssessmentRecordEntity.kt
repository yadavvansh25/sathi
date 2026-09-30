package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "assessment_records")
data class AssessmentRecordEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val drillId: String,
    val drillTitle: String,
    val workerId: String,
    val workerName: String,
    val trade: String,
    val category: String,
    val verdict: String, // PASS, FAIL
    val masteryStatus: String = "NOT_MASTERED", // MASTERED, NOT_MASTERED
    val executionMode: String = "AR_MODE", // AR_MODE, 2D_FALLBACK_MODE
    val riskClassification: String, // LOW, MEDIUM, CRITICAL
    val score: Int,
    val criticalViolationDetected: Boolean,
    val criticalViolationsSummary: String,
    val workerFeedbackHindi: String,
    val workerFeedbackEnglish: String,
    val workerFeedbackOlChiki: String,
    val workerFeedbackSantaliLatin: String,
    val reDrillTitle: String,
    val reDrillStepsSummary: String,
    val reDrillCompleted: Boolean = false,
    val supervisorSignedOff: Boolean = false,
    val supervisorNotes: String = "",
    val rawLogJson: String,
    val fullAssessmentJson: String,
    val engineMode: String,
    val timestamp: Long = System.currentTimeMillis()
)
