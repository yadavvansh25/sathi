package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface AssessmentDao {
    @Query("SELECT * FROM assessment_records ORDER BY timestamp DESC")
    fun getAllAssessments(): Flow<List<AssessmentRecordEntity>>

    @Query("SELECT * FROM assessment_records WHERE id = :id")
    suspend fun getAssessmentById(id: Long): AssessmentRecordEntity?

    @Query("SELECT * FROM assessment_records WHERE workerId = :workerId ORDER BY timestamp DESC")
    fun getAssessmentsForWorker(workerId: String): Flow<List<AssessmentRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssessment(assessment: AssessmentRecordEntity): Long

    @Update
    suspend fun updateAssessment(assessment: AssessmentRecordEntity)

    @Query("UPDATE assessment_records SET reDrillCompleted = :completed, supervisorSignedOff = :signedOff, supervisorNotes = :notes WHERE id = :id")
    suspend fun updateSupervisorSignOff(id: Long, completed: Boolean, signedOff: Boolean, notes: String)

    @Query("DELETE FROM assessment_records WHERE id = :id")
    suspend fun deleteAssessmentById(id: Long)

    @Query("DELETE FROM assessment_records")
    suspend fun clearAllAssessments()
}

@Dao
interface WorkerDao {
    @Query("SELECT * FROM workers ORDER BY name ASC")
    fun getAllWorkers(): Flow<List<WorkerEntity>>

    @Query("SELECT * FROM workers WHERE workerId = :workerId")
    suspend fun getWorkerById(workerId: String): WorkerEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateWorker(worker: WorkerEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertWorkers(workers: List<WorkerEntity>)

    @Query("UPDATE workers SET totalDrills = totalDrills + 1, passedDrills = passedDrills + :passedIncrement, lastRiskStatus = :riskStatus, lastDrillDate = :date WHERE workerId = :workerId")
    suspend fun incrementWorkerStats(workerId: String, passedIncrement: Int, riskStatus: String, date: Long)
}
