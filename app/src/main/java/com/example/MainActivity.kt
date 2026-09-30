package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AssignmentTurnedIn
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.screens.ArSimulationScreen
import com.example.ui.screens.AssessmentScreen
import com.example.ui.screens.ComplianceLogsScreen
import com.example.ui.screens.WorkerRosterScreen
import com.example.ui.theme.IndustrialAmber
import com.example.ui.theme.IndustrialLightSurface
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.SurakshaARTheme
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.SurakshaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: SurakshaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Clean, high-contrast Industrial Light / White Theme
            SurakshaARTheme(darkTheme = false) {
                MainAppContent(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppContent(viewModel: SurakshaViewModel) {
    val currentTab by viewModel.currentTab.collectAsState()

    // BackHandler to return to Assessment home screen if on secondary tab
    BackHandler(enabled = currentTab != AppTab.ASSESSMENT) {
        viewModel.setTab(AppTab.ASSESSMENT)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            // Bottom Navigation: Pure white background (#FFFFFF) with a top border (#E2E8F0)
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding(),
                color = IndustrialLightSurface,
                border = BorderStroke(1.dp, Slate200),
                shadowElevation = 6.dp
            ) {
                NavigationBar(
                    containerColor = IndustrialLightSurface,
                    tonalElevation = 0.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp)
                        .testTag("bottom_nav_bar")
                ) {
                    val navItemColors = NavigationBarItemDefaults.colors(
                        selectedIconColor = IndustrialAmber, // Highlighted in industrial amber/orange (#D97706)
                        selectedTextColor = IndustrialAmber,
                        unselectedIconColor = Slate400,     // Inactive icons in slate-400
                        unselectedTextColor = Slate400,
                        indicatorColor = SafetyAmberSoft    // Soft amber background
                    )

                    NavigationBarItem(
                        selected = currentTab == AppTab.ASSESSMENT,
                        onClick = { viewModel.setTab(AppTab.ASSESSMENT) },
                        icon = { Icon(Icons.Default.Psychology, contentDescription = "Remediation Engine") },
                        label = { Text("Engine", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_assessment")
                    )

                    NavigationBarItem(
                        selected = currentTab == AppTab.AR_SIMULATOR,
                        onClick = { viewModel.setTab(AppTab.AR_SIMULATOR) },
                        icon = { Icon(Icons.Default.ViewInAr, contentDescription = "AR Simulator") },
                        label = { Text("AR Drill", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_ar_simulator")
                    )

                    NavigationBarItem(
                        selected = currentTab == AppTab.COMPLIANCE_LOGS,
                        onClick = { viewModel.setTab(AppTab.COMPLIANCE_LOGS) },
                        icon = { Icon(Icons.Default.AssignmentTurnedIn, contentDescription = "Compliance Logs") },
                        label = { Text("Logs", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_compliance_logs")
                    )

                    NavigationBarItem(
                        selected = currentTab == AppTab.WORKER_ROSTER,
                        onClick = { viewModel.setTab(AppTab.WORKER_ROSTER) },
                        icon = { Icon(Icons.Default.Engineering, contentDescription = "Worker Roster") },
                        label = { Text("Roster", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = navItemColors,
                        modifier = Modifier.testTag("nav_tab_worker_roster")
                    )
                }
            }
        }
    ) { innerPadding ->
        when (currentTab) {
            AppTab.ASSESSMENT -> AssessmentScreen(viewModel = viewModel, modifier = Modifier.padding(innerPadding))
            AppTab.AR_SIMULATOR -> ArSimulationScreen(viewModel = viewModel, modifier = Modifier.padding(innerPadding))
            AppTab.COMPLIANCE_LOGS -> ComplianceLogsScreen(viewModel = viewModel, modifier = Modifier.padding(innerPadding))
            AppTab.WORKER_ROSTER -> WorkerRosterScreen(viewModel = viewModel, modifier = Modifier.padding(innerPadding))
        }
    }
}
