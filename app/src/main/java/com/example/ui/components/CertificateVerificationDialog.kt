package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.CertificateEntity
import com.example.ui.theme.AlertRedBold
import com.example.ui.theme.AlertRedSoft
import com.example.ui.theme.ArCyanDark
import com.example.ui.theme.ArCyanSoft
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
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate700
import com.example.ui.theme.TextPrimaryLight
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun CertificateVerificationDialog(
    certificate: CertificateEntity,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val dateStr = SimpleDateFormat("dd MMM yyyy, HH:mm:ss", Locale.ENGLISH).format(Date(certificate.issuedAt))

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(4.dp)
                .testTag("certificate_verification_dialog"),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = IndustrialLightSurface),
            border = BorderStroke(1.dp, IndustrialLightBorder),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(scrollState)
            ) {
                // Header Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(SafetyAmberSoft, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = IndustrialAmber, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "PROVISIONAL SAFETY CERTIFICATE",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Black,
                                color = IndustrialAmber,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "DGMS & OSHA Competency",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate600
                            )
                        }
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate600)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Certificate Main Container (Industrial Certificate style)
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = IndustrialLightBg,
                    border = BorderStroke(1.dp, Slate200),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "MINING & INDUSTRIAL SAFETY CREDENTIAL",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate700,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = certificate.scenarioTitle,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimaryLight
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // Worker Metadata Box
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("WORKER NAME", fontSize = 10.sp, color = Slate600, fontWeight = FontWeight.Bold)
                                Text(certificate.workerName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("WORKER ID", fontSize = 10.sp, color = Slate600, fontWeight = FontWeight.Bold)
                                Text(certificate.workerId, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Status & QR Code Canvas
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (certificate.status == "VERIFIED") PassGreenSoft else SafetyAmberSoft,
                                    border = BorderStroke(1.dp, if (certificate.status == "VERIFIED") PassGreenBorder else Slate300)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = if (certificate.status == "VERIFIED") PassGreenBold else IndustrialAmber,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "STATUS: ${certificate.status}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            color = if (certificate.status == "VERIFIED") PassGreenBold else IndustrialAmber
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))
                                Text("ISSUED AT", fontSize = 10.sp, color = Slate600, fontWeight = FontWeight.Bold)
                                Text(dateStr, fontSize = 11.sp, color = TextPrimaryLight)
                            }

                            // Deterministic QR Code Canvas
                            Box(
                                modifier = Modifier
                                    .size(92.dp)
                                    .background(Color.White, RoundedCornerShape(6.dp))
                                    .padding(4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Canvas(modifier = Modifier.size(84.dp)) {
                                    val sizePx = size.width
                                    val matrixSize = 21
                                    val cellSize = sizePx / matrixSize
                                    val hashBytes = certificate.qrHash.toByteArray()

                                    // Render QR Matrix from hash
                                    for (row in 0 until matrixSize) {
                                        for (col in 0 until matrixSize) {
                                            // Finder patterns at corners
                                            val isFinder = (row < 7 && col < 7) || (row < 7 && col >= matrixSize - 7) || (row >= matrixSize - 7 && col < 7)
                                            val isBlack = if (isFinder) {
                                                val r = if (row >= matrixSize - 7) row - (matrixSize - 7) else row
                                                val c = if (col >= matrixSize - 7) col - (matrixSize - 7) else col
                                                (r == 0 || r == 6 || c == 0 || c == 6) || (r in 2..4 && c in 2..4)
                                            } else {
                                                val byteIdx = (row * matrixSize + col) % hashBytes.size
                                                (hashBytes[byteIdx].toInt() + row + col) % 2 == 0
                                            }

                                            if (isBlack) {
                                                drawRect(
                                                    color = Color(0xFF0F172A),
                                                    topLeft = Offset(col * cellSize, row * cellSize),
                                                    size = Size(cellSize, cellSize)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = Slate200)
                        Spacer(modifier = Modifier.height(8.dp))

                        // Certificate ID & Cryptographic Hashes
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text("CERTIFICATE ID:", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Slate600)
                            Text(certificate.certificateId, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextPrimaryLight)

                            Spacer(modifier = Modifier.height(4.dp))
                            Text("SHA-256 SIGNATURE HASH:", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Slate600)
                            Text(
                                certificate.signatureHash.take(28) + "...",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Slate700
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Simulated Web Verification Endpoint (/verify-cert/:id)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = ArCyanSoft,
                    border = BorderStroke(1.dp, ArCyanDark.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = ArCyanDark, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "OFFICIAL VERIFICATION ENDPOINT",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ArCyanDark
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = certificate.verificationUrl,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = ArCyanDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("SurakshaAR Certificate URL", certificate.verificationUrl)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Verification URL copied!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.testTag("copy_cert_url_btn")
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Copy Link")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = onDismiss,
                        colors = ButtonDefaults.buttonColors(containerColor = IndustrialAmber, contentColor = TextPrimaryLight)
                    ) {
                        Text("Done", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
