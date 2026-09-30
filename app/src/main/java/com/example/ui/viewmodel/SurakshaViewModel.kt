package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.AudioGuidancePlayer
import com.example.audio.AudioSnippetKey
import com.example.audio.TtsHelper
import com.example.data.local.AssessmentRecordEntity
import com.example.data.local.CertificateEntity
import com.example.data.local.SimulationEventEntity
import com.example.data.local.SurakshaDatabase
import com.example.data.local.WorkerEntity
import com.example.data.model.AssessmentResult
import com.example.data.model.SimulationDrillSession
import com.example.data.repository.AssessmentRepository
import com.example.data.repository.OfflineSyncRepository
import com.example.data.sample.PredefinedDrills
import com.example.engine.ArCompatibilityChecker
import com.example.engine.DeviceCompatibilityResult
import com.example.engine.GeminiRemediationService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppTab {
    ASSESSMENT,
    AR_SIMULATOR,
    COMPLIANCE_LOGS,
    WORKER_ROSTER
}

enum class FeedbackLanguage {
    HINDI,
    SANTALI_OL_CHIKI,
    ENGLISH
}

sealed class AssessmentUiState {
    object Idle : AssessmentUiState()
    object Evaluating : AssessmentUiState()
    data class Success(val result: AssessmentResult, val recordId: Long? = null, val certificate: CertificateEntity? = null) : AssessmentUiState()
    data class Error(val message: String) : AssessmentUiState()
}

class SurakshaViewModel(application: Application) : AndroidViewModel(application) {

    private val database = SurakshaDatabase.getInstance(application)
    private val repository = AssessmentRepository(database.assessmentDao(), database.workerDao())
    val offlineSyncRepo = OfflineSyncRepository(application)
    private val geminiService = GeminiRemediationService()
    val ttsHelper = TtsHelper(application)
    val audioGuidancePlayer = AudioGuidancePlayer(application)

    // Startup Hardware & OS Compatibility Check (Android 11 Scoped & ARCore Check)
    val deviceCompatibility: DeviceCompatibilityResult = ArCompatibilityChecker.evaluateDevice(application)

    // Navigation & Tabs
    private val _currentTab = MutableStateFlow(AppTab.ASSESSMENT)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    // Active Simulation Session & Raw JSON
    private val _selectedSession = MutableStateFlow<SimulationDrillSession>(
        PredefinedDrills.FIRE_EVACUATION_BLOCKED_EXIT_FAIL.copy(
            executionMode = deviceCompatibility.recommendedMode
        )
    )
    val selectedSession: StateFlow<SimulationDrillSession> = _selectedSession.asStateFlow()

    private val _rawLogJsonInput = MutableStateFlow(_selectedSession.value.toJsonString(2))
    val rawLogJsonInput: StateFlow<String> = _rawLogJsonInput.asStateFlow()

    // Assessment State
    private val _assessmentState = MutableStateFlow<AssessmentUiState>(AssessmentUiState.Idle)
    val assessmentState: StateFlow<AssessmentUiState> = _assessmentState.asStateFlow()

    // Worker Feedback Language
    private val _selectedLanguage = MutableStateFlow(FeedbackLanguage.HINDI)
    val selectedLanguage: StateFlow<FeedbackLanguage> = _selectedLanguage.asStateFlow()

    // 3-Minute Re-drill Timer (180 seconds)
    private val _reDrillTimerSeconds = MutableStateFlow(180)
    val reDrillTimerSeconds: StateFlow<Int> = _reDrillTimerSeconds.asStateFlow()

    private val _isTimerRunning = MutableStateFlow(false)
    val isTimerRunning: StateFlow<Boolean> = _isTimerRunning.asStateFlow()

    private var timerJob: Job? = null

    // Supervisor Checklist items state
    private val _checklistCheckedStates = MutableStateFlow<Map<Int, Boolean>>(emptyMap())
    val checklistCheckedStates: StateFlow<Map<Int, Boolean>> = _checklistCheckedStates.asStateFlow()

    private val _supervisorNotes = MutableStateFlow("")
    val supervisorNotes: StateFlow<String> = _supervisorNotes.asStateFlow()

    private val _isReDrillCompleted = MutableStateFlow(false)
    val isReDrillCompleted: StateFlow<Boolean> = _isReDrillCompleted.asStateFlow()

    // Certificate Dialog
    private val _viewingCertificate = MutableStateFlow<CertificateEntity?>(null)
    val viewingCertificate: StateFlow<CertificateEntity?> = _viewingCertificate.asStateFlow()

    // Offline Sync Status
    private val _pendingSyncCount = MutableStateFlow(0)
    val pendingSyncCount: StateFlow<Int> = _pendingSyncCount.asStateFlow()

    private val _syncMessage = MutableStateFlow("All local logs appended. Offline-first active.")
    val syncMessage: StateFlow<String> = _syncMessage.asStateFlow()

    // Compliance Records Flow
    val complianceRecords: StateFlow<List<AssessmentRecordEntity>> = repository.allAssessments
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val workerRoster: StateFlow<List<WorkerEntity>> = repository.allWorkers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allCertificates: StateFlow<List<CertificateEntity>> = offlineSyncRepo.allCertificates
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filter for compliance logs
    private val _riskFilter = MutableStateFlow<String?>("ALL")
    val riskFilter: StateFlow<String?> = _riskFilter.asStateFlow()

    init {
        // Run initial evaluation on startup
        evaluateCurrentSession()
        refreshSyncCount()
    }

    fun setTab(tab: AppTab) {
        _currentTab.value = tab
    }

    fun setLanguage(lang: FeedbackLanguage) {
        _selectedLanguage.value = lang
    }

    fun toggleExecutionMode() {
        val current = _selectedSession.value
        val newMode = if (current.executionMode == "AR_MODE") "2D_FALLBACK_MODE" else "AR_MODE"
        val updated = current.copy(executionMode = newMode)
        _selectedSession.value = updated
        _rawLogJsonInput.value = updated.toJsonString(2)
        evaluateCurrentSession()
    }

    fun selectPredefinedSession(session: SimulationDrillSession) {
        _selectedSession.value = session
        _rawLogJsonInput.value = session.toJsonString(2)
        resetReDrillState()
        evaluateCurrentSession()
    }

    fun updateRawJsonInput(json: String) {
        _rawLogJsonInput.value = json
        try {
            val parsed = SimulationDrillSession.fromJsonString(json)
            _selectedSession.value = parsed
        } catch (_: Exception) {
            // Keep editing until valid
        }
    }

    fun evaluateCurrentSession() {
        viewModelScope.launch {
            _assessmentState.value = AssessmentUiState.Evaluating
            try {
                val sessionToEval = try {
                    SimulationDrillSession.fromJsonString(_rawLogJsonInput.value)
                } catch (_: Exception) {
                    _selectedSession.value
                }
                _selectedSession.value = sessionToEval

                val result = geminiService.evaluateDrill(sessionToEval)
                val recordId = repository.saveAssessment(sessionToEval, result)

                // Append-only PRD SQLite Schema entry & Certificate generation
                val eventEntities = sessionToEval.events.mapIndexed { idx, ev ->
                    SimulationEventEntity(
                        attemptId = "",
                        step = idx + 1,
                        action = ev.eventType,
                        timestamp = System.currentTimeMillis(),
                        hazardType = ev.hazardType,
                        details = ev.details
                    )
                }

                val cert = offlineSyncRepo.recordAttemptAndGenerateCertificate(
                    workerId = sessionToEval.workerId,
                    workerName = sessionToEval.workerName,
                    scenarioId = sessionToEval.drillId,
                    scenarioTitle = sessionToEval.drillTitle,
                    score = result.score,
                    competencyStatus = result.masteryStatus,
                    verdict = result.verdict,
                    criticalError = result.criticalViolations.firstOrNull()?.hazardType,
                    executionMode = sessionToEval.executionMode,
                    events = eventEntities
                )

                _assessmentState.value = AssessmentUiState.Success(result, recordId, cert)
                refreshSyncCount()
                resetReDrillState()
            } catch (e: Exception) {
                _assessmentState.value = AssessmentUiState.Error(e.message ?: "Evaluation failed")
            }
        }
    }

    fun evaluateCustomSession(session: SimulationDrillSession) {
        _selectedSession.value = session
        _rawLogJsonInput.value = session.toJsonString(2)
        evaluateCurrentSession()
    }

    // Audio guidance playback
    fun playAudioSnippet(key: AudioSnippetKey) {
        val langStr = when (_selectedLanguage.value) {
            FeedbackLanguage.HINDI -> "HINDI"
            FeedbackLanguage.SANTALI_OL_CHIKI -> "SANTALI_OL_CHIKI"
            FeedbackLanguage.ENGLISH -> "ENGLISH"
        }
        audioGuidancePlayer.playSnippet(key, langStr)
    }

    fun speakWorkerFeedback() {
        val state = _assessmentState.value
        if (state is AssessmentUiState.Success) {
            val feedback = state.result.workerFeedback
            when (_selectedLanguage.value) {
                FeedbackLanguage.HINDI -> ttsHelper.speak(feedback.hindi, "hi")
                FeedbackLanguage.SANTALI_OL_CHIKI -> {
                    if (feedback.santaliLatin.isNotBlank()) {
                        ttsHelper.speak(feedback.santaliLatin, "hi")
                    } else {
                        ttsHelper.speak(feedback.hindi, "hi")
                    }
                }
                FeedbackLanguage.ENGLISH -> ttsHelper.speak(feedback.english, "en")
            }
        }
    }

    fun stopAudio() {
        ttsHelper.stop()
    }

    // Certificate Viewer
    fun showCertificate(certificate: CertificateEntity) {
        _viewingCertificate.value = certificate
    }

    fun dismissCertificate() {
        _viewingCertificate.value = null
    }

    fun showCertificateForRecord(record: AssessmentRecordEntity) {
        viewModelScope.launch {
            val certId = "CERT-SIH-2026-${record.id.toString().padStart(4, '0')}"
            val cert = CertificateEntity(
                certificateId = certId,
                attemptId = "REC-${record.id}",
                workerId = record.workerId,
                workerName = record.workerName,
                scenarioId = record.drillId,
                scenarioTitle = record.drillTitle,
                status = if (record.verdict == "PASS") "VERIFIED" else "ISSUED",
                qrHash = "QR-HASH-${record.workerId}-${record.drillId}",
                signatureHash = "SIG-DGMS-${record.workerId}-${record.score}-${record.timestamp}",
                issuedAt = record.timestamp,
                verificationUrl = "https://suraksha-ar.sih.gov.in/verify-cert/$certId"
            )
            _viewingCertificate.value = cert
        }
    }

    // Worker Roster Actions
    fun assignWorkerToActiveDrill(worker: WorkerEntity) {
        val current = _selectedSession.value
        val updated = current.copy(
            workerId = worker.workerId,
            workerName = worker.name,
            trade = worker.trade
        )
        _selectedSession.value = updated
        _rawLogJsonInput.value = updated.toJsonString(2)
        when (worker.preferredLanguage) {
            "SANTALI_OL_CHIKI" -> _selectedLanguage.value = FeedbackLanguage.SANTALI_OL_CHIKI
            "ENGLISH" -> _selectedLanguage.value = FeedbackLanguage.ENGLISH
            else -> _selectedLanguage.value = FeedbackLanguage.HINDI
        }
        _currentTab.value = AppTab.ASSESSMENT
        evaluateCurrentSession()
    }

    fun addNewWorker(name: String, trade: String, department: String, preferredLanguage: String, siteId: String = "SITE-JHARIA-04") {
        viewModelScope.launch {
            val randomId = "WKR-${(1000..9999).random()}"
            val newWorker = WorkerEntity(
                workerId = randomId,
                name = name,
                siteId = siteId,
                trade = trade,
                department = department,
                preferredLanguage = preferredLanguage,
                totalDrills = 0,
                passedDrills = 0,
                lastRiskStatus = "LOW"
            )
            repository.insertWorker(newWorker)
        }
    }

    // Offline Sync Queue
    fun syncPendingQueue() {
        viewModelScope.launch {
            val synced = offlineSyncRepo.syncPendingQueue()
            _syncMessage.value = "Synced $synced pending attempts to central safety server (idempotent)."
            refreshSyncCount()
        }
    }

    private fun refreshSyncCount() {
        viewModelScope.launch {
            _pendingSyncCount.value = offlineSyncRepo.getPendingSyncCount()
        }
    }

    // 3-Minute Re-drill Timer controls
    fun startReDrillTimer() {
        if (_isTimerRunning.value) return
        _isTimerRunning.value = true
        timerJob = viewModelScope.launch {
            while (_reDrillTimerSeconds.value > 0 && _isTimerRunning.value) {
                delay(1000)
                _reDrillTimerSeconds.value = _reDrillTimerSeconds.value - 1
            }
            if (_reDrillTimerSeconds.value == 0) {
                _isTimerRunning.value = false
            }
        }
    }

    fun pauseReDrillTimer() {
        _isTimerRunning.value = false
        timerJob?.cancel()
    }

    fun resetReDrillTimer() {
        pauseReDrillTimer()
        _reDrillTimerSeconds.value = 180
    }

    fun toggleChecklistItem(index: Int) {
        val current = _checklistCheckedStates.value.toMutableMap()
        current[index] = !(current[index] ?: false)
        _checklistCheckedStates.value = current
    }

    fun setSupervisorNotes(notes: String) {
        _supervisorNotes.value = notes
    }

    fun markReDrillCompleted(recordId: Long?) {
        _isReDrillCompleted.value = true
        if (recordId != null) {
            viewModelScope.launch {
                repository.updateSupervisorSignOff(
                    id = recordId,
                    completed = true,
                    signedOff = true,
                    notes = _supervisorNotes.value
                )
            }
        }
    }

    fun setRiskFilter(filter: String?) {
        _riskFilter.value = filter
    }

    fun deleteAssessmentRecord(id: Long) {
        viewModelScope.launch {
            repository.deleteAssessment(id)
        }
    }

    fun clearAllLogs() {
        viewModelScope.launch {
            repository.clearHistory()
        }
    }

    private fun resetReDrillState() {
        resetReDrillTimer()
        _checklistCheckedStates.value = emptyMap()
        _supervisorNotes.value = ""
        _isReDrillCompleted.value = false
    }

    override fun onCleared() {
        super.onCleared()
        ttsHelper.shutdown()
        audioGuidancePlayer.shutdown()
        timerJob?.cancel()
    }
}
