package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.WorkerEntity
import com.example.ui.components.RiskClassificationBadge
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.Amber800
import com.example.ui.theme.AmberBorder
import com.example.ui.theme.ArCyanBorder
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.ArCyanSoft
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightBg
import com.example.ui.theme.IndustrialLightBorder
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.Slate300
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.TextPrimaryLight
import com.example.ui.viewmodel.SurakshaViewModel

@Composable
fun WorkerRosterScreen(
    viewModel: SurakshaViewModel,
    modifier: Modifier = Modifier
) {
    val workers by viewModel.workerRoster.collectAsState()
    var selectedWorkerForDetails by remember { mutableStateOf<WorkerEntity?>(null) }
    var showAddWorkerDialog by remember { mutableStateOf(false) }

    if (showAddWorkerDialog) {
        AddWorkerDialog(
            onDismiss = { showAddWorkerDialog = false },
            onAdd = { name, trade, dept, lang ->
                viewModel.addNewWorker(name, trade, dept, lang)
                showAddWorkerDialog = false
            }
        )
    }

    selectedWorkerForDetails?.let { worker ->
        WorkerDetailsDialog(
            worker = worker,
            onDismiss = { selectedWorkerForDetails = null },
            onDepute = {
                viewModel.assignWorkerToActiveDrill(worker)
                selectedWorkerForDetails = null
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(IndustrialLightBg)
            .padding(16.dp)
            .testTag("worker_roster_screen")
    ) {
        // Title & Header Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "DGMS WORKER SAFETY ROSTER",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Amber800,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Competency Registry & Language Profiles",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimaryLight
                )
            }

            FilledTonalButton(
                onClick = { showAddWorkerDialog = true },
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = SafetyAmberSoft,
                    contentColor = Amber800
                ),
                border = BorderStroke(1.dp, AmberBorder),
                modifier = Modifier.testTag("add_worker_btn")
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add Worker", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            items(workers, key = { it.workerId }) { worker ->
                WorkerCard(
                    worker = worker,
                    onClick = { selectedWorkerForDetails = worker }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun WorkerCard(
    worker: WorkerEntity,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("worker_card_${worker.workerId}"),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = BorderStroke(1.dp, IndustrialLightBorder)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(SafetyAmberSoft),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Engineering,
                    contentDescription = null,
                    tint = Amber800,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = worker.name,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimaryLight
                    )
                    RiskClassificationBadge(risk = worker.lastRiskStatus)
                }

                Text(
                    text = "${worker.trade} • ${worker.department} (ID: ${worker.workerId})",
                    fontSize = 11.sp,
                    color = Slate600
                )

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = ArCyanSoft,
                        border = BorderStroke(1.dp, ArCyanBorder)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Language, contentDescription = null, tint = ArCyanDark, modifier = Modifier.size(10.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = when (worker.preferredLanguage) {
                                    "SANTALI_OL_CHIKI" -> "ᱥᱟᱱᱛᱟᱲᱤ (Santali Ol Chiki)"
                                    "HINDI" -> "हिंदी (Hindi)"
                                    else -> "English"
                                },
                                fontSize = 10.sp,
                                color = ArCyanDark,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Text(
                        text = "Drills: ${worker.passedDrills}/${worker.totalDrills} Passed",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (worker.totalDrills > 0 && worker.passedDrills == worker.totalDrills) PassGreenBold else AlertRedBold
                    )
                }
            }
        }
    }
}

@Composable
fun WorkerDetailsDialog(
    worker: WorkerEntity,
    onDismiss: () -> Unit,
    onDepute: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "WORKER SAFETY PROFILE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = IndustrialAmber,
                        letterSpacing = 1.sp
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate600)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(worker.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = TextPrimaryLight)
                Text("Trade: ${worker.trade}", fontSize = 13.sp, color = Slate700, fontWeight = FontWeight.Bold)
                Text("Department: ${worker.department}", fontSize = 12.sp, color = Slate600)
                Text("Site: ${worker.siteId} • ID: ${worker.workerId}", fontSize = 12.sp, color = Slate600)

                Spacer(modifier = Modifier.height(14.dp))

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = IndustrialLightBg,
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Drills Evaluated:", fontSize = 12.sp, color = Slate700)
                            Text("${worker.totalDrills}", fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Passed Drills:", fontSize = 12.sp, color = Slate700)
                            Text("${worker.passedDrills}", fontWeight = FontWeight.Bold, color = PassGreenBold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Current Risk Rating:", fontSize = 12.sp, color = Slate700)
                            RiskClassificationBadge(risk = worker.lastRiskStatus)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = onDepute,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = IndustrialAmber, contentColor = TextPrimaryLight),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = TextPrimaryLight, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("DEPUTE TO ACTIVE DRILL & TEST", fontWeight = FontWeight.Black, fontSize = 12.sp)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddWorkerDialog(
    onDismiss: () -> Unit,
    onAdd: (name: String, trade: String, dept: String, lang: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var trade by remember { mutableStateOf("") }
    var dept by remember { mutableStateOf("") }
    var lang by remember { mutableStateOf("HINDI") }
    var expandedLang by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "REGISTER NEW WORKER",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = IndustrialAmber,
                        letterSpacing = 1.sp
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate600)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Worker Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = IndustrialAmber,
                        unfocusedBorderColor = Slate300
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = trade,
                    onValueChange = { trade = it },
                    label = { Text("Trade / Role (e.g. Mechanic, Sirdar)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = IndustrialAmber,
                        unfocusedBorderColor = Slate300
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = dept,
                    onValueChange = { dept = it },
                    label = { Text("Department / Section") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = IndustrialAmber,
                        unfocusedBorderColor = Slate300
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                ExposedDropdownMenuBox(
                    expanded = expandedLang,
                    onExpandedChange = { expandedLang = !expandedLang }
                ) {
                    OutlinedTextField(
                        value = when (lang) {
                            "SANTALI_OL_CHIKI" -> "ᱥᱟᱱᱛᱟᱲᱤ (Santali Ol Chiki)"
                            "HINDI" -> "हिंदी (Hindi)"
                            else -> "English"
                        },
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Preferred Safety Audio Language") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedLang) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = IndustrialAmber,
                            unfocusedBorderColor = Slate300
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = expandedLang,
                        onDismissRequest = { expandedLang = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("हिंदी (Hindi Devanagari)") },
                            onClick = { lang = "HINDI"; expandedLang = false }
                        )
                        DropdownMenuItem(
                            text = { Text("ᱥᱟᱱᱛᱟᱲᱤ (Santali Ol Chiki)") },
                            onClick = { lang = "SANTALI_OL_CHIKI"; expandedLang = false }
                        )
                        DropdownMenuItem(
                            text = { Text("English") },
                            onClick = { lang = "ENGLISH"; expandedLang = false }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(onClick = onDismiss) {
                        Text("Cancel", color = Slate700)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank() && trade.isNotBlank()) {
                                onAdd(name, trade, dept.ifBlank { "General Mine Operations" }, lang)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = IndustrialAmber, contentColor = TextPrimaryLight)
                    ) {
                        Text("Save Worker", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
