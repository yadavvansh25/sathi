package com.example.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.PendingActions
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.AssessmentRecordEntity
import com.example.ui.components.CertificateVerificationDialog
import com.example.ui.components.ExecutionModeBadge
import com.example.ui.components.JsonViewerDialog
import com.example.ui.components.MasteryStatusBadge
import com.example.ui.components.RiskClassificationBadge
import com.example.ui.components.VerdictBadge
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.AlertRedBorder
import com.example.ui.theme.AlertRedSoft
import com.example.ui.theme.Amber800
import com.example.ui.theme.AmberBorder
import com.example.ui.theme.AmberBorderDark
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightBg
import com.example.ui.theme.IndustrialLightBorder
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.PassGreenBorder
import com.example.ui.theme.PassGreenSoft
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.TextPrimaryLight
import com.example.ui.viewmodel.SurakshaViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ComplianceLogsScreen(
    viewModel: SurakshaViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val records by viewModel.complianceRecords.collectAsState()
    val activeFilter by viewModel.riskFilter.collectAsState()
    val pendingSyncCount by viewModel.pendingSyncCount.collectAsState()
    val viewingCertificate by viewModel.viewingCertificate.collectAsState()

    var showJsonDialog by remember { mutableStateOf(false) }
    var selectedJson by remember { mutableStateOf("") }
    var selectedTitle by remember { mutableStateOf("") }
    var recordToDelete by remember { mutableStateOf<Long?>(null) }
    var showClearConfirm by remember { mutableStateOf(false) }

    if (showJsonDialog) {
        JsonViewerDialog(
            title = selectedTitle,
            jsonContent = selectedJson,
            onDismiss = { showJsonDialog = false }
        )
    }

    viewingCertificate?.let { cert ->
        CertificateVerificationDialog(
            certificate = cert,
            onDismiss = { viewModel.dismissCertificate() }
        )
    }

    if (recordToDelete != null) {
        AlertDialog(
            onDismissRequest = { recordToDelete = null },
            title = { Text("Delete Compliance Record?", color = TextPrimaryLight, fontWeight = FontWeight.Bold) },
            text = { Text("This will permanently remove the audit evaluation record.", color = Slate600) },
            containerColor = IndustrialLightSurface,
            confirmButton = {
                Button(
                    onClick = {
                        recordToDelete?.let { viewModel.deleteAssessmentRecord(it) }
                        recordToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AlertRedBold),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Delete", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { recordToDelete = null }) {
                    Text("Cancel", color = Slate700)
                }
            }
        )
    }

    if (showClearConfirm) {
        AlertDialog(
            onDismissRequest = { showClearConfirm = false },
            title = { Text("Clear All Audit History?", color = TextPrimaryLight, fontWeight = FontWeight.Bold) },
            text = { Text("This will erase all local drill evaluation logs from this device.", color = Slate600) },
            containerColor = IndustrialLightSurface,
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clearAllLogs()
                        showClearConfirm = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AlertRedBold),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Clear All", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearConfirm = false }) {
                    Text("Cancel", color = Slate700)
                }
            }
        )
    }

    val filteredRecords = when (activeFilter) {
        "CRITICAL" -> records.filter { it.riskClassification.equals("CRITICAL", true) }
        "MEDIUM" -> records.filter { it.riskClassification.equals("MEDIUM", true) }
        "LOW" -> records.filter { it.riskClassification.equals("LOW", true) }
        else -> records
    }

    val totalCount = records.size
    val criticalCount = records.count { it.riskClassification.equals("CRITICAL", true) }
    val passCount = records.count { it.verdict.equals("PASS", true) }
    val pendingSignOffs = records.count { !it.supervisorSignedOff && it.verdict.equals("FAIL", true) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IndustrialLightBg)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag("compliance_logs_screen")
    ) {
        // Title & Header Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "DGMS & OSHA COMPLIANCE LOGS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Amber800,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Supervisor Remediation Audit Registry",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )
            }

            if (totalCount > 0) {
                OutlinedButton(
                    onClick = { showClearConfirm = true },
                    modifier = Modifier.height(32.dp).testTag("clear_all_logs_btn"),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, AlertRedBorder),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = AlertRedSoft,
                        contentColor = AlertRedBold
                    ),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 0.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = null, tint = AlertRedBold, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear All", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AlertRedBold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Summary Statistics Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricCard(label = "Total Logs", value = "$totalCount", color = ArCyanDark, modifier = Modifier.weight(1f))
            MetricCard(label = "Critical", value = "$criticalCount", color = AlertRedBold, modifier = Modifier.weight(1f))
            MetricCard(label = "Pass Rate", value = if (totalCount > 0) "${(passCount * 100 / totalCount)}%" else "--", color = PassGreenBold, modifier = Modifier.weight(1f))
            MetricCard(label = "Pending Re-drills", value = "$pendingSignOffs", color = IndustrialAmber, modifier = Modifier.weight(1f))
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Sync Queue Status bar (Clean card container with aligned sync button)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            color = IndustrialLightSurface,
            border = BorderStroke(1.dp, Slate200)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Offline Sync Status: $pendingSyncCount pending upload",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate600
                )

                FilledTonalButton(
                    onClick = {
                        viewModel.syncPendingQueue()
                        Toast.makeText(context, "Syncing attempts to central server...", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.height(32.dp).testTag("sync_queue_btn"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (pendingSyncCount > 0) IndustrialAmber else SafetyAmberSoft,
                        contentColor = if (pendingSyncCount > 0) Color.White else Amber800
                    ),
                    border = BorderStroke(1.dp, if (pendingSyncCount > 0) IndustrialAmber else AmberBorder),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = if (pendingSyncCount > 0) "Sync ($pendingSyncCount)" else "Synced",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Risk Filter Chips (Balanced 4-Column Segmented Control)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("ALL", "CRITICAL", "MEDIUM", "LOW").forEach { risk ->
                val isSelected = activeFilter == risk
                Surface(
                    onClick = { viewModel.setRiskFilter(risk) },
                    modifier = Modifier
                        .weight(1f)
                        .height(34.dp)
                        .testTag("filter_chip_$risk"),
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) SafetyAmberSoft else IndustrialLightSurface,
                    border = BorderStroke(1.dp, if (isSelected) AmberBorderDark else Slate200)
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = risk,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Amber800 else Slate700
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Records List
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            if (filteredRecords.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No assessment logs found for this filter.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate500
                        )
                    }
                }
            } else {
                items(filteredRecords, key = { it.id }) { item ->
                    ComplianceLogItemCard(
                        record = item,
                        onViewJson = {
                            selectedTitle = "Evaluation Audit: ${item.drillId}"
                            selectedJson = item.fullAssessmentJson
                            showJsonDialog = true
                        },
                        onViewCert = {
                            viewModel.showCertificateForRecord(item)
                        },
                        onDelete = { recordToDelete = item.id }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        color = IndustrialLightSurface,
        shadowElevation = 1.dp,
        border = BorderStroke(1.dp, Slate200)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label, fontSize = 9.sp, color = Slate600, maxLines = 1, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, fontSize = 15.sp, fontWeight = FontWeight.Black, color = color, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
private fun ComplianceLogItemCard(
    record: AssessmentRecordEntity,
    onViewJson: () -> Unit,
    onViewCert: () -> Unit,
    onDelete: () -> Unit
) {
    val dateStr = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault()).format(Date(record.timestamp))

    Card(
        modifier = Modifier.fillMaxWidth().testTag("log_item_${record.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = BorderStroke(1.dp, IndustrialLightBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Row 1: Drill Title & Worker Info on Left, Clean Delete Button on Right
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = record.drillTitle,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimaryLight
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Worker: ${record.workerName} • ${record.trade} (${record.workerId})",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp).testTag("delete_log_${record.id}")
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = AlertRedBold.copy(alpha = 0.8f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 2: Dedicated Status Badges Row (Zero overlap with title or delete button)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                VerdictBadge(verdict = record.verdict)
                MasteryStatusBadge(masteryStatus = record.masteryStatus)
                ExecutionModeBadge(mode = record.executionMode)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 3: Risk Classification, Score, and Date
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                RiskClassificationBadge(risk = record.riskClassification)
                Text(
                    text = "Score: ${record.score}/100",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = if (record.score >= 80) PassGreenBold else AlertRedBold
                )
                Text(
                    text = dateStr,
                    fontSize = 10.5.sp,
                    color = Slate500
                )
            }

            if (record.criticalViolationsSummary.isNotBlank() && record.criticalViolationsSummary != "None - Compliant") {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = AlertRedSoft,
                    border = BorderStroke(0.5.dp, AlertRedBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Violation: ${record.criticalViolationsSummary}",
                        fontSize = 10.5.sp,
                        color = AlertRedBold,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Row 4: Re-drill sign off status and Action buttons (QR Cert & JSON) with perfect alignment and padding
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Re-drill status pill
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (record.supervisorSignedOff) Icons.Default.CheckCircle else Icons.Default.PendingActions,
                        contentDescription = null,
                        tint = if (record.supervisorSignedOff) PassGreenBold else Amber800,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = if (record.supervisorSignedOff) "Re-drill Signed Off" else "Re-drill Pending",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (record.supervisorSignedOff) PassGreenBold else Amber800
                    )
                }

                // Action Buttons: QR Cert and JSON with aligned footprint and centered contents
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilledTonalButton(
                        onClick = onViewCert,
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = SafetyAmberSoft,
                            contentColor = Amber800
                        ),
                        border = BorderStroke(1.dp, AmberBorder),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .height(34.dp)
                            .testTag("cert_btn_${record.id}"),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(5.dp))
                            Text("QR Cert", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedButton(
                        onClick = onViewJson,
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = IndustrialLightSurface,
                            contentColor = TextPrimaryLight
                        ),
                        border = BorderStroke(1.dp, Slate300),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .height(34.dp)
                            .testTag("json_btn_${record.id}"),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Code, contentDescription = null, tint = Slate600, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(5.dp))
                            Text("JSON", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextPrimaryLight)
                        }
                    }
                }
            }
        }
    }
}
