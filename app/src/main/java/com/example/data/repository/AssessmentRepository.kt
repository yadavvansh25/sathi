package com.example.data.repository

import com.example.data.local.AssessmentDao
import com.example.data.local.AssessmentRecordEntity
import com.example.data.local.WorkerDao
import com.example.data.local.WorkerEntity
import com.example.data.model.AssessmentResult
import com.example.data.model.SimulationDrillSession
import kotlinx.coroutines.flow.Flow

class AssessmentRepository(
    private val assessmentDao: AssessmentDao,
    private val workerDao: WorkerDao
) {
    val allAssessments: Flow<List<AssessmentRecordEntity>> = assessmentDao.getAllAssessments()
    val allWorkers: Flow<List<WorkerEntity>> = workerDao.getAllWorkers()

    suspend fun saveAssessment(
        session: SimulationDrillSession,
        result: AssessmentResult
    ): Long {
        val violationsSummary = if (result.criticalViolations.isEmpty()) {
            "None - Compliant"
        } else {
            result.criticalViolations.joinToString("; ") { "${it.ruleCode}: ${it.description}" }
        }

        val reDrillStepsSummary = result.threeMinuteReDrill.steps.joinToString(" -> ") {
            "[${it.minute}] ${it.action}"
        }

        val entity = AssessmentRecordEntity(
            drillId = session.drillId,
            drillTitle = session.drillTitle,
            workerId = session.workerId,
            workerName = session.workerName,
            trade = session.trade,
            category = session.category,
            verdict = result.verdict,
            masteryStatus = result.masteryStatus,
            executionMode = result.executionMode,
            riskClassification = result.riskClassification,
            score = result.score,
            criticalViolationDetected = result.criticalViolationDetected,
            criticalViolationsSummary = violationsSummary,
            workerFeedbackHindi = result.workerFeedback.hindi,
            workerFeedbackEnglish = result.workerFeedback.english,
            workerFeedbackOlChiki = result.workerFeedback.olChikiSantali,
            workerFeedbackSantaliLatin = result.workerFeedback.santaliLatin,
            reDrillTitle = result.threeMinuteReDrill.drillTitle,
            reDrillStepsSummary = reDrillStepsSummary,
            reDrillCompleted = false,
            supervisorSignedOff = false,
            supervisorNotes = "",
            rawLogJson = session.toJsonString(0),
            fullAssessmentJson = result.toJsonString(0),
            engineMode = result.engineMode,
            timestamp = System.currentTimeMillis()
        )

        val id = assessmentDao.insertAssessment(entity)

        // Update worker stats
        val passedIncrement = if (result.verdict == "PASS") 1 else 0
        workerDao.incrementWorkerStats(
            workerId = session.workerId,
            passedIncrement = passedIncrement,
            riskStatus = result.riskClassification,
            date = System.currentTimeMillis()
        )

        return id
    }

    suspend fun updateSupervisorSignOff(id: Long, completed: Boolean, signedOff: Boolean, notes: String) {
        assessmentDao.updateSupervisorSignOff(id, completed, signedOff, notes)
    }

    suspend fun deleteAssessment(id: Long) {
        assessmentDao.deleteAssessmentById(id)
    }

    suspend fun clearHistory() {
        assessmentDao.clearAllAssessments()
    }

    suspend fun insertWorker(worker: WorkerEntity) {
        workerDao.insertOrUpdateWorker(worker)
    }
}
