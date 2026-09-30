package com.example.data.repository

import android.content.Context
import com.example.data.local.AttemptDao
import com.example.data.local.AttemptEntity
import com.example.data.local.CertificateDao
import com.example.data.local.CertificateEntity
import com.example.data.local.ScenarioDao
import com.example.data.local.ScenarioEntity
import com.example.data.local.SimulationEventEntity
import com.example.data.local.SurakshaDatabase
import com.example.data.local.WorkerDao
import com.example.data.local.WorkerEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.security.MessageDigest
import java.util.UUID

data class SyncQueueStatus(
    val pendingCount: Int,
    val totalCount: Int,
    val lastSyncMessage: String,
    val isOnline: Boolean
)

class OfflineSyncRepository(context: Context) {

    private val db = SurakshaDatabase.getInstance(context)
    private val attemptDao: AttemptDao = db.attemptDao()
    private val scenarioDao: ScenarioDao = db.scenarioDao()
    private val certificateDao: CertificateDao = db.certificateDao()
    private val workerDao: WorkerDao = db.workerDao()

    val allAttempts: Flow<List<AttemptEntity>> = attemptDao.getAllAttempts()
    val allCertificates: Flow<List<CertificateEntity>> = certificateDao.getAllCertificates()
    val allWorkers: Flow<List<WorkerEntity>> = workerDao.getAllWorkers()

    /**
     * Append-only local storage of drill evaluation, granular events, and certificate
     */
    suspend fun recordAttemptAndGenerateCertificate(
        workerId: String,
        workerName: String,
        scenarioId: String,
        scenarioTitle: String,
        score: Int,
        competencyStatus: String, // "MASTERED", "NOT_MASTERED"
        verdict: String, // "PASS", "FAIL"
        criticalError: String?,
        executionMode: String,
        events: List<SimulationEventEntity>
    ): CertificateEntity = withContext(Dispatchers.IO) {
        val attemptId = UUID.randomUUID().toString()
        val timestamp = System.currentTimeMillis()

        // 1. Insert Attempt
        val attempt = AttemptEntity(
            attemptId = attemptId,
            workerId = workerId,
            scenarioId = scenarioId,
            timestamp = timestamp,
            score = score,
            competencyStatus = competencyStatus,
            verdict = verdict,
            criticalError = criticalError,
            executionMode = executionMode,
            syncStatus = "PENDING"
        )
        attemptDao.insertAttempt(attempt)

        // 2. Insert Events mapped to attemptId
        val mappedEvents = events.map { it.copy(attemptId = attemptId) }
        attemptDao.insertEvents(mappedEvents)

        // 3. Update Worker aggregate stats
        val passedIncrement = if (verdict == "PASS") 1 else 0
        val riskStatus = if (criticalError != null) "CRITICAL" else if (score >= 80) "LOW" else "MEDIUM"
        workerDao.incrementWorkerStats(workerId, passedIncrement, riskStatus, timestamp)

        // 4. Generate Verifiable Certificate with cryptographic hashes
        val certId = "CERT-SIH-2026-${UUID.randomUUID().toString().take(8).uppercase()}"
        val rawData = "$certId|$attemptId|$workerId|$scenarioId|$competencyStatus|$verdict|$timestamp"
        val qrHash = sha256("QR:$rawData")
        val signatureHash = sha256("SIG-DGMS-SIH-26041:$rawData")

        val certificate = CertificateEntity(
            certificateId = certId,
            attemptId = attemptId,
            workerId = workerId,
            workerName = workerName,
            scenarioId = scenarioId,
            scenarioTitle = scenarioTitle,
            status = if (verdict == "PASS") "VERIFIED" else "ISSUED",
            qrHash = qrHash,
            signatureHash = signatureHash,
            issuedAt = timestamp,
            verificationUrl = "https://suraksha-ar.sih.gov.in/verify-cert/$certId"
        )
        certificateDao.insertCertificate(certificate)

        certificate
    }

    suspend fun getPendingSyncCount(): Int = withContext(Dispatchers.IO) {
        attemptDao.getPendingAttempts().size
    }

    /**
     * Idempotent Offline Sync upload simulation
     * Uploads attempts batch when network is available and updates syncStatus to 'SYNCED'
     */
    suspend fun syncPendingQueue(): Int = withContext(Dispatchers.IO) {
        val pending = attemptDao.getPendingAttempts()
        var syncedCount = 0
        for (attempt in pending) {
            // Simulated idempotent backend POST /api/v1/sync/attempts
            // Deduplicated at backend via attemptId UUID
            attemptDao.markAttemptSynced(attempt.attemptId)
            syncedCount++
        }
        syncedCount
    }

    suspend fun getCertificateById(certId: String): CertificateEntity? = withContext(Dispatchers.IO) {
        certificateDao.getCertificateById(certId)
    }

    suspend fun getEventsForAttempt(attemptId: String): List<SimulationEventEntity> = withContext(Dispatchers.IO) {
        attemptDao.getEventsForAttempt(attemptId)
    }

    private fun sha256(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
