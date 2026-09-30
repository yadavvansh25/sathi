package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AttemptDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttempt(attempt: AttemptEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvents(events: List<SimulationEventEntity>)

    @Query("SELECT * FROM attempts ORDER BY timestamp DESC")
    fun getAllAttempts(): Flow<List<AttemptEntity>>

    @Query("SELECT * FROM attempts WHERE syncStatus = 'PENDING' ORDER BY timestamp ASC")
    suspend fun getPendingAttempts(): List<AttemptEntity>

    @Query("UPDATE attempts SET syncStatus = 'SYNCED' WHERE attemptId = :attemptId")
    suspend fun markAttemptSynced(attemptId: String)

    @Query("SELECT * FROM events WHERE attemptId = :attemptId ORDER BY step ASC")
    suspend fun getEventsForAttempt(attemptId: String): List<SimulationEventEntity>
}

@Dao
interface ScenarioDao {
    @Query("SELECT * FROM scenarios ORDER BY scenarioId ASC")
    fun getAllScenarios(): Flow<List<ScenarioEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertScenarios(scenarios: List<ScenarioEntity>)

    @Query("SELECT * FROM scenarios WHERE scenarioId = :scenarioId")
    suspend fun getScenarioById(scenarioId: String): ScenarioEntity?
}

@Dao
interface CertificateDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCertificate(cert: CertificateEntity)

    @Query("SELECT * FROM certificates ORDER BY issuedAt DESC")
    fun getAllCertificates(): Flow<List<CertificateEntity>>

    @Query("SELECT * FROM certificates WHERE certificateId = :certificateId")
    suspend fun getCertificateById(certificateId: String): CertificateEntity?

    @Query("SELECT * FROM certificates WHERE attemptId = :attemptId")
    suspend fun getCertificateByAttemptId(attemptId: String): CertificateEntity?

    @Query("UPDATE certificates SET status = :status WHERE certificateId = :certificateId")
    suspend fun updateCertificateStatus(certificateId: String, status: String)
}
