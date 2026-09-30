package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ThreeMinuteReDrill
import com.example.ui.theme.ArCyanGlow
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightBorder
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.PassGreen
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.PassGreenBorder
import com.example.ui.theme.PassGreenSoft
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyAmberSoft

@Composable
fun ReDrillCard(
    reDrill: ThreeMinuteReDrill,
    timerSeconds: Int,
    isTimerRunning: Boolean,
    onStartTimer: () -> Unit,
    onPauseTimer: () -> Unit,
    onResetTimer: () -> Unit,
    checkedStates: Map<Int, Boolean>,
    onToggleChecklist: (Int) -> Unit,
    supervisorNotes: String,
    onNotesChange: (String) -> Unit,
    isCompleted: Boolean,
    onMarkCompleted: () -> Unit,
    modifier: Modifier = Modifier
) {
    val minutes = timerSeconds / 60
    val secs = timerSeconds % 60
    val timerText = String.format("%02d:%02d", minutes, secs)
    val progress = (180 - timerSeconds) / 180f

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("re_drill_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = IndustrialLightSurface // Pure white (#FFFFFF)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = BorderStroke(1.dp, if (isCompleted) PassGreen else IndustrialLightBorder)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(SafetyAmberSoft),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("3m", fontWeight = FontWeight.Black, color = IndustrialAmber, fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "TARGETED PHYSICAL RE-DRILL",
                            style = MaterialTheme.typography.labelSmall,
                            color = IndustrialAmber,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = reDrill.drillTitle,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                if (isCompleted) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = PassGreenSoft,
                        border = BorderStroke(1.dp, PassGreenBorder)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PassGreenBold, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("SIGNED OFF", color = PassGreenBold, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Objective
            Text(
                text = "Objective: ${reDrill.objective}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Timer & Controls Bar
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = timerText,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.Monospace,
                                color = if (timerSeconds < 30) Color(0xFFEF4444) else SafetyAmber
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isTimerRunning) "RE-DRILL IN PROGRESS" else "SUPERVISOR STOPWATCH",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Row {
                            if (!isTimerRunning) {
                                FilledTonalButton(
                                    onClick = onStartTimer,
                                    modifier = Modifier.testTag("start_timer_btn"),
                                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = SafetyAmber.copy(alpha = 0.2f))
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = "Start", tint = SafetyAmber, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Start", color = SafetyAmber, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                FilledTonalButton(
                                    onClick = onPauseTimer,
                                    modifier = Modifier.testTag("pause_timer_btn")
                                ) {
                                    Icon(Icons.Default.Pause, contentDescription = "Pause", modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Pause", fontSize = 12.sp)
                                }
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            IconButton(
                                onClick = onResetTimer,
                                modifier = Modifier.testTag("reset_timer_btn")
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = "Reset", modifier = Modifier.size(18.dp))
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = SafetyAmber,
                        trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Step by Step Re-drill Actions
            Text(
                text = "180-SECOND MUSCLE MEMORY SEQUENCE:",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(8.dp))

            reDrill.steps.forEachIndexed { index, step ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(0.5.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = ArCyanGlow.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = step.minute,
                                color = ArCyanGlow,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = step.action,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Medium
                            )
                            if (step.physicalFocus.isNotBlank()) {
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Physical Focus: ${step.physicalFocus}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SafetyAmber,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Supervisor Compliance Sign-Off Checklist
            Text(
                text = "SUPERVISOR COMPLIANCE LOG CHECKLIST:",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))

            reDrill.supervisorSignOffChecklist.forEachIndexed { idx, item ->
                val isChecked = checkedStates[idx] ?: false
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isChecked,
                        onCheckedChange = { onToggleChecklist(idx) },
                        modifier = Modifier.testTag("checklist_item_$idx"),
                        colors = CheckboxDefaults.colors(
                            checkedColor = PassGreen,
                            checkmarkColor = Color.White
                        )
                    )
                    Text(
                        text = item,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isChecked) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = if (isChecked) FontWeight.SemiBold else FontWeight.Normal
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Supervisor notes
            OutlinedTextField(
                value = supervisorNotes,
                onValueChange = onNotesChange,
                label = { Text("Shift In-Charge / Safety Officer Log Notes") },
                placeholder = { Text("e.g. Worker completed 4-gas bump test under supervision.") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("supervisor_notes_input"),
                textStyle = MaterialTheme.typography.bodySmall,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Sign-off button
            Button(
                onClick = onMarkCompleted,
                enabled = !isCompleted,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("sign_off_re_drill_btn"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isCompleted) PassGreen else SafetyAmber,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(
                    imageVector = if (isCompleted) Icons.Default.Check else Icons.Default.VerifiedUser,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isCompleted) "RE-DRILL SIGNED OFF & ARCHIVED" else "SIGN OFF 3-MIN COMPLIANCE RE-DRILL",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}
