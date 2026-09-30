package com.example.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import com.example.ui.components.CertificateVerificationDialog
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
import com.example.ui.theme.SafetyAmber
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate800
import com.example.ui.theme.TextPrimaryLight
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.AssessmentUiState
import com.example.ui.viewmodel.FeedbackLanguage
import com.example.ui.viewmodel.SurakshaViewModel

@Composable
fun AssessmentScreen(
    viewModel: SurakshaViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val selectedSession by viewModel.selectedSession.collectAsState()
    val assessmentState by viewModel.assessmentState.collectAsState()
    val selectedLanguage by viewModel.selectedLanguage.collectAsState()
    val viewingCertificate by viewModel.viewingCertificate.collectAsState()
    val pendingSyncCount by viewModel.pendingSyncCount.collectAsState()

    // Verifiable Certificate Verification Dialog
    viewingCertificate?.let { cert ->
        CertificateVerificationDialog(
            certificate = cert,
            onDismiss = { viewModel.dismissCertificate() }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IndustrialLightBg) // Slate-50 (#F8FAFC)
            .verticalScroll(scrollState)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag("assessment_screen")
    ) {
        // ==========================================
        // 1. HEADER (App Title + DGMS/OSHA + Lang Switch + Audio)
        // ==========================================
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // App Title & DGMS/OSHA compliance badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "SurakshaAR",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = TextPrimaryLight // #0F172A
                )

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = SafetyAmberSoft,
                    border = BorderStroke(1.dp, AmberBorderDark)
                ) {
                    Text(
                        text = "DGMS & OSHA",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Amber800,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            // Language Switch Pill: [हिंदी | ᱥᱟᱱᱛᱟᱲᱤ] + Quick Audio Button
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Language selector pill
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = IndustrialLightSurface,
                    border = BorderStroke(1.dp, Slate200)
                ) {
                    Row(
                        modifier = Modifier.padding(2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            onClick = { viewModel.setLanguage(FeedbackLanguage.HINDI) },
                            shape = RoundedCornerShape(16.dp),
                            color = if (selectedLanguage == FeedbackLanguage.HINDI) SafetyAmberSoft else Color.Transparent
                        ) {
                            Text(
                                text = "हिंदी",
                                fontSize = 11.sp,
                                fontWeight = if (selectedLanguage == FeedbackLanguage.HINDI) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedLanguage == FeedbackLanguage.HINDI) Amber800 else Slate600,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }

                        Surface(
                            onClick = { viewModel.setLanguage(FeedbackLanguage.SANTALI_OL_CHIKI) },
                            shape = RoundedCornerShape(16.dp),
                            color = if (selectedLanguage == FeedbackLanguage.SANTALI_OL_CHIKI) SafetyAmberSoft else Color.Transparent
                        ) {
                            Text(
                                text = "ᱥᱟᱱᱛᱟᱲᱤ",
                                fontSize = 11.sp,
                                fontWeight = if (selectedLanguage == FeedbackLanguage.SANTALI_OL_CHIKI) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedLanguage == FeedbackLanguage.SANTALI_OL_CHIKI) Amber800 else Slate600,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                // Quick audio play button
                Surface(
                    onClick = {
                        viewModel.playAudioSnippet(AudioSnippetKey.ANDAR_MAT_JAO)
                        Toast.makeText(context, "Playing Safety Voice Guidance", Toast.LENGTH_SHORT).show()
                    },
                    shape = CircleShape,
                    color = SafetyAmberSoft,
                    border = BorderStroke(1.dp, AmberBorderDark),
                    modifier = Modifier.size(34.dp).testTag("quick_audio_play_btn")
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                            contentDescription = "Listen Guidance",
                            tint = Amber800,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ==========================================
        // 2. ACTIVE MODULE CARD (Pure White, 1px Border, Rounded-2xl)
        // ==========================================
        Card(
            modifier = Modifier.fillMaxWidth().testTag("active_module_card"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface), // #FFFFFF
            border = BorderStroke(1.dp, IndustrialLightBorder), // 1px #E2E8F0
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Top: Module Title & Mode Pill with Switch AR Button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "ACTIVE SAFETY DRILL",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate500,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Gas Leak & Confined Space Entry Lab",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                    }

                    // Mode Pill + Switch Button
                    OutlinedButton(
                        onClick = {
                            viewModel.toggleExecutionMode()
                            Toast.makeText(context, "Switched to ${selectedSession.executionMode}", Toast.LENGTH_SHORT).show()
                        },
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, Slate300),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = IndustrialLightSurface),
                        modifier = Modifier.height(32.dp).testTag("switch_to_ar_btn"),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.SyncAlt, contentDescription = null, tint = IndustrialAmber, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (selectedSession.executionMode == "AR_MODE") "Switch 2D" else "Switch to AR",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Mode Info Pill
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = IndustrialLightBg,
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Smartphone, contentDescription = null, tint = Slate600, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (selectedSession.executionMode == "AR_MODE") "Spatial AR Mode (IMU/HUD)" else "2D Fallback Mode (Android 11)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate700
                            )
                        }

                        Text(
                            text = "DGMS Standard Reg 139",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate500
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Worker Details: Rajesh Gope (ID: WKR-4491)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = Slate500, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Rajesh Gope (ID: WKR-4491)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                    }

                    Text(
                        text = "Trade: Pump Operator",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate600
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ==========================================
        // 3. PRIMARY BIG BUTTON ("▶ START SAFETY DRILL")
        // ==========================================
        Button(
            onClick = {
                viewModel.setTab(AppTab.AR_SIMULATOR)
                Toast.makeText(context, "Launching Safety Drill Simulator...", Toast.LENGTH_SHORT).show()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("start_safety_drill_btn"),
            colors = ButtonDefaults.buttonColors(
                containerColor = IndustrialAmber, // amber-500 (#D97706)
                contentColor = TextPrimaryLight   // bold dark text (#0F172A)
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
                    text = "START SAFETY DRILL",
                    fontWeight = FontWeight.Black,
                    fontSize = 14.sp,
                    letterSpacing = 1.sp,
                    color = TextPrimaryLight
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ==========================================
        // 4. CLEAR EVALUATION SUMMARY CARD (HORIZONTAL ALIGNMENT)
        // ==========================================
        Card(
            modifier = Modifier.fillMaxWidth().testTag("evaluation_summary_card"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Header with Score
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LAST EVALUATION SUMMARY",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500,
                        letterSpacing = 1.sp
                    )

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = AlertRedSoft,
                        border = BorderStroke(1.dp, AlertRedBorder)
                    ) {
                        Text(
                            text = "Score: 42/100",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = AlertRedBold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Clean horizontal status pills row (NO text wrapping errors)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Pill 1: [ ⚠ VERDICT: FAIL ] in soft red (#FEE2E2 / text-red-700)
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AlertRedSoft, // #FEE2E2
                        border = BorderStroke(1.dp, AlertRedBorder),
                        modifier = Modifier.weight(1f).height(34.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = AlertRedBold, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "VERDICT: FAIL",
                                color = AlertRedBold, // text-red-700
                                fontWeight = FontWeight.Black,
                                fontSize = 10.5.sp,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                    }

                    // Pill 2: [ ✖ NOT MASTERED ] in slate-100 / text-slate-700
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Slate100, // slate-100
                        border = BorderStroke(1.dp, Slate300),
                        modifier = Modifier.weight(1.05f).height(34.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Cancel, contentDescription = null, tint = Slate700, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "NOT MASTERED",
                                color = Slate700, // text-slate-700
                                fontWeight = FontWeight.Black,
                                fontSize = 10.5.sp,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                    }

                    // Pill 3: [ CRITICAL ERROR ]
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AlertRedSoft,
                        border = BorderStroke(1.dp, AlertRedBorder),
                        modifier = Modifier.weight(1.25f).height(34.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "CRITICAL: Gas Test Skipped",
                                color = AlertRedBold,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                maxLines = 1,
                                softWrap = false,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Plain-Language Worker Feedback Banner
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = IndustrialLightBg,
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Worker Guidance (${if (selectedLanguage == FeedbackLanguage.HINDI) "हिंदी" else "ᱥᱟᱱᱛᱟᱲᱤ"}):",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate700
                            )

                            Surface(
                                onClick = {
                                    viewModel.playAudioSnippet(AudioSnippetKey.ANDAR_MAT_JAO)
                                    Toast.makeText(context, "Playing audio guidance", Toast.LENGTH_SHORT).show()
                                },
                                shape = RoundedCornerShape(6.dp),
                                color = SafetyAmberSoft,
                                border = BorderStroke(1.dp, AmberBorder)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, tint = Amber800, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text("Listen", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Amber800)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = if (selectedLanguage == FeedbackLanguage.HINDI) {
                                "राजेश, बिना 4-गैस स्निफ़र टेस्ट के सम्प में मत उतरो! पहले O2, H2S और CH4 चेक करो और परमिट साइन कराओ।"
                            } else {
                                "ᱨᱟᱡᱮᱥ, ᱜᱮᱥ ᱴᱮᱥᱴ ᱵᱤᱱᱟ ᱛᱮ ᱥᱟᱢᱯ ᱨᱮ ᱟᱞᱚᱢ ᱯᱷᱮᱰᱚᱜ-ᱟ! ᱞᱟᱦᱟ ᱛᱮ O2 ᱟᱨ H2S ᱪᱮᱠ ᱢᱮ᱾"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimaryLight
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ==========================================
        // 5. REMEDIATION CARD ("Required Action" + "Retry Drill")
        // ==========================================
        Card(
            modifier = Modifier.fillMaxWidth().testTag("remediation_card"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = SafetyAmberSoft,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Refresh, contentDescription = null, tint = Amber800, modifier = Modifier.size(18.dp))
                            }
                        }

                        Spacer(modifier = Modifier.width(10.dp))

                        Column {
                            Text(
                                text = "Required Action:",
                                fontSize = 10.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = Amber800
                            )
                            Text(
                                text = "Complete 3-Minute Gas Detector Drill",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimaryLight
                            )
                        }
                    }

                    // "Retry Drill" Button
                    Button(
                        onClick = {
                            viewModel.setTab(AppTab.AR_SIMULATOR)
                            Toast.makeText(context, "Starting Remedial Gas Drill...", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = IndustrialAmber,
                            contentColor = TextPrimaryLight
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(34.dp).testTag("retry_drill_btn"),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Retry Drill", fontSize = 11.sp, fontWeight = FontWeight.Black)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(12.dp))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // ==========================================
        // 6. OFFLINE STATUS & VERIFIABLE QR CARD
        // ==========================================
        Card(
            modifier = Modifier.fillMaxWidth().testTag("offline_qr_card"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = IndustrialLightBg,
                        border = BorderStroke(1.dp, Slate200),
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(Icons.Default.QrCode, contentDescription = null, tint = Slate700, modifier = Modifier.size(22.dp))
                        }
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Provisional Offline Receipt",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimaryLight
                            )
                        }
                        Text(
                            text = "Status: Sync Pending ($pendingSyncCount unverified)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate500
                        )
                    }
                }

                // View QR Button
                OutlinedButton(
                    onClick = {
                        val state = assessmentState
                        if (state is AssessmentUiState.Success && state.certificate != null) {
                            viewModel.showCertificate(state.certificate)
                        } else {
                            viewModel.evaluateCurrentSession()
                            Toast.makeText(context, "Opening cryptographically signed QR certificate", Toast.LENGTH_SHORT).show()
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, Slate300),
                    modifier = Modifier.height(34.dp).testTag("view_qr_btn"),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
                ) {
                    Text("View QR", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate700)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}
