package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SecondaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.AudioSnippetKey
import com.example.data.sample.PredefinedDrills
import com.example.ui.components.CertificateVerificationDialog
import com.example.ui.components.ComplianceTag
import com.example.ui.components.ExecutionModeBadge
import com.example.ui.components.JsonViewerDialog
import com.example.ui.components.MasteryStatusBadge
import com.example.ui.components.ReDrillCard
import com.example.ui.components.RiskClassificationBadge
import com.example.ui.components.VerdictBadge
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.AlertRedBorder
import com.example.ui.theme.AlertRedSoft
import com.example.ui.theme.Amber800
import com.example.ui.theme.AmberBorder
import com.example.ui.theme.AmberBorderDark
import com.example.ui.theme.ArCyanBorder
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.ArCyanSoft
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightBg
import com.example.ui.theme.IndustrialLightBorder
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.PassGreen
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.PassGreenBorder
import com.example.ui.theme.PassGreenSoft
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.TextPrimaryLight
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.AssessmentUiState
import com.example.ui.viewmodel.FeedbackLanguage
import com.example.ui.viewmodel.SurakshaViewModel
import androidx.compose.material3.ExperimentalMaterial3Api

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssessmentScreen(
    viewModel: SurakshaViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val selectedSession by viewModel.selectedSession.collectAsState()
    val rawJsonInput by viewModel.rawLogJsonInput.collectAsState()
    val assessmentState by viewModel.assessmentState.collectAsState()
    val selectedLanguage by viewModel.selectedLanguage.collectAsState()
    val timerSeconds by viewModel.reDrillTimerSeconds.collectAsState()
    val isTimerRunning by viewModel.isTimerRunning.collectAsState()
    val checklistCheckedStates by viewModel.checklistCheckedStates.collectAsState()
    val supervisorNotes by viewModel.supervisorNotes.collectAsState()
    val isReDrillCompleted by viewModel.isReDrillCompleted.collectAsState()

    val viewingCertificate by viewModel.viewingCertificate.collectAsState()
    val pendingSyncCount by viewModel.pendingSyncCount.collectAsState()

    var showJsonDialog by remember { mutableStateOf(false) }
    var jsonDialogContent by remember { mutableStateOf("") }
    var jsonDialogTitle by remember { mutableStateOf("") }
    var isRawLogExpanded by remember { mutableStateOf(false) }

    if (showJsonDialog) {
        JsonViewerDialog(
            title = jsonDialogTitle,
            jsonContent = jsonDialogContent,
            onDismiss = { showJsonDialog = false }
        )
    }

    viewingCertificate?.let { cert ->
        CertificateVerificationDialog(
            certificate = cert,
            onDismiss = { viewModel.dismissCertificate() }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IndustrialLightBg) // Crisp off-white / slate-50 (#F8FAFC)
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag("assessment_screen")
    ) {
        // 1. Top Header Banner with SurakshaAR icon and SIH 26041 / DGMS compliance tags
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = IndustrialLightSurface, // Pure white (#FFFFFF)
            shadowElevation = 1.dp,
            border = BorderStroke(1.dp, IndustrialLightBorder) // 1px border (#E2E8F0)
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(SafetyAmberSoft),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Amber800,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "SurakshaAR",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Black,
                            color = TextPrimaryLight // Dark slate #0F172A
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = SafetyAmberSoft,
                            border = BorderStroke(1.dp, AmberBorder)
                        ) {
                            Text(
                                text = "SIH 2026",
                                color = Amber800,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = ArCyanSoft,
                            border = BorderStroke(1.dp, ArCyanBorder)
                        ) {
                            Text(
                                text = "DGMS & OSHA",
                                color = ArCyanDark,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Safety Remediation & Assessment Engine",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate600,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Platform: Android 11 (${viewModel.deviceCompatibility.recommendedMode})",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Slate600
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Sync Queue: $pendingSyncCount pending",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (pendingSyncCount > 0) IndustrialAmber else Slate600
                            )
                            if (pendingSyncCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                IconButton(
                                    onClick = { viewModel.syncPendingQueue() },
                                    modifier = Modifier.size(20.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Sync,
                                        contentDescription = "Sync Now",
                                        tint = IndustrialAmber,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 2. Scenario Selector Pills (Dedicated Horizontal Scroll Container with non-shrinking pills)
        Text(
            text = "SELECT DRILL TELEMETRY SCENARIO:",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Slate600,
            letterSpacing = 0.5.sp
        )
        Spacer(modifier = Modifier.height(6.dp))

        val predefinedList = PredefinedDrills.getAllPredefined()
        val chipScroll = rememberScrollState()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(chipScroll)
                .padding(vertical = 2.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            predefinedList.forEach { drill ->
                val isSelected = drill.drillId == selectedSession.drillId
                Surface(
                    onClick = { viewModel.selectPredefinedSession(drill) },
                    shape = RoundedCornerShape(50),
                    color = if (isSelected) SafetyAmberSoft else IndustrialLightSurface,
                    border = BorderStroke(1.dp, if (isSelected) AmberBorderDark else Slate200),
                    modifier = Modifier
                        .height(36.dp)
                        .testTag("scenario_chip_${drill.drillId}")
                ) {
                    Box(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = when (drill.drillId) {
                                "DR-FIRE-2026-05" -> "Mine Fire (Blocked Exit Fail)"
                                "DR-CS-2026-01" -> "Confined Sump (Fail)"
                                "DR-CS-SAFE-06" -> "Confined Sump (Safe Escalation Pass)"
                                "DR-LOTO-2026-02" -> "Substation LOTO (Fail)"
                                "DR-MIN-2026-03" -> "Mine Strata (Pass)"
                                else -> "Haul Road (Marginal)"
                            },
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Amber800 else Slate700,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3. Scenario Details Card with Worker Metadata in structured 2-column format
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface), // Pure white
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            border = BorderStroke(1.dp, IndustrialLightBorder)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                // Title and Switch Mode Button in balanced row: Title gets weight(1f, fill=false) and Switch AR button has fixed footprint
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = selectedSession.drillTitle,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimaryLight,
                        modifier = Modifier.weight(1f, fill = false),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    // Mode Toggle button (Fixed, non-shrinking footprint with neat border)
                    OutlinedButton(
                        onClick = { viewModel.toggleExecutionMode() },
                        modifier = Modifier
                            .defaultMinSize(minWidth = 96.dp, minHeight = 32.dp)
                            .height(32.dp)
                            .testTag("toggle_mode_btn"),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, Slate300),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = IndustrialLightSurface,
                            contentColor = Slate700
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 0.dp)
                    ) {
                        Icon(
                            Icons.Default.SyncAlt,
                            contentDescription = null,
                            tint = IndustrialAmber,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (selectedSession.executionMode == "AR_MODE") "Switch 2D" else "Switch AR",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Worker metadata: 2-column structured card with clear icons
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = IndustrialLightBg,
                    border = BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(5.dp))
                                Text(
                                    text = selectedSession.workerName,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimaryLight
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Badge, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(5.dp))
                                Text(
                                    text = "ID: ${selectedSession.workerId}",
                                    fontSize = 11.sp,
                                    color = Slate600,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        Column(modifier = Modifier.weight(1.1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Engineering, contentDescription = null, tint = Slate500, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(5.dp))
                                Text(
                                    text = selectedSession.trade,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimaryLight
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = ArCyanDark, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(5.dp))
                                Text(
                                    text = selectedSession.targetStandard,
                                    fontSize = 10.sp,
                                    color = ArCyanDark,
                                    fontWeight = FontWeight.SemiBold,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Full-width centered Mode tag
                ExecutionModeBadge(
                    mode = selectedSession.executionMode,
                    fullWidth = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recorded Telemetry: ${selectedSession.events.size} physical events",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate600,
                        fontSize = 11.sp
                    )

                    IconButton(
                        onClick = { isRawLogExpanded = !isRawLogExpanded },
                        modifier = Modifier
                            .size(28.dp)
                            .testTag("toggle_raw_log_btn")
                    ) {
                        Icon(
                            imageVector = if (isRawLogExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = "Expand raw log",
                            tint = Slate500
                        )
                    }
                }

                AnimatedVisibility(visible = isRawLogExpanded) {
                    Column(modifier = Modifier.padding(top = 8.dp)) {
                        Text(
                            text = "Raw Simulation Telemetry Stream:",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate600
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(
                            value = rawJsonInput,
                            onValueChange = { viewModel.updateRawJsonInput(it) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp)
                                .testTag("raw_json_editor"),
                            textStyle = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp,
                                color = TextPrimaryLight
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = IndustrialLightBg,
                                unfocusedContainerColor = IndustrialLightBg,
                                focusedBorderColor = IndustrialAmber,
                                unfocusedBorderColor = Slate300
                            )
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 4. Primary Action Button ("EVALUATE TELEMETRY LOGS") - 52dp height, thumb-friendly
        Button(
            onClick = { viewModel.evaluateCurrentSession() },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("run_evaluation_btn"),
            colors = ButtonDefaults.buttonColors(
                containerColor = IndustrialAmber, // Solid high-visibility amber/orange (#D97706)
                contentColor = TextPrimaryLight // Bold dark text (#0F172A)
            ),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = TextPrimaryLight, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "EVALUATE TELEMETRY LOGS",
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp,
                    color = TextPrimaryLight
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            onClick = { viewModel.setTab(AppTab.AR_SIMULATOR) },
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
                .testTag("launch_ar_drill_btn"),
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, AmberBorderDark),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = SafetyAmberSoft,
                contentColor = Amber800
            )
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.ViewInAr, contentDescription = null, tint = Amber800, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("LAUNCH INTERACTIVE AR DRILL (3D / 2D SIMULATOR)", fontWeight = FontWeight.Bold, fontSize = 11.5.sp, color = Amber800)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 5. Assessment State & Balanced Evaluation Result
        when (val state = assessmentState) {
            is AssessmentUiState.Evaluating -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = IndustrialAmber)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Evaluating Drill Telemetry (${selectedSession.executionMode})...",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                        Text(
                            text = "Verifying non-negotiable critical safety overrides & DGMS/OSHA compliance",
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate600
                        )
                    }
                }
            }

            is AssessmentUiState.Error -> {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = AlertRedSoft,
                    border = BorderStroke(1.dp, AlertRedBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Evaluation Engine Error",
                            fontWeight = FontWeight.Bold,
                            color = AlertRedBold
                        )
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextPrimaryLight
                        )
                    }
                }
            }

            is AssessmentUiState.Success -> {
                val result = state.result

                // Verdict Summary Container (Pure white card with 1px border and subtle shadow)
                ElevatedCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("verdict_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.elevatedCardColors(
                        containerColor = IndustrialLightSurface // Pure white
                    ),
                    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, IndustrialLightBorder, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        // Badges Row: Guaranteed non-collapsing horizontal container (Zero letter-by-letter wrapping)
                        val badgeRowScroll = rememberScrollState()
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(badgeRowScroll)
                                .padding(vertical = 2.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            VerdictBadge(verdict = result.verdict)
                            MasteryStatusBadge(masteryStatus = result.masteryStatus)
                            RiskClassificationBadge(risk = result.riskClassification)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Execution Mode acknowledged
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "EVALUATED IN: ",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate600
                                )
                                ExecutionModeBadge(mode = result.executionMode)
                            }

                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = ArCyanSoft,
                                border = BorderStroke(1.dp, ArCyanBorder)
                            ) {
                                Text(
                                    text = result.engineMode,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ArCyanDark,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Score & Safety Rule Note
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "SAFETY COMPETENCY SCORE",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate600
                                )
                                Text(
                                    text = "${result.score} / 100",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    color = if (result.score >= 80) PassGreenBold else AlertRedBold
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "MASTERY VERDICT",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate600
                                )
                                Text(
                                    text = result.masteryStatus,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (result.masteryStatus == "MASTERED") PassGreenBold else AlertRedBold
                                )
                            }
                        }

                        if (result.criticalViolationDetected) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = AlertRedSoft, // Soft red background (#FEE2E2)
                                border = BorderStroke(1.dp, AlertRedBorder), // Red-200 border (#FECACA)
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Warning,
                                            contentDescription = null,
                                            tint = AlertRedBold,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "CRITICAL SAFETY OVERRIDE ACTIVE",
                                            fontWeight = FontWeight.Black,
                                            color = AlertRedBold,
                                            fontSize = 12.sp,
                                            letterSpacing = 0.5.sp
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "RULE 1 ENFORCED: Any critical safety violation (e.g. entering confined space without gas testing, moving towards a blocked exit during fire) results in an immediate and non-negotiable FAIL and NOT_MASTERED status, regardless of reaction time or points scored.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Slate800,
                                        fontSize = 11.sp
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    result.criticalViolations.forEach { vio ->
                                        Text(
                                            text = "• [${vio.ruleCode}] ${vio.description}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = AlertRedBold,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Regulatory compliance pill tags
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            ComplianceTag(label = "DGMS Compliant", isCompliant = result.regulatoryCompliance.dgmsCompliant)
                            ComplianceTag(label = "OSHA Compliant", isCompliant = result.regulatoryCompliance.oshaCompliant)
                        }
                    }
                }

                // Provisional Verifiable Certificate Banner (PRD Section 7)
                state.certificate?.let { cert ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("certificate_banner_card"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
                        border = BorderStroke(1.dp, if (result.verdict == "PASS") PassGreenBorder else AmberBorder),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .background(if (result.verdict == "PASS") PassGreenSoft else SafetyAmberSoft, RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.QrCode,
                                        contentDescription = "QR Certificate",
                                        tint = if (result.verdict == "PASS") PassGreenBold else IndustrialAmber,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "PROVISIONAL SAFETY CERTIFICATE",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        color = if (result.verdict == "PASS") PassGreenBold else IndustrialAmber,
                                        letterSpacing = 0.5.sp
                                    )
                                    Text(
                                        text = cert.certificateId,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = TextPrimaryLight
                                    )
                                }
                            }

                            FilledTonalButton(
                                onClick = { viewModel.showCertificate(cert) },
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = if (result.verdict == "PASS") PassGreenSoft else SafetyAmberSoft,
                                    contentColor = if (result.verdict == "PASS") PassGreenBold else Amber800
                                ),
                                border = BorderStroke(1.dp, if (result.verdict == "PASS") PassGreenBorder else AmberBorder)
                            ) {
                                Icon(Icons.Default.Verified, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("View QR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Worker Feedback Section (Conversational Hindi in plain Devanagari)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("worker_feedback_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface), // Pure white
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    border = BorderStroke(1.dp, IndustrialLightBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "ACTIONABLE WORKER FEEDBACK",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Amber800,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "Direct Plain-Language Supervisor Guidance",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimaryLight
                                )
                            }

                            // Audio TTS Speaker button
                            FilledTonalButton(
                                onClick = { viewModel.speakWorkerFeedback() },
                                modifier = Modifier.testTag("speak_audio_btn"),
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = SafetyAmberSoft, // Soft amber #FEF3C7
                                    contentColor = Amber800 // Amber-800 text
                                ),
                                border = BorderStroke(1.dp, AmberBorder)
                            ) {
                                Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = "Listen", tint = Amber800, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Listen Audio", color = Amber800, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // PRD Section 5: Pre-recorded audio guidance snippets ("Ruko", "Andar mat jao", "Alarm bajao")
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "PRE-RECORDED AUDIO GUIDANCE (INSTANT REACTION SNIPPETS):",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate600
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        val snippetScroll = rememberScrollState()
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(snippetScroll),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { viewModel.playAudioSnippet(AudioSnippetKey.RUKO) },
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(1.dp, AlertRedBorder)
                            ) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = AlertRedBold, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("रुको! (Stop)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AlertRedBold)
                            }
                            OutlinedButton(
                                onClick = { viewModel.playAudioSnippet(AudioSnippetKey.ANDAR_MAT_JAO) },
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(1.dp, AlertRedBorder)
                            ) {
                                Text("अंदर मत जाओ!", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AlertRedBold)
                            }
                            OutlinedButton(
                                onClick = { viewModel.playAudioSnippet(AudioSnippetKey.ALARM_BAJAO) },
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(1.dp, AmberBorder)
                            ) {
                                Text("अलार्म बजाओ!", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Amber800)
                            }
                            OutlinedButton(
                                onClick = { viewModel.playAudioSnippet(AudioSnippetKey.BLOCKED_EXIT_WARNING) },
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(1.dp, ArCyanBorder)
                            ) {
                                Text("Exit B (Lifeline)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ArCyanDark)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Language Tabs
                        SecondaryTabRow(
                            selectedTabIndex = when (selectedLanguage) {
                                FeedbackLanguage.HINDI -> 0
                                FeedbackLanguage.SANTALI_OL_CHIKI -> 1
                                FeedbackLanguage.ENGLISH -> 2
                            },
                            containerColor = IndustrialLightSurface,
                            contentColor = IndustrialAmber
                        ) {
                            Tab(
                                selected = selectedLanguage == FeedbackLanguage.HINDI,
                                onClick = { viewModel.setLanguage(FeedbackLanguage.HINDI) },
                                text = { Text("सरल हिंदी (Devanagari)", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                                selectedContentColor = IndustrialAmber,
                                unselectedContentColor = Slate600,
                                modifier = Modifier.testTag("lang_tab_hindi")
                            )
                            Tab(
                                selected = selectedLanguage == FeedbackLanguage.SANTALI_OL_CHIKI,
                                onClick = { viewModel.setLanguage(FeedbackLanguage.SANTALI_OL_CHIKI) },
                                text = { Text("ᱥᱟᱱᱛᱟᱲᱤ (Santali)", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                                selectedContentColor = IndustrialAmber,
                                unselectedContentColor = Slate600,
                                modifier = Modifier.testTag("lang_tab_santali")
                            )
                            Tab(
                                selected = selectedLanguage == FeedbackLanguage.ENGLISH,
                                onClick = { viewModel.setLanguage(FeedbackLanguage.ENGLISH) },
                                text = { Text("English", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                                selectedContentColor = IndustrialAmber,
                                unselectedContentColor = Slate600,
                                modifier = Modifier.testTag("lang_tab_english")
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Feedback Content Box with high contrast daylight typography
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = IndustrialLightBg,
                            border = BorderStroke(1.dp, Slate200),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                when (selectedLanguage) {
                                    FeedbackLanguage.HINDI -> {
                                        Text(
                                            text = result.workerFeedback.hindi,
                                            style = MaterialTheme.typography.bodyMedium,
                                            lineHeight = 24.sp,
                                            fontSize = 15.sp,
                                            color = TextPrimaryLight // Near-black for high outdoor visibility
                                        )
                                    }
                                    FeedbackLanguage.SANTALI_OL_CHIKI -> {
                                        Text(
                                            text = result.workerFeedback.olChikiSantali,
                                            style = MaterialTheme.typography.bodyMedium,
                                            lineHeight = 24.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimaryLight
                                        )
                                        if (result.workerFeedback.santaliLatin.isNotBlank()) {
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(
                                                text = "Latin Transliteration: ${result.workerFeedback.santaliLatin}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = Slate600,
                                                fontFamily = FontFamily.SansSerif
                                            )
                                        }
                                    }
                                    FeedbackLanguage.ENGLISH -> {
                                        Text(
                                            text = result.workerFeedback.english,
                                            style = MaterialTheme.typography.bodyMedium,
                                            lineHeight = 22.sp,
                                            color = TextPrimaryLight
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 3-Minute Physical Re-drill Protocol Card
                ReDrillCard(
                    reDrill = result.threeMinuteReDrill,
                    timerSeconds = timerSeconds,
                    isTimerRunning = isTimerRunning,
                    onStartTimer = { viewModel.startReDrillTimer() },
                    onPauseTimer = { viewModel.pauseReDrillTimer() },
                    onResetTimer = { viewModel.resetReDrillTimer() },
                    checkedStates = checklistCheckedStates,
                    onToggleChecklist = { viewModel.toggleChecklistItem(it) },
                    supervisorNotes = supervisorNotes,
                    onNotesChange = { viewModel.setSupervisorNotes(it) },
                    isCompleted = isReDrillCompleted,
                    onMarkCompleted = { viewModel.markReDrillCompleted(state.recordId) }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Compliance Actions & Export Card
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            jsonDialogTitle = "Strict JSON Schema Output"
                            jsonDialogContent = result.toJsonString(2)
                            showJsonDialog = true
                        },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = IndustrialLightSurface,
                            contentColor = TextPrimaryLight
                        ),
                        border = BorderStroke(1.dp, Slate200),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("view_strict_json_btn")
                    ) {
                        Icon(Icons.Default.Code, contentDescription = null, tint = Slate700, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Strict JSON", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimaryLight)
                    }

                    OutlinedButton(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, "SurakshaAR Safety Assessment - ${selectedSession.workerName}")
                                putExtra(Intent.EXTRA_TEXT, "SurakshaAR DGMS/OSHA Safety Remediation Log\nWorker: ${selectedSession.workerName} (${selectedSession.trade})\nVerdict: ${result.verdict}\nMastery: ${result.masteryStatus}\nMode: ${result.executionMode}\nRisk: ${result.riskClassification}\nScore: ${result.score}/100\nEvaluated: ${result.evaluatedAt}\nFeedback (Hindi): ${result.workerFeedback.hindi}\nRe-Drill: ${result.threeMinuteReDrill.drillTitle}")
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Safety Compliance Card"))
                        },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = IndustrialLightSurface,
                            contentColor = TextPrimaryLight
                        ),
                        border = BorderStroke(1.dp, Slate200),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("share_compliance_card_btn")
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, tint = Slate700, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share Log", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimaryLight)
                    }
                }
            }

            else -> {}
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
