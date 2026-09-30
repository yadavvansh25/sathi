package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * PRD SQLite Schema: Workers
 * Append-only / Idempotent profile entity
 */
@Entity(tableName = "workers")
data class WorkerEntity(
    @PrimaryKey
    val workerId: String,
    val name: String,
    val siteId: String = "SITE-JHARIA-04",
    val preferredLanguage: String = "HINDI", // "HINDI", "SANTALI_OL_CHIKI", "ENGLISH"
    val trade: String = "Mining Sirdar",
    val department: String = "Underground Extraction",
    val totalDrills: Int = 0,
    val passedDrills: Int = 0,
    val lastRiskStatus: String = "LOW",
    val lastDrillDate: Long = System.currentTimeMillis()
)

/**
 * PRD SQLite Schema: Scenarios
 * Scenario parameters and tamper-proof content hash
 */
@Entity(tableName = "scenarios")
data class ScenarioEntity(
    @PrimaryKey
    val scenarioId: String,
    val moduleId: String, // "FIRE_EVACUATION", "CONFINED_SPACE"
    val title: String,
    val version: String = "1.2.0",
    val contentHash: String, // SHA-256 hash of rules & spatial parameters
    val targetStandard: String = "DGMS CMR 2017 / OSHA 1910"
)

/**
 * PRD SQLite Schema: Attempts
 * Append-only drill evaluations with UUID idempotency and offline sync status
 */
@Entity(tableName = "attempts")
data class AttemptEntity(
    @PrimaryKey
    val attemptId: String = UUID.randomUUID().toString(),
    val workerId: String,
    val scenarioId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val score: Int,
    val competencyStatus: String, // "MASTERED", "NOT_MASTERED"
    val verdict: String, // "PASS", "FAIL"
    val criticalError: String? = null,
    val executionMode: String = "2D_FALLBACK_MODE", // "AR_MODE", "2D_FALLBACK_MODE"
    val syncStatus: String = "PENDING" // "PENDING", "SYNCED"
)

/**
 * PRD SQLite Schema: Events
 * Append-only granular simulation event telemetry
 */
@Entity(tableName = "events")
data class SimulationEventEntity(
    @PrimaryKey(autoGenerate = true)
    val eventId: Long = 0,
    val attemptId: String,
    val step: Int,
    val action: String,
    val timestamp: Long = System.currentTimeMillis(),
    val hazardType: String = "NONE",
    val details: String = ""
)

/**
 * PRD SQLite Schema: Certificates
 * Offline cryptographically verifiable competency credentials
 */
@Entity(tableName = "certificates")
data class CertificateEntity(
    @PrimaryKey
    val certificateId: String, // e.g. "CERT-SIH-2026-XXXX"
    val attemptId: String,
    val workerId: String,
    val workerName: String,
    val scenarioId: String,
    val scenarioTitle: String,
    val status: String = "ISSUED", // "ISSUED", "VERIFIED", "REVOKED"
    val qrHash: String,
    val signatureHash: String,
    val issuedAt: Long = System.currentTimeMillis(),
    val verificationUrl: String = "https://suraksha-ar.sih.gov.in/verify-cert/"
)
