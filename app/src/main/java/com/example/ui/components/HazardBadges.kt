package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.AlertRedBorder
import com.example.ui.theme.AlertRedSoft
import com.example.ui.theme.Amber800
import com.example.ui.theme.AmberBorderDark
import com.example.ui.theme.ArCyanBorder
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.ArCyanSoft
import com.example.ui.theme.PassGreenBold
import com.example.ui.theme.PassGreenBorder
import com.example.ui.theme.PassGreenSoft
import com.example.ui.theme.SafetyAmberSoft
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate700

/**
 * VerdictBadge:
 * FAIL: Soft red background (#FEE2E2) with bold red text (#B91C1C) and red-200 border (#FECACA).
 * PASS: Soft green background (#DCFCE7) with bold green text (#15803D) and green-200 border (#BBF7D0).
 * Guaranteed horizontal text with non-wrapping layout.
 */
@Composable
fun VerdictBadge(verdict: String, modifier: Modifier = Modifier) {
    val isPass = verdict.equals("PASS", ignoreCase = true)
    val bgColor = if (isPass) PassGreenSoft else AlertRedSoft
    val borderColor = if (isPass) PassGreenBorder else AlertRedBorder
    val textColor = if (isPass) PassGreenBold else AlertRedBold
    val icon = if (isPass) Icons.Default.CheckCircle else Icons.Default.Warning

    Surface(
        modifier = modifier.testTag("verdict_badge_${verdict.lowercase()}"),
        shape = RoundedCornerShape(10.dp),
        color = bgColor,
        border = BorderStroke(1.dp, borderColor),
        shadowElevation = 0.5.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = if (isPass) "VERDICT: PASS" else "VERDICT: FAIL",
                color = textColor,
                fontWeight = FontWeight.Black,
                fontSize = 12.sp,
                letterSpacing = 0.5.sp,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * MasteryStatusBadge:
 * "NOT_MASTERED" Pill: Slate-100 background (#F1F5F9) with dark slate-700 text (#334155).
 * "MASTERED" Pill: Soft green background (#DCFCE7) with bold green text (#15803D).
 * Guaranteed horizontal text with non-wrapping layout.
 */
@Composable
fun MasteryStatusBadge(masteryStatus: String, modifier: Modifier = Modifier) {
    val isMastered = masteryStatus.equals("MASTERED", ignoreCase = true)
    val bgColor = if (isMastered) PassGreenSoft else Slate100
    val borderColor = if (isMastered) PassGreenBorder else Slate300
    val textColor = if (isMastered) PassGreenBold else Slate700
    val icon = if (isMastered) Icons.Default.CheckCircle else Icons.Default.Cancel

    Surface(
        modifier = modifier.testTag("mastery_status_badge_${masteryStatus.lowercase()}"),
        shape = RoundedCornerShape(10.dp),
        color = bgColor,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = if (isMastered) "MASTERED" else "NOT_MASTERED",
                color = textColor,
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                letterSpacing = 0.5.sp,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * ExecutionModeBadge:
 * Mode Tag ("2D_FALLBACK_MODE"): Soft amber background (#FEF3C7) with dark amber border (#D97706) and amber-800 text (#92400E).
 * Mode Tag ("AR_MODE"): Soft cyan background (#E0F2FE) with dark cyan border (#0284C7) and cyan-800 text (#0369A1).
 */
@Composable
fun ExecutionModeBadge(
    mode: String,
    modifier: Modifier = Modifier,
    fullWidth: Boolean = false
) {
    val isAr = mode.equals("AR_MODE", ignoreCase = true)
    val bgColor = if (isAr) ArCyanSoft else SafetyAmberSoft
    val borderColor = if (isAr) ArCyanBorder else AmberBorderDark
    val textColor = if (isAr) ArCyanDark else Amber800
    val label = if (isAr) "AR_MODE (Spatial AR Enabled)" else "2D_FALLBACK_MODE (Interactive Decision Canvas)"
    val icon = if (isAr) Icons.Default.ViewInAr else Icons.Default.Visibility

    Surface(
        modifier = modifier
            .then(if (fullWidth) Modifier.fillMaxWidth() else Modifier)
            .testTag("mode_badge_${mode.lowercase()}"),
        shape = RoundedCornerShape(8.dp),
        color = bgColor,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = if (fullWidth) 12.dp else 8.dp, vertical = if (fullWidth) 8.dp else 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = if (fullWidth) Arrangement.Center else Arrangement.Start
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                color = textColor,
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * RiskClassificationBadge:
 * High contrast industrial risk level indicator. Guaranteed single-line, strictly horizontal.
 */
@Composable
fun RiskClassificationBadge(risk: String, modifier: Modifier = Modifier) {
    val upper = risk.uppercase()
    val (bgColor, borderColor, textColor) = when (upper) {
        "CRITICAL" -> Triple(AlertRedSoft, AlertRedBorder, AlertRedBold)
        "MEDIUM" -> Triple(SafetyAmberSoft, AmberBorderDark, Amber800)
        else -> Triple(PassGreenSoft, PassGreenBorder, PassGreenBold)
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alphaAnim by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Surface(
        modifier = modifier.testTag("risk_badge_${upper.lowercase()}"),
        shape = RoundedCornerShape(10.dp),
        color = bgColor,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(textColor)
                    .then(if (upper == "CRITICAL") Modifier.alpha(alphaAnim) else Modifier)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = "RISK: $upper",
                color = textColor,
                fontWeight = FontWeight.Black,
                fontSize = 11.sp,
                letterSpacing = 0.5.sp,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

/**
 * ComplianceTag:
 * Clean regulatory compliance pill tag for DGMS / OSHA
 */
@Composable
fun ComplianceTag(label: String, isCompliant: Boolean, modifier: Modifier = Modifier) {
    val bgColor = if (isCompliant) PassGreenSoft else AlertRedSoft
    val borderColor = if (isCompliant) PassGreenBorder else AlertRedBorder
    val textColor = if (isCompliant) PassGreenBold else AlertRedBold

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = bgColor,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(textColor)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = label,
                color = textColor,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                softWrap = false
            )
        }
    }
}
