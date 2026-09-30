package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.GasMeter
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.audio.AudioSnippetKey
import com.example.data.model.SimulationDrillSession
import com.example.data.model.SimulationEvent
import com.example.engine.SimulationModuleType
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.AlertRedBorder
import com.example.ui.theme.AlertRedSoft
import com.example.ui.theme.Amber800
import com.example.ui.theme.AmberBorder
import com.example.ui.theme.AmberBorderDark
import com.example.ui.theme.ArCyanBorder
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.ArCyanGlow
import com.example.ui.theme.ArCyanSoft
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightBg
import com.example.ui.theme.IndustrialLightBorder
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.PassGreen
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.PassGreenBorder
import com.example.ui.theme.PassGreenSoft
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.TextPrimaryLight
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.SurakshaViewModel
import kotlinx.coroutines.delay

@Composable
fun ArSimulationScreen(
    viewModel: SurakshaViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    // 1. Simulation Module Selection: Module 1 (Fire) vs Module 2 (Gas Leak / Confined Sump)
    var activeModule by remember { mutableStateOf(SimulationModuleType.FIRE_EVACUATION) }
    var executionMode by remember { mutableStateOf("AR_MODE") } // "AR_MODE" or "2D_FALLBACK_MODE"

    // 2. Active Running Simulation State & Clock
    var isDrillRunning by remember { mutableStateOf(false) }
    var drillElapsedSeconds by remember { mutableIntStateOf(0) }

    // Module 1 (Fire Evacuation) State
    var alarmSounded by remember { mutableStateOf(false) }
    var extinguisherUsed by remember { mutableStateOf(false) }
    var lifelineFollowed by remember { mutableStateOf(false) }
    var movedToBlockedExit by remember { mutableStateOf(false) }

    // Module 2 (Confined Space Gas Leak) State
    var gasTested by remember { mutableStateOf(false) }
    var ptwVerified by remember { mutableStateOf(false) }
    var buddyStationed by remember { mutableStateOf(false) }
    var blowerRunning by remember { mutableStateOf(false) }
    var steppedInsideUnsafe by remember { mutableStateOf(false) }
    var escalatedSafeOutcome by remember { mutableStateOf(false) }

    // Live Telemetry Event Stream
    val liveEvents = remember { mutableStateListOf<SimulationEvent>() }

    // Live clock ticker
    LaunchedEffect(isDrillRunning) {
        if (isDrillRunning) {
            while (true) {
                delay(1000L)
                drillElapsedSeconds += 1
            }
        }
    }

    // Animation transitions for AR HUD Radar & Fire Flame
    val infiniteTransition = rememberInfiniteTransition(label = "arHudAnim")
    val radarSweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(3000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radarSweep"
    )

    val flameFlicker by infiniteTransition.animateFloat(
        initialValue = 0.7f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flameFlicker"
    )

    fun addTelemetryEvent(type: String, zone: String, hazard: String, details: String, params: Map<String, String> = emptyMap()) {
        if (!isDrillRunning) {
            isDrillRunning = true
        }
        val evt = SimulationEvent(
            eventId = "EVT-${System.currentTimeMillis() % 10000}",
            timestampMs = drillElapsedSeconds * 1000L,
            eventType = type,
            zone = zone,
            hazardType = hazard,
            details = details,
            parameters = params
        )
        liveEvents.add(0, evt)
    }

    fun resetDrill() {
        isDrillRunning = false
        drillElapsedSeconds = 0
        alarmSounded = false
        extinguisherUsed = false
        lifelineFollowed = false
        movedToBlockedExit = false
        gasTested = false
        ptwVerified = false
        buddyStationed = false
        blowerRunning = false
        steppedInsideUnsafe = false
        escalatedSafeOutcome = false
        liveEvents.clear()
        Toast.makeText(context, "Drill reset to start", Toast.LENGTH_SHORT).show()
    }

    val minutes = drillElapsedSeconds / 60
    val secs = drillElapsedSeconds % 60
    val timerFormatted = String.format("%02d:%02d", minutes, secs)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IndustrialLightBg)
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag("ar_simulation_screen")
    ) {
        // Top Header & Mode Switch
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "SURAKSHA TELEMETRY SIMULATOR",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Amber800,
                    letterSpacing = 1.sp
                )
                Text(
                    text = if (executionMode == "AR_MODE") "Spatial AR Mode (IMU/HUD)" else "2D Interactive Fallback",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(
                    onClick = {
                        executionMode = if (executionMode == "AR_MODE") "2D_FALLBACK_MODE" else "AR_MODE"
                        Toast.makeText(context, "Mode switched to $executionMode", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.height(34.dp).testTag("sim_mode_toggle_btn"),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Slate300),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = IndustrialLightSurface)
                ) {
                    Icon(Icons.Default.SyncAlt, contentDescription = null, tint = IndustrialAmber, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (executionMode == "AR_MODE") "Switch 2D" else "Switch AR", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                }

                Spacer(modifier = Modifier.width(6.dp))

                IconButton(
                    onClick = { resetDrill() },
                    modifier = Modifier.size(34.dp).testTag("reset_sim_btn")
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Reset Simulation", tint = Slate600, modifier = Modifier.size(20.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Module Selection Tabs: Module 1 (Fire) vs Module 2 (Confined Space)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                onClick = {
                    if (activeModule != SimulationModuleType.FIRE_EVACUATION) {
                        activeModule = SimulationModuleType.FIRE_EVACUATION
                        resetDrill()
                    }
                },
                modifier = Modifier.weight(1f).height(40.dp).testTag("module_fire_tab"),
                shape = RoundedCornerShape(10.dp),
                color = if (activeModule == SimulationModuleType.FIRE_EVACUATION) SafetyAmberSoft else IndustrialLightSurface,
                border = BorderStroke(1.dp, if (activeModule == SimulationModuleType.FIRE_EVACUATION) AmberBorderDark else Slate200)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "🔥 Module 1: Fire Evacuation",
                        fontSize = 11.5.sp,
                        fontWeight = if (activeModule == SimulationModuleType.FIRE_EVACUATION) FontWeight.Bold else FontWeight.Medium,
                        color = if (activeModule == SimulationModuleType.FIRE_EVACUATION) Amber800 else Slate700
                    )
                }
            }

            Surface(
                onClick = {
                    if (activeModule != SimulationModuleType.CONFINED_SPACE_GAS_LEAK) {
                        activeModule = SimulationModuleType.CONFINED_SPACE_GAS_LEAK
                        resetDrill()
                    }
                },
                modifier = Modifier.weight(1f).height(40.dp).testTag("module_gas_tab"),
                shape = RoundedCornerShape(10.dp),
                color = if (activeModule == SimulationModuleType.CONFINED_SPACE_GAS_LEAK) SafetyAmberSoft else IndustrialLightSurface,
                border = BorderStroke(1.dp, if (activeModule == SimulationModuleType.CONFINED_SPACE_GAS_LEAK) AmberBorderDark else Slate200)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "⚠️ Module 2: Confined Sump",
                        fontSize = 11.5.sp,
                        fontWeight = if (activeModule == SimulationModuleType.CONFINED_SPACE_GAS_LEAK) FontWeight.Bold else FontWeight.Medium,
                        color = if (activeModule == SimulationModuleType.CONFINED_SPACE_GAS_LEAK) Amber800 else Slate700
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Simulation Status & Live Timer Bar
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            color = IndustrialLightSurface,
            border = BorderStroke(1.dp, Slate200)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(
                                when {
                                    movedToBlockedExit || steppedInsideUnsafe -> Color(0xFFEF4444)
                                    isDrillRunning -> Color(0xFF10B981)
                                    else -> SafetyAmber
                                }
                            )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = when {
                            movedToBlockedExit -> "CRITICAL FAILURE: BLOCKED ROUTE"
                            steppedInsideUnsafe -> "CRITICAL FAILURE: UNTESTED ENTRY"
                            escalatedSafeOutcome -> "TARGET SAFE OUTCOME: ESCALATED"
                            lifelineFollowed -> "EVACUATED TO SAFE ASSEMBLY"
                            isDrillRunning -> "SIMULATION RUNNING (LIVE TELEMETRY)"
                            else -> "READY TO START DRILL"
                        },
                        fontSize = 10.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = when {
                            movedToBlockedExit || steppedInsideUnsafe -> AlertRedBold
                            escalatedSafeOutcome || lifelineFollowed -> PassGreenBold
                            isDrillRunning -> TextPrimaryLight
                            else -> Slate600
                        }
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Timer, contentDescription = null, tint = IndustrialAmber, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = timerFormatted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = if (isDrillRunning) IndustrialAmber else Slate600
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Dynamic Interactive AR / 2D Visualizer HUD Canvas
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(175.dp)
                .testTag("ar_hud_canvas_card"),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF070B14)),
            border = BorderStroke(
                1.5.dp,
                if (movedToBlockedExit || steppedInsideUnsafe) Color(0xFFEF4444) else if (executionMode == "AR_MODE") ArCyanGlow.copy(alpha = 0.6f) else AmberBorder
            )
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // Dynamic Grid
                    for (x in 0 until w.toInt() step 45) {
                        drawLine(
                            color = Color(0x1838BDF8),
                            start = Offset(x.toFloat(), 0f),
                            end = Offset(x.toFloat(), h)
                        )
                    }
                    for (y in 0 until h.toInt() step 45) {
                        drawLine(
                            color = Color(0x1838BDF8),
                            start = Offset(0f, y.toFloat()),
                            end = Offset(w, y.toFloat())
                        )
                    }

                    val center = Offset(w / 2, h / 2)

                    if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
                        // Central Reticle
                        drawCircle(
                            color = if (movedToBlockedExit) Color(0x88EF4444) else Color(0x4438BDF8),
                            radius = 40f,
                            center = center,
                            style = Stroke(width = 2f)
                        )

                        // Animated Radar line
                        val rad = Math.toRadians(radarSweepAngle.toDouble())
                        val endX = center.x + 80f * Math.cos(rad).toFloat()
                        val endY = center.y + 80f * Math.sin(rad).toFloat()
                        drawLine(
                            color = if (movedToBlockedExit) Color(0x99EF4444) else Color(0x7738BDF8),
                            start = center,
                            end = Offset(endX, endY),
                            strokeWidth = 2f
                        )

                        // Cabinet Fire flame circle
                        drawCircle(
                            color = Color(0xFFF97316).copy(alpha = flameFlicker),
                            radius = 18f * flameFlicker,
                            center = Offset(w * 0.5f, h * 0.35f)
                        )

                        // Blocked Exit A (Top Right)
                        drawRect(
                            color = if (movedToBlockedExit) Color(0xFFEF4444) else Color(0x99EF4444),
                            topLeft = Offset(w * 0.78f, h * 0.15f),
                            size = Size(65f, 35f),
                            style = Stroke(width = 2f)
                        )

                        // Safe Exit B Lifeline (Bottom Left)
                        drawRect(
                            color = if (lifelineFollowed) Color(0xFF10B981) else Color(0x8810B981),
                            topLeft = Offset(w * 0.08f, h * 0.65f),
                            size = Size(65f, 35f),
                            style = Stroke(width = 2f)
                        )

                        // Lifeline green line
                        drawLine(
                            color = Color(0x8810B981),
                            start = Offset(w * 0.22f, h * 0.7f),
                            end = center,
                            strokeWidth = 2f
                        )
                    } else {
                        // Module 2 Confined Space Sump Layout: Sump chamber circle & depth levels
                        drawCircle(
                            color = if (steppedInsideUnsafe) Color(0xAAEF4444) else if (escalatedSafeOutcome) Color(0x8810B981) else Color(0x6638BDF8),
                            radius = 55f,
                            center = center,
                            style = Stroke(width = 3f)
                        )
                        drawCircle(
                            color = if (steppedInsideUnsafe) Color(0x33EF4444) else Color(0x1A38BDF8),
                            radius = 35f,
                            center = center
                        )

                        // Ladder rungs
                        for (i in 0..4) {
                            val rungY = center.y - 25f + (i * 12f)
                            drawLine(
                                color = Color(0x88F59E0B),
                                start = Offset(center.x - 12f, rungY),
                                end = Offset(center.x + 12f, rungY),
                                strokeWidth = 2f
                            )
                        }
                    }
                }

                // Overlay Text & Status Indicators
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(10.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Color(0xDD0B132B),
                            border = BorderStroke(1.dp, if (executionMode == "AR_MODE") Color(0x6638BDF8) else AmberBorder)
                        ) {
                            Row(modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(if (executionMode == "AR_MODE") Color(0xFF38BDF8) else SafetyAmber))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (executionMode == "AR_MODE") "SPATIAL AR HUD" else "2D DECISION CANVAS",
                                    color = if (executionMode == "AR_MODE") Color(0xFF38BDF8) else SafetyAmber,
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = Color(0xDD0B132B)
                        ) {
                            Text(
                                text = if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
                                    if (alarmSounded) "SIREN: ACTIVE (105 dB)" else "FIRE: PANEL IGNITION"
                                } else {
                                    if (blowerRunning) "BLOWER: 1200 CFM" else "ATMOSPHERE: UNTESTED"
                                },
                                color = if (alarmSounded || blowerRunning) Color(0xFF34D399) else Color(0xFFFF6B6B),
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    // Spatial / Sensor readings
                    if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("EXIT B (SAFE): 24m SOUTH", color = Color(0xFF34D399), fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                Text("LIFELINE: INTAKE DRIFT", color = Color(0xFF94A3B8), fontSize = 8.sp)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("EXIT A: BLOCKED (CO 380 ppm)", color = Color(0xFFFF6B6B), fontSize = 9.sp, fontWeight = FontWeight.Bold)
                                Text("SMOKE VELOCITY: 2.1 m/s", color = Color(0xFFFF6B6B), fontSize = 8.sp)
                            }
                        }
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            GasHudTag("O2", if (blowerRunning) "20.9%" else if (gasTested) "18.2%" else "--", isAlert = !blowerRunning && gasTested)
                            GasHudTag("CH4", if (gasTested) "0.15%" else "--", isAlert = false)
                            GasHudTag("H2S", if (gasTested) "8 ppm" else "--", isAlert = gasTested)
                            GasHudTag("CO", if (steppedInsideUnsafe) "380 ppm" else if (gasTested) "2 ppm" else "--", isAlert = steppedInsideUnsafe)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Interactive Drill Step & Prompt Banner
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            color = if (movedToBlockedExit || steppedInsideUnsafe) AlertRedSoft else SafetyAmberSoft,
            border = BorderStroke(1.dp, if (movedToBlockedExit || steppedInsideUnsafe) AlertRedBorder else AmberBorder)
        ) {
            Row(
                modifier = Modifier.padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (movedToBlockedExit || steppedInsideUnsafe) Icons.Default.Warning else Icons.Default.PlayArrow,
                    contentDescription = null,
                    tint = if (movedToBlockedExit || steppedInsideUnsafe) AlertRedBold else Amber800,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
                            if (movedToBlockedExit) "CRITICAL FATAL DECISION: Entered Blocked Route!"
                            else if (lifelineFollowed) "SAFE OUTCOME: Evacuated safely to Assembly Point!"
                            else "SCENARIO: Electrical Panel Fire! Exit A is Blocked. Make your decision:"
                        } else {
                            if (steppedInsideUnsafe) "CRITICAL FATAL DECISION: Stepped in without gas clearance!"
                            else if (escalatedSafeOutcome) "SAFE OUTCOME: Recognized hazard, deployed lockout & escalated!"
                            else "SCENARIO: Arrived at virtual sump rim. Follow DGMS/OSHA entry protocol:"
                        },
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (movedToBlockedExit || steppedInsideUnsafe) AlertRedBold else Amber800
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Interactive Action Decision Buttons
        Text(
            text = "TRIGGER WORKER TELEMETRY ACTIONS:",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Slate600,
            letterSpacing = 0.5.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
            // Module 1 Fire Evacuation Actions: 2 neat rows of 2 buttons each
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionStepButton(
                    title = if (alarmSounded) "Alarm Sounded ✓" else "Sound Alarm",
                    icon = Icons.Default.Campaign,
                    isActive = alarmSounded,
                    onClick = {
                        alarmSounded = true
                        viewModel.playAudioSnippet(AudioSnippetKey.ALARM_BAJAO)
                        addTelemetryEvent(
                            type = "FIRE_ALARM_SIREN_TRIGGERED",
                            zone = "Electrical Cabinet",
                            hazard = "FIRE_EMERGENCY",
                            details = "Pressed manual break-glass call point. Siren active across drift.",
                            params = mapOf("alarm_decibels" to "105")
                        )
                        Toast.makeText(context, "Alarm siren activated!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                ActionStepButton(
                    title = if (extinguisherUsed) "CO2 Deployed ✓" else "CO2 Extinguisher",
                    icon = Icons.Default.Shield,
                    isActive = extinguisherUsed,
                    onClick = {
                        extinguisherUsed = true
                        addTelemetryEvent(
                            type = "EXTINGUISHER_DEPLOYED",
                            zone = "Electrical Cabinet",
                            hazard = "CLASS_C_ELECTRICAL_FIRE",
                            details = "Deployed Class C/E CO2 dry chemical agent to contain fire.",
                            params = mapOf("agent" to "CO2_DRY_POWDER")
                        )
                        Toast.makeText(context, "CO2 Extinguisher deployed!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionStepButton(
                    title = if (lifelineFollowed) "Exit B Followed ✓" else "Exit B (Safe Lifeline)",
                    icon = Icons.Default.Navigation,
                    isActive = lifelineFollowed,
                    onClick = {
                        lifelineFollowed = true
                        movedToBlockedExit = false
                        viewModel.playAudioSnippet(AudioSnippetKey.BLOCKED_EXIT_WARNING)
                        addTelemetryEvent(
                            type = "FOLLOWED_LIFELINE_ESCAPEWAY",
                            zone = "South Escape Shaft",
                            hazard = "SAFE_EVACUATION",
                            details = "Followed illuminated intake lifeline markers safely toward Exit B Assembly Point.",
                            params = mapOf("route" to "SAFE_EXIT_B_ASSEMBLY")
                        )
                        Toast.makeText(context, "Safe evacuation via Exit B Lifeline!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                ActionStepButton(
                    title = "Exit A (Blocked Danger)",
                    icon = Icons.Default.Block,
                    isActive = movedToBlockedExit,
                    isDanger = true,
                    onClick = {
                        movedToBlockedExit = true
                        viewModel.playAudioSnippet(AudioSnippetKey.RUKO)
                        addTelemetryEvent(
                            type = "MOVED_TOWARD_BLOCKED_EXIT",
                            zone = "North Conveyor Drift",
                            hazard = "CRITICAL_BLOCKED_EXIT_VIOLATION",
                            details = "CRITICAL FAILURE: Panicked into smoke-filled corridor marked BLOCKED EXIT! CO=380ppm",
                            params = mapOf("exit_blocked" to "true", "co_ppm" to "380")
                        )
                        Toast.makeText(context, "CRITICAL: Blocked Exit Entered!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }
        } else {
            // Module 2 Confined Space Gas Leak Actions: 3 neat rows of 2 buttons each
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionStepButton(
                    title = if (gasTested) "4-Gas Tested ✓" else "4-Gas Sniffer (3 Lvl)",
                    icon = Icons.Default.GasMeter,
                    isActive = gasTested,
                    onClick = {
                        gasTested = true
                        addTelemetryEvent(
                            type = "GAS_TEST_SNIFFER_PERFORMED",
                            zone = "Opening Rim",
                            hazard = "ATMOSPHERE",
                            details = "4-gas sniffer lowered to 3 levels: O2=18.2%, H2S=8ppm, CH4=0.15%",
                            params = mapOf("gas_tested" to "true")
                        )
                        Toast.makeText(context, "Atmospheric testing complete!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                ActionStepButton(
                    title = if (ptwVerified) "PTW Verified ✓" else "Verify Permit (PTW)",
                    icon = Icons.Default.Lock,
                    isActive = ptwVerified,
                    onClick = {
                        ptwVerified = true
                        addTelemetryEvent(
                            type = "PERMIT_TO_WORK_VERIFIED",
                            zone = "Entry Point",
                            hazard = "STATUTORY_PERMIT",
                            details = "Verified confined space permit signed by Shift Safety In-Charge",
                            params = mapOf("ptw_signed" to "true")
                        )
                        Toast.makeText(context, "Permit-To-Work verified!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionStepButton(
                    title = if (buddyStationed) "Buddy Linked ✓" else "Standby Buddy Link",
                    icon = Icons.Default.Group,
                    isActive = buddyStationed,
                    onClick = {
                        buddyStationed = true
                        addTelemetryEvent(
                            type = "BUDDY_SAFETY_RADIO_COMM",
                            zone = "Opening Rim",
                            hazard = "BUDDY_SYSTEM",
                            details = "Designated standby buddy stationed at winch with line of sight",
                            params = mapOf("buddy_present" to "true")
                        )
                        Toast.makeText(context, "Standby Buddy linked!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                ActionStepButton(
                    title = if (blowerRunning) "Blower Active ✓" else "Turn On Air Blower",
                    icon = Icons.Default.Sensors,
                    isActive = blowerRunning,
                    onClick = {
                        blowerRunning = true
                        addTelemetryEvent(
                            type = "FORCED_AIR_BLOWER_ENGAGED",
                            zone = "Sump Duct",
                            hazard = "VENTILATION",
                            details = "Mechanical air blower engaged; fresh air supplied continuously",
                            params = mapOf("blower_cfm" to "1200")
                        )
                        Toast.makeText(context, "Air Blower engaged!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionStepButton(
                    title = if (escalatedSafeOutcome) "Escalated ✓" else "Escalate (Safe)",
                    icon = Icons.Default.CheckCircle,
                    isActive = escalatedSafeOutcome,
                    onClick = {
                        escalatedSafeOutcome = true
                        viewModel.playAudioSnippet(AudioSnippetKey.ESCALATE_SAFE_OUTCOME)
                        addTelemetryEvent(
                            type = "INTENTIONAL_SAFE_ESCALATION",
                            zone = "Sump Threshold",
                            hazard = "SAFE_DECISION",
                            details = "TARGET SAFE OUTCOME: Recognized high H2S, locked out entry bar, and escalated to sirdar.",
                            params = mapOf("decision" to "DO_NOT_ENTER_ESCALATE")
                        )
                        Toast.makeText(context, "Target Safe Outcome: Escalated!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                ActionStepButton(
                    title = "Step In Space (Danger)",
                    icon = Icons.Default.Warning,
                    isActive = steppedInsideUnsafe,
                    isDanger = true,
                    onClick = {
                        steppedInsideUnsafe = true
                        if (!gasTested) {
                            viewModel.playAudioSnippet(AudioSnippetKey.ANDAR_MAT_JAO)
                            addTelemetryEvent(
                                type = "GAS_TESTING_OMITTED",
                                zone = "Chamber Floor",
                                hazard = "CRITICAL_VIOLATION",
                                details = "Entered confined chamber without multi-gas atmospheric testing!",
                                params = mapOf("ch4_tested" to "false")
                            )
                        }
                        if (!ptwVerified) {
                            addTelemetryEvent(
                                type = "PERMIT_TO_WORK_SKIPPED",
                                zone = "Chamber Floor",
                                hazard = "CRITICAL_VIOLATION",
                                details = "Entered without authorized Permit-To-Work",
                                params = mapOf("ptw_signed" to "false")
                            )
                        }
                        Toast.makeText(context, "CRITICAL: Entered without clearance!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Primary Finish & Evaluate Button (Always accessible & prominent)
        Button(
            onClick = {
                val session = SimulationDrillSession(
                    drillId = if (activeModule == SimulationModuleType.FIRE_EVACUATION) "DR-FIRE-${System.currentTimeMillis() % 10000}" else "DR-CS-${System.currentTimeMillis() % 10000}",
                    drillTitle = if (activeModule == SimulationModuleType.FIRE_EVACUATION) "Mine Fire Evacuation Lab (${if (executionMode == "AR_MODE") "AR Mode" else "2D Mode"})" else "Confined Sump Entry Lab (${if (executionMode == "AR_MODE") "AR Mode" else "2D Mode"})",
                    workerId = "WKR-LIVE-01",
                    workerName = "Rajesh Gope",
                    trade = if (activeModule == SimulationModuleType.FIRE_EVACUATION) "Haulage Attendant" else "Pump Operator",
                    category = if (activeModule == SimulationModuleType.FIRE_EVACUATION) "FIRE_EVACUATION" else "CONFINED_SPACE",
                    executionMode = executionMode,
                    targetStandard = if (activeModule == SimulationModuleType.FIRE_EVACUATION) "DGMS CMR 2017 Reg 139" else "OSHA 1910.146 Confined Space",
                    startTimeMs = System.currentTimeMillis() - (drillElapsedSeconds * 1000L),
                    endTimeMs = System.currentTimeMillis(),
                    events = if (liveEvents.isEmpty()) {
                        if (activeModule == SimulationModuleType.FIRE_EVACUATION) {
                            listOf(
                                SimulationEvent("EVT-1", 5000, "FIRE_ALARM_SIREN_TRIGGERED", "Cabinet", "FIRE_EMERGENCY", "Alarm pressed"),
                                SimulationEvent("EVT-2", 12000, "FOLLOWED_LIFELINE_ESCAPEWAY", "South Escape", "EMERGENCY_EVACUATION", "Safe exit B followed")
                            )
                        } else {
                            listOf(
                                SimulationEvent("EVT-1", 5000, "GAS_TEST_SNIFFER_PERFORMED", "Rim", "ATMOSPHERE", "4-gas sniffer test passed"),
                                SimulationEvent("EVT-2", 12000, "INTENTIONAL_SAFE_ESCALATION", "Sump", "SAFE_DECISION", "Escalated safely")
                            )
                        }
                    } else liveEvents.reversed()
                )
                Toast.makeText(context, "Evaluating drill session in Remediation Engine...", Toast.LENGTH_SHORT).show()
                viewModel.evaluateCustomSession(session)
                viewModel.setTab(AppTab.ASSESSMENT)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .testTag("evaluate_live_sim_btn"),
            colors = ButtonDefaults.buttonColors(containerColor = IndustrialAmber, contentColor = TextPrimaryLight),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.Assessment, contentDescription = null, tint = TextPrimaryLight, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("FINISH & EVALUATE IN ENGINE", fontWeight = FontWeight.Black, fontSize = 13.sp, letterSpacing = 0.5.sp, color = TextPrimaryLight)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Real-time Event Log Stream
        Text(
            text = "RECORDED DRILL TELEMETRY (${liveEvents.size} events):",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Slate600
        )
        Spacer(modifier = Modifier.height(6.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp)
        ) {
            if (liveEvents.isEmpty()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = IndustrialLightSurface,
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Drill active. Tap the decision buttons above to trigger worker telemetry actions in real-time.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate500,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            } else {
                liveEvents.take(10).forEach { evt ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = if (evt.hazardType.contains("CRITICAL")) AlertRedSoft else IndustrialLightSurface,
                        border = BorderStroke(
                            1.dp,
                            if (evt.hazardType.contains("CRITICAL")) AlertRedBorder else Slate200
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "+${evt.timestampMs / 1000}s",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = ArCyanDark,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = evt.eventType,
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (evt.hazardType.contains("CRITICAL")) AlertRedBold else TextPrimaryLight
                                )
                                Text(
                                    text = evt.details,
                                    fontSize = 10.5.sp,
                                    color = Slate600
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun GasHudTag(label: String, value: String, isAlert: Boolean) {
    Surface(
        shape = RoundedCornerShape(4.dp),
        color = Color(0xDD0D1117),
        border = BorderStroke(1.dp, if (isAlert) Color(0xFFEF4444) else Color(0x3338BDF8))
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(label, color = if (isAlert) Color(0xFFFF6B6B) else Color(0xFF38BDF8), fontSize = 9.sp, fontWeight = FontWeight.Bold)
            Text(value, color = if (isAlert) Color(0xFFFF6B6B) else Color.White, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
private fun ActionStepButton(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isActive: Boolean,
    isDanger: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        onClick = onClick,
        modifier = modifier.height(48.dp),
        shape = RoundedCornerShape(10.dp),
        color = when {
            isDanger && isActive -> AlertRedSoft
            isDanger -> IndustrialLightSurface
            isActive -> SafetyAmberSoft
            else -> IndustrialLightSurface
        },
        shadowElevation = if (isActive) 1.dp else 0.dp,
        border = BorderStroke(
            if (isActive) 1.5.dp else 1.dp,
            when {
                isDanger && isActive -> AlertRedBold
                isDanger -> AlertRedBorder
                isActive -> AmberBorderDark
                else -> Slate300
            }
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = if (isActive && !isDanger) Icons.Default.CheckCircle else icon,
                contentDescription = null,
                tint = when {
                    isDanger -> AlertRedBold
                    isActive -> Amber800
                    else -> Slate700
                },
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = title,
                fontSize = 11.5.sp,
                fontWeight = if (isActive) FontWeight.Black else FontWeight.Bold,
                color = when {
                    isDanger -> AlertRedBold
                    isActive -> Amber800
                    else -> Slate700
                },
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
