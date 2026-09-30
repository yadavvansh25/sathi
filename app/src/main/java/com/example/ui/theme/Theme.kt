package com.example.ui.theme

import android.os.Build
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = IndustrialAmber,                // Industrial Amber / Orange (#D97706)
    onPrimary = Color.White,
    primaryContainer = SafetyAmberSoft,       // Soft Amber (#FEF3C7)
    onPrimaryContainer = Amber800,            // Dark Amber (#92400E)
    secondary = HazardOrangeDark,
    onSecondary = Color.White,
    secondaryContainer = HazardOrangeSoft,
    onSecondaryContainer = Color(0xFF7C2D12),
    tertiary = ArCyanDark,
    onTertiary = Color.White,
    tertiaryContainer = ArCyanSoft,
    onTertiaryContainer = ArCyanDark,
    background = IndustrialLightBg,           // Crisp Slate-50 (#F8FAFC)
    onBackground = TextPrimaryLight,          // Dark Slate (#0F172A)
    surface = IndustrialLightSurface,         // Pure White (#FFFFFF)
    onSurface = TextPrimaryLight,             // Dark Slate (#0F172A)
    surfaceVariant = IndustrialLightSurfaceVariant, // Slate-100 (#F1F5F9)
    onSurfaceVariant = TextSecondaryLight,    // Muted Slate (#475569)
    outline = IndustrialLightBorder,          // 1px Slate-200 (#E2E8F0)
    outlineVariant = Slate300,
    error = AlertRedBold,                     // Bold Red (#B91C1C)
    onError = Color.White,
    errorContainer = AlertRedSoft,            // Soft Red (#FEE2E2)
    onErrorContainer = AlertRedDark
)

private val DarkColorScheme = darkColorScheme(
    primary = SafetyAmber,
    onPrimary = Color(0xFF1E1B00),
    primaryContainer = SafetyAmberDark,
    onPrimaryContainer = SafetyAmberLight,
    secondary = HazardOrange,
    onSecondary = Color(0xFF2C0F00),
    secondaryContainer = HazardOrangeDark,
    onSecondaryContainer = Color(0xFFFFDBCF),
    tertiary = ArCyanGlow,
    onTertiary = Color(0xFF003549),
    tertiaryContainer = ArCyanDark,
    onTertiaryContainer = Color(0xFFC3E8FF),
    background = IndustrialDarkBg,
    onBackground = TextPrimaryDark,
    surface = IndustrialDarkSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = IndustrialDarkSurfaceVariant,
    onSurfaceVariant = TextSecondaryDark,
    outline = IndustrialDarkBorder,
    error = AlertRed,
    onError = Color.White,
    errorContainer = AlertRedContainer,
    onErrorContainer = Color(0xFFFFDAD6)
)

@Composable
fun SurakshaARTheme(
    darkTheme: Boolean = false, // Clean, high-contrast Industrial Light / White Theme by default
    dynamicColor: Boolean = false, // Keep consistent industrial safety styling
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
