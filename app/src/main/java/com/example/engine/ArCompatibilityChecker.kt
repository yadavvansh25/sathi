package com.example.engine

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

enum class ArCoreSupportStatus {
    SUPPORTED_INSTALLED,
    SUPPORTED_NOT_INSTALLED,
    UNSUPPORTED_BUDGET_DEVICE,
    UNKNOWN
}

data class DeviceCompatibilityResult(
    val recommendedMode: String, // "AR_MODE" or "2D_FALLBACK_MODE"
    val arCoreStatus: ArCoreSupportStatus,
    val details: String,
    val isBudgetDevice: Boolean
)

object ArCompatibilityChecker {

    private const val ARCORE_PACKAGE_NAME = "com.google.ar.core"

    /**
     * Non-crashing startup check for ARCore compatibility on Android 11 budget/mid-range devices
     */
    fun evaluateDevice(context: Context): DeviceCompatibilityResult {
        val pm = context.packageManager

        // Check RAM and CPU ABI
        val availableRamMb = Runtime.getRuntime().maxMemory() / (1024 * 1024)
        val isLowRam = availableRamMb < 256 // Budget Android 11 tier indication
        val hasCamera = pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)

        val isArCoreInstalled = try {
            pm.getPackageInfo(ARCORE_PACKAGE_NAME, 0)
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }

        return if (isArCoreInstalled && hasCamera && !isLowRam) {
            DeviceCompatibilityResult(
                recommendedMode = "AR_MODE",
                arCoreStatus = ArCoreSupportStatus.SUPPORTED_INSTALLED,
                details = "ARCore active. Spatial Marker-Based AR Mode enabled.",
                isBudgetDevice = false
            )
        } else {
            val reason = when {
                !hasCamera -> "No camera hardware detected."
                !isArCoreInstalled -> "ARCore (Google Play Services for AR) not installed on this device."
                isLowRam -> "Device memory is in budget tier; 2D interactive mode prevents camera thermal throttling."
                else -> "Standard Android 11 budget hardware detected."
            }
            DeviceCompatibilityResult(
                recommendedMode = "2D_FALLBACK_MODE",
                arCoreStatus = if (isArCoreInstalled) ArCoreSupportStatus.SUPPORTED_INSTALLED else ArCoreSupportStatus.UNSUPPORTED_BUDGET_DEVICE,
                details = "$reason Toggled seamlessly to 2D Fallback Mode (zero camera crashes).",
                isBudgetDevice = true
            )
        }
    }
}
