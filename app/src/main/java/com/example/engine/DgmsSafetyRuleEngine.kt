package com.example.engine

import com.example.data.model.AssessmentResult
import com.example.data.model.CriticalViolation
import com.example.data.model.ReDrillStep
import com.example.data.model.RegulatoryCompliance
import com.example.data.model.SimulationDrillSession
import com.example.data.model.ThreeMinuteReDrill
import com.example.data.model.WorkerFeedback
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object DgmsSafetyRuleEngine {

    fun evaluate(session: SimulationDrillSession): AssessmentResult {
        val criticalViolations = mutableListOf<CriticalViolation>()
        val events = session.events
        val eventTypes = events.map { it.eventType.uppercase() }

        // Category-specific evaluation
        when (session.category.uppercase()) {
            "CONFINED_SPACE" -> {
                evaluateConfinedSpace(events, eventTypes, criticalViolations)
            }
            "FIRE_EVACUATION" -> {
                evaluateFireEvacuation(events, eventTypes, criticalViolations)
            }
            "ELECTRICAL_LOTO" -> {
                evaluateElectricalLoto(events, eventTypes, criticalViolations)
            }
            "MINE_STRATA" -> {
                evaluateMineStrata(events, eventTypes, criticalViolations)
            }
            "HEMM_HAUL_ROAD" -> {
                evaluateHaulRoad(events, eventTypes, criticalViolations)
            }
            else -> {
                evaluateGenericIndustrial(events, eventTypes, criticalViolations)
            }
        }

        // Global Safety Checks across any drill: Blocked exits during emergency
        val movedTowardsBlockedExit = events.any {
            it.eventType.contains("BLOCKED_EXIT", ignoreCase = true) ||
            it.hazardType.contains("BLOCKED_EXIT", ignoreCase = true) ||
            it.details.contains("BLOCKED EXIT", ignoreCase = true)
        }
        if (movedTowardsBlockedExit && criticalViolations.none { it.hazardType == "FIRE_BLOCKED_EXIT_TRAP" }) {
            criticalViolations.add(
                CriticalViolation(
                    ruleCode = "DGMS-CMR-2017-R139 / OSHA-1910.36",
                    description = "Worker headed into smoke-engulfed corridor marked as BLOCKED EXIT during emergency evacuation.",
                    hazardType = "FIRE_BLOCKED_EXIT_TRAP"
                )
            )
        }

        // Global Confined Space check
        val enteredDangerZone = events.any {
            it.eventType.contains("ENTRY", ignoreCase = true) ||
            it.eventType.contains("STEPPED", ignoreCase = true)
        }
        val hasGasTesting = events.any {
            it.eventType.contains("GAS", ignoreCase = true) &&
            !it.eventType.contains("OMITTED", ignoreCase = true) &&
            !it.eventType.contains("SKIPPED", ignoreCase = true)
        }
        val omittedGas = events.any {
            it.eventType.contains("GAS_TESTING_OMITTED", ignoreCase = true) ||
            it.eventType.contains("GAS_TEST_SKIPPED", ignoreCase = true)
        }

        if (session.category.uppercase() == "CONFINED_SPACE" && (omittedGas || !hasGasTesting) && enteredDangerZone) {
            if (criticalViolations.none { it.hazardType == "TOXIC_ATMOSPHERE_ASPHYXIATION" }) {
                criticalViolations.add(
                    CriticalViolation(
                        ruleCode = "DGMS-CMR-2017-R153 / OSHA-1910.146(d)(5)",
                        description = "Entered confined space chamber without mandatory 4-gas atmospheric testing (O2, CO, H2S, CH4).",
                        hazardType = "TOXIC_ATMOSPHERE_ASPHYXIATION"
                    )
                )
            }
        }

        val hasCritical = criticalViolations.isNotEmpty()
        val verdict: String
        val masteryStatus: String
        val riskClassification: String
        val finalScore: Int

        if (hasCritical) {
            // OPERATING RULE 1:
            // Immediate and non-negotiable "FAIL" and "NOT_MASTERED" status, regardless of reaction time or points scored.
            verdict = "FAIL"
            masteryStatus = "NOT_MASTERED"
            riskClassification = "CRITICAL"
            val rawCalc = 100 - (criticalViolations.size * 30) - (events.count { it.hazardType.contains("VIOLATION", true) } * 10)
            finalScore = rawCalc.coerceIn(15, 45) // Strictly capped as Fail (<50)
        } else {
            val marginalInfractions = events.filter {
                it.eventType.contains("BLIND_SPOT", true) ||
                it.eventType.contains("MARGINAL", true) ||
                it.details.contains("MARGINAL", true)
            }
            if (marginalInfractions.isNotEmpty()) {
                verdict = "FAIL"
                masteryStatus = "NOT_MASTERED"
                riskClassification = "MEDIUM"
                finalScore = (85 - (marginalInfractions.size * 15)).coerceIn(55, 68)
            } else {
                verdict = "PASS"
                masteryStatus = "MASTERED"
                riskClassification = "LOW"
                val ppeChecked = events.any { it.eventType.contains("PPE", true) || it.eventType.contains("SCSR", true) }
                val buddyActive = events.any { it.eventType.contains("BUDDY", true) || it.eventType.contains("RADIO", true) }
                finalScore = (90 + (if (ppeChecked) 5 else 0) + (if (buddyActive) 5 else 0)).coerceIn(88, 98)
            }
        }

        val feedback = generateWorkerFeedback(session, verdict, riskClassification, criticalViolations)
        val reDrill = generateThreeMinuteReDrill(session, criticalViolations, riskClassification)
        val compliance = generateRegulatoryCompliance(session, hasCritical, riskClassification)

        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        return AssessmentResult(
            verdict = verdict,
            masteryStatus = masteryStatus,
            executionMode = session.executionMode,
            riskClassification = riskClassification,
            score = finalScore,
            criticalViolationDetected = hasCritical,
            criticalViolations = criticalViolations,
            workerFeedback = feedback,
            threeMinuteReDrill = reDrill,
            regulatoryCompliance = compliance,
            evaluatedAt = isoFormat.format(Date()),
            engineMode = "DGMS_DETERMINISTIC_RULES"
        )
    }

    private fun evaluateFireEvacuation(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        val movedToBlockedExit = events.any {
            it.eventType.contains("MOVED_TOWARD_BLOCKED_EXIT") ||
            it.hazardType.contains("BLOCKED_EXIT") ||
            it.details.contains("BLOCKED EXIT", ignoreCase = true)
        }
        if (movedToBlockedExit) {
            violations.add(
                CriticalViolation(
                    ruleCode = "DGMS-CMR-2017-R139 / OSHA-1910.36",
                    description = "Fled toward smoke-engulfed blocked exit gallery ignoring emergency evacuation lifeline toward intake shaft.",
                    hazardType = "FIRE_BLOCKED_EXIT_TRAP"
                )
            )
        }
    }

    private fun evaluateConfinedSpace(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        if (eventTypes.any { it.contains("GAS_TESTING_OMITTED") } || !eventTypes.any { it.contains("GAS") }) {
            violations.add(
                CriticalViolation(
                    ruleCode = "DGMS-CMR-2017-R153 / OSHA-1910.146(d)(5)",
                    description = "Confined space entered without atmospheric testing for oxygen deficiency (O2 < 19.5%) and flammable/toxic gases (CH4, H2S, CO).",
                    hazardType = "TOXIC_ATMOSPHERE_ASPHYXIATION"
                )
            )
        }
        if (eventTypes.any { it.contains("PERMIT_TO_WORK_SKIPPED") || it.contains("PTW_SKIPPED") }) {
            violations.add(
                CriticalViolation(
                    ruleCode = "DGMS-CIRCULAR-02-2019 / OSHA-1910.146(d)(2)",
                    description = "Permit-To-Work (PTW) authorization bypassed prior to opening manhole and descending into chamber.",
                    hazardType = "STATUTORY_PERMIT_BREACH"
                )
            )
        }
        if (eventTypes.any { it.contains("STANDBY_BUDDY_ABSENT") || it.contains("NO_BUDDY") }) {
            violations.add(
                CriticalViolation(
                    ruleCode = "DGMS-TECH-CIRCULAR-02-2019 / OSHA-1910.146(d)(9)",
                    description = "Zero standby safety attendant (buddy) stationed at manhole opening with mechanical retrieval winch and communication line.",
                    hazardType = "BUDDY_SAFETY_PROTOCOL"
                )
            )
        }
    }

    private fun evaluateElectricalLoto(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        if (eventTypes.any { it.contains("ZERO_ENERGY_TEST_SKIPPED") || it.contains("VOLTAGE_TEST_SKIPPED") }) {
            violations.add(
                CriticalViolation(
                    ruleCode = "CEA-REG-2010-R30 / OSHA-1910.147(d)(6)",
                    description = "Absence of Live-Dead-Live zero-energy verification before physical tool approach towards 11kV busbar spouts.",
                    hazardType = "ELECTROCUTION_STORED_ENERGY"
                )
            )
        }
        if (eventTypes.any { it.contains("PHYSICAL_PADLOCK_OMITTED") || it.contains("LOCKOUT_OMITTED") }) {
            violations.add(
                CriticalViolation(
                    ruleCode = "CEA-REG-2010 / OSHA-1910.147(c)(5)",
                    description = "Mechanical shutter mechanism not locked out with individualized safety padlock and danger tag.",
                    hazardType = "UNAUTHORIZED_RE_ENERGIZATION"
                )
            )
        }
    }

    private fun evaluateMineStrata(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        val soundedTest = eventTypes.any { it.contains("SOUNDING") }
        if (!soundedTest) {
            violations.add(
                CriticalViolation(
                    ruleCode = "DGMS-CMR-2017-R123",
                    description = "Freshly exposed coal face entered without systematic strata sounding rod tapping test for loose roof stone.",
                    hazardType = "STRATA_ROOF_FALL"
                )
            )
        }
    }

    private fun evaluateHaulRoad(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        val blindSpot = events.any { it.eventType.contains("BLIND_SPOT", true) }
        val dwellTime = events.firstOrNull { it.eventType.contains("BLIND_SPOT", true) }?.parameters?.get("dwell_time_seconds")?.toIntOrNull() ?: 0
        if (blindSpot && dwellTime > 5) {
            val hasRadio = events.any { it.eventType.contains("RADIO", true) }
            if (!hasRadio) {
                violations.add(
                    CriticalViolation(
                        ruleCode = "DGMS-CIRCULAR-05-2016",
                        description = "Pedestrian worker remained inside 12m reversing blind spot of 100-ton dumper without radio horn acknowledgment.",
                        hazardType = "HEMM_BLIND_SPOT_CRUSH"
                    )
                )
            }
        }
    }

    private fun evaluateGenericIndustrial(
        events: List<com.example.data.model.SimulationEvent>,
        eventTypes: List<String>,
        violations: MutableList<CriticalViolation>
    ) {
        val hasViolations = events.any { it.hazardType.contains("VIOLATION", true) }
        if (hasViolations) {
            violations.add(
                CriticalViolation(
                    ruleCode = "OSHA-1910-GENERAL",
                    description = "Safety boundary bypass detected in operational industrial zone.",
                    hazardType = "PHYSICAL_TRAUMA_HAZARD"
                )
            )
        }
    }

    private fun generateWorkerFeedback(
        session: SimulationDrillSession,
        verdict: String,
        risk: String,
        violations: MutableList<CriticalViolation>
    ): WorkerFeedback {
        val worker = session.workerName
        return when {
            session.category.uppercase() == "FIRE_EVACUATION" && verdict == "FAIL" -> {
                WorkerFeedback(
                    hindi = "साथी $worker, ध्यान से सुनो। तुमने सेल्फ-रेस्क्यूअर बहुत तेजी से पहना, यह बहुत अच्छी बात थी। लेकिन आग और धुएं के समय बंद रास्ते की तरफ भागना जानलेवा गलती है। लाल बत्ती वाले रास्ते में धुआं और जहरीली गैस भरी थी। हमेशा जीवन-रक्षक रस्सी (लाइफ-लाइन) पकड़कर सुरक्षित हवा वाले रास्ते से बाहर निकलो। चलो, अब 3 मिनट का सुरक्षित निकासी अभ्यास करते हैं।",
                    english = "Brother $worker, listen carefully. Your speed in donning the self-rescuer was excellent. However, running towards a blocked exit during an underground fire is a fatal mistake. The blocked corridor was full of smoke and deadly carbon monoxide. Always grasp the intake lifeline and move towards the designated fresh air shaft. Let us practice the 3-minute escape re-drill now.",
                    olChikiSantali = "ᱡᱚᱦᱟᱨ ᱜᱚᱢᱠᱮ $worker! ᱥᱮᱞᱯᱷ-ᱨᱮᱥᱠᱤᱣᱟᱨ ᱟᱹᱰᱤ ᱞᱚᱜᱚᱱ ᱮᱢ ᱦᱚᱨᱚᱜ ᱠᱮᱫᱟ, ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ᱾ ᱢᱮᱱᱠᱷᱟᱱ ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱫᱷᱩᱶᱟᱹ ᱚᱠᱛᱚ ᱵᱚᱸᱫᱽ ᱰᱟᱦᱟᱨ ᱛᱮ ᱟᱞᱚᱢ ᱫᱟᱹᱲᱟ᱾ ᱡᱤᱣᱤ-ᱫᱚᱦᱚ ᱫᱟᱣᱲᱟ (ᱞᱟᱭᱤᱯᱷ-ᱞᱟᱭᱤᱱ) ᱥᱟᱵ ᱠᱟᱛᱮ ᱜᱮ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱢᱮ᱾ ᱱᱤᱛᱚᱜ ᱜᱮ ᱓ ᱢᱤᱱᱤᱴ ᱨᱮᱱᱟᱜ ᱨᱤ-ᱰᱨᱤᱞ ᱵᱚᱱ ᱠᱚᱨᱟᱣᱟ᱾",
                    santaliLatin = "Johar gomke $worker! Self-rescuer aḍi logon em horog keda, aḍi napay. Menkhan seṅgel ar dhūāñ okto bond dahar te alom daṛa. Jiwi-doho dawṛa (lifeline) sab kate ge bahre oḍokog me. Nitog ge 3 minute reak re-drill bon korawa."
                )
            }
            verdict == "FAIL" && risk == "CRITICAL" -> {
                WorkerFeedback(
                    hindi = "साथी $worker, ध्यान से सुनो। तुमने हेलमेट और बूट्स तो ठीक पहने, पर बिना गैस जांचे और बिना साथी के गड्ढे में उतरना जानलेवा है। गड्ढे में जहरीली गैस बिना महक के हो सकती है। जिंदगी से बढ़कर कोई काम नहीं है। अब हम तुरंत 3 मिनट का गैस जांच और साथी के साथ तालमेल का अभ्यास करेंगे।",
                    english = "Brother $worker, listen carefully. Wearing your helmet and boots is good, but descending into a sump without gas testing and without a standby buddy is life-threatening. Deadly gases have no smell. Nothing is worth risking your life. Let us immediately do a 3-minute physical re-drill on gas testing and buddy procedure.",
                    olChikiSantali = "ᱡᱚᱦᱟᱨ ᱜᱚᱢᱠᱮ $worker! ᱦᱮᱞᱢᱮᱴ ᱟᱨ ᱵᱩᱴ ᱫᱚᱢ ᱦᱚᱨᱚᱜ ᱞᱮᱫ ᱜᱮᱭᱟ, ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ᱾ ᱢᱮᱱᱠᱷᱟᱱ ᱜᱮᱥ ᱴᱮᱥᱴ ᱵᱟᱝ ᱠᱟᱛᱮ ᱟᱨ ᱜᱟᱛᱮ ᱵᱟᱹᱱᱩᱜ ᱛᱮ ᱞᱟᱛᱟᱨ ᱟᱞᱚᱢ ᱵᱚᱞᱚᱱᱟ᱾ ᱱᱚᱶᱟ ᱫᱚ ᱟᱹᱰᱤ ᱵᱚᱛᱚᱨᱟᱱ ᱠᱟᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱜᱮ ᱓ ᱢᱤᱱᱤᱴ ᱨᱮᱱᱟᱜ ᱨᱤ-ᱰᱨᱤᱞ ᱵᱚᱱ ᱠᱚᱨᱟᱣᱟ᱾",
                    santaliLatin = "Johar gomke $worker! Helmet ar boot dom horog led geya, aḍi napay. Menkhan gas test baṅ kate ar gate ba'nug te latar alom bolona. Nōā do aḍi botoran kana. Nitog ge 3 minute reak re-drill bon korawa."
                )
            }
            verdict == "FAIL" && risk == "MEDIUM" -> {
                WorkerFeedback(
                    hindi = "साथी $worker, तुम्हारा काम काफी हद तक ठीक था। लेकिन भारी डंपर के ठीक पीछे खड़ा रहना खतरनाक है। ड्राइवर को तुम शीशे में नहीं दिखते। हमेशा याद रखो: कम से कम 30 मीटर दूर रहो और पहले हॉर्न या रेडियो से बात करो।",
                    english = "Brother $worker, your preparation was decent. However, standing in the dumper's rear blind spot is dangerous. The operator cannot see you in the mirrors. Always remember: stay at least 30 meters clear and communicate via horn or radio first.",
                    olChikiSantali = "ᱜᱚᱢᱠᱮ $worker, ᱰᱟᱢᱯᱟᱨ ᱛᱟᱭᱚᱢ ᱨᱮ ᱟᱞᱚᱢ ᱛᱤᱸᱜᱩᱱᱟ᱾ ᱰᱨᱟᱭᱵᱷᱚᱨ ᱵᱟᱭ ᱧᱮᱞ ᱧᱟᱢᱮᱫ ᱢᱮᱭᱟ᱾ ᱓᱐ ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ ᱟᱨ ᱨᱮᱰᱤᱭᱳ ᱛᱮ ᱠᱟᱛᱷᱟ ᱞᱟᱹᱭ ᱢᱮ᱾",
                    santaliLatin = "Gomke $worker, dumper tayom re alom tiṅguna. Driver bay nel named meya. 30 meter saṅgiñ re tahen me ar radio te katha lay me."
                )
            }
            else -> {
                WorkerFeedback(
                    hindi = "शाबाश साथी $worker! तुमने सरकारी सुरक्षा नियमों के अनुसार गैस की जांच की, छत को रॉड से ठोककर परखा और साथी के साथ तालमेल रखा। इसी तरह सावधानी से काम करो ताकि तुम और तुम्हारे साथी हमेशा सही-सलामत घर लौटें।",
                    english = "Well done brother $worker! You followed the safety regulations by checking for gas, testing the roof strata with a sounding rod, and keeping contact with your buddy. Work safely so you and your team always return home safe.",
                    olChikiSantali = "ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ $worker! ᱟᱢ ᱜᱮᱥ ᱴᱮᱥᱴ, ᱪᱷᱟᱛ ᱨᱮᱱᱟᱜ ᱥᱟᱣᱩᱱᱰᱤᱝ ᱴᱮᱥᱴ ᱟᱨ ᱜᱟᱛᱮ ᱥᱟᱶ ᱱᱟᱯᱟᱭ ᱛᱮᱢ ᱠᱟᱹᱢᱤ ᱠᱮᱫᱟ᱾ ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱥᱩᱨᱚᱠᱷᱤᱛ ᱰᱟᱦᱟᱨ ᱱᱚᱶᱟ ᱜᱮ ᱠᱟᱱᱟ᱾",
                    santaliLatin = "Aḍi napay $worker! Am gas test, chhat reak sounding test ar gate saw napay tem kami keda. Joto khon surakhit dahar nōā ge kana."
                )
            }
        }
    }

    private fun generateThreeMinuteReDrill(
        session: SimulationDrillSession,
        violations: MutableList<CriticalViolation>,
        risk: String
    ): ThreeMinuteReDrill {
        return when (session.category.uppercase()) {
            "FIRE_EVACUATION" -> {
                ThreeMinuteReDrill(
                    drillTitle = "3-Minute Lifeline Blindfold Escape Re-drill",
                    objective = "Train involuntary physical tactile habit: Grip intake lifeline cone markers and walk away from smoke barriers.",
                    steps = listOf(
                        ReDrillStep(
                            minute = "00:00 - 01:00",
                            action = "Don training SCSR breathing apparatus. Secure nose clip and mouth bit with teeth. Confirm airtight seal within 15 seconds.",
                            physicalFocus = "Rapid tactile donning & airtight seal verification."
                        ),
                        ReDrillStep(
                            minute = "01:00 - 02:00",
                            action = "Locate suspended reflective intake lifeline with bare hands. Feel directional cones pointing away from fire toward fresh air shaft.",
                            physicalFocus = "Tactile cone orientation recognition in zero visibility."
                        ),
                        ReDrillStep(
                            minute = "02:00 - 03:00",
                            action = "Walk at steady crouching pace along lifeline. Halt at junction, identify emergency refuge chamber door handle, and signal 3 taps.",
                            physicalFocus = "Crouch posture under thermal smoke layer and refuge door access."
                        )
                    ),
                    supervisorSignOffChecklist = listOf(
                        "Worker donned SCSR in under 20 seconds without fumbling mouthpiece.",
                        "Worker correctly identified lifeline tactile cone direction pointing toward intake shaft.",
                        "Worker halted immediately at blocked exit warning beacon and turned toward safe escapeway."
                    )
                )
            }
            "CONFINED_SPACE" -> {
                ThreeMinuteReDrill(
                    drillTitle = "3-Minute Physical Sump Sniffer & Winch Buddy Re-drill",
                    objective = "Reinforce involuntary physical muscle memory: 4-level gas sniff test and winch attachment before stepping onto ladder rung.",
                    steps = listOf(
                        ReDrillStep(
                            minute = "00:00 - 01:00",
                            action = "Pick up calibrated 4-gas detector. Perform fresh air bump test. Lower probe into manhole at 1m intervals: rim (top), middle (asphyxiant zone), and sludge sump bottom (heavy H2S/CH4). Read and announce values out loud.",
                            physicalFocus = "Multi-gas wand sampling posture & loud audible vocalization of O2/H2S levels."
                        ),
                        ReDrillStep(
                            minute = "01:00 - 02:00",
                            action = "Establish physical line of sight with designated standby buddy. Clip tripod winch carabiner to dorsal D-ring of harness. Tug lanyard 3 times to verify positive mechanical locking.",
                            physicalFocus = "Tripod carabiner locking check and two-way verbal acknowledge whistle signal."
                        ),
                        ReDrillStep(
                            minute = "02:00 - 03:00",
                            action = "Display signed PTW permit card. Step one foot on top rung while holding safety davit with both hands. Look at buddy, confirm 'Entering space with clearance'. Wait for buddy thumb-up signal before descent.",
                            physicalFocus = "Three-point ladder contact and mandatory buddy entry authorization handshake."
                        )
                    ),
                    supervisorSignOffChecklist = listOf(
                        "Worker demonstrated 3-level atmospheric sampling (Top, Middle, Bottom) without stepping past opening perimeter.",
                        "Tripod winch auto-arrest latch physically tested and engaged to harness dorsal D-ring.",
                        "Dedicated standby attendant (buddy) remained within arms reach of manhole rim throughout simulated descent.",
                        "Permit-to-work verification signed by certified Shift Safety In-Charge."
                    )
                )
            }
            "ELECTRICAL_LOTO" -> {
                ThreeMinuteReDrill(
                    drillTitle = "3-Minute Live-Dead-Live Zero Energy & Red Padlock Re-drill",
                    objective = "Instill instinctive physical test of high-voltage detector wand on known live source before touching isolated busbar spouts.",
                    steps = listOf(
                        ReDrillStep(
                            minute = "00:00 - 01:00",
                            action = "Take rated high-voltage detector wand. Test on known energized source (verifying audible buzzer & red LED flashing).",
                            physicalFocus = "Live test verification before application."
                        ),
                        ReDrillStep(
                            minute = "01:00 - 02:00",
                            action = "Probe the isolated feeder breaker spouts. Confirm ZERO deflection/zero tone. Re-verify wand immediately on live test unit to confirm tester did not fail during measurement (Live-Dead-Live).",
                            physicalFocus = "Live-Dead-Live 3-point cycle verification."
                        ),
                        ReDrillStep(
                            minute = "02:00 - 03:00",
                            action = "Close mechanical safety shutters. Snap individual red master padlock through lockout hasp. Fasten laminated danger warning tag with worker name and telephone extension. Pocket the unique physical key.",
                            physicalFocus = "Physical padlock clasp engagement and key pocketing."
                        )
                    ),
                    supervisorSignOffChecklist = listOf(
                        "Worker completed complete Live-Dead-Live voltage detector verification protocol.",
                        "Red safety padlock secured on busbar shutter eyelet with physical danger tag.",
                        "Earth switch closure confirmed with mechanical flag."
                    )
                )
            }
            "MINE_STRATA" -> {
                ThreeMinuteReDrill(
                    drillTitle = "3-Minute Strata Sounding & Methane Cavity Re-drill",
                    objective = "Reinforce roof strata tapping rhythm and high cavity methane sampling before coal face advance.",
                    steps = listOf(
                        ReDrillStep(
                            minute = "00:00 - 01:00",
                            action = "Hold DGMS sounding rod at 45 degree angle. Lightly tap roof stone systematically from supported timber line towards fresh face.",
                            physicalFocus = "Acoustic discrimination between solid ringing tone vs hollow drumming rock."
                        ),
                        ReDrillStep(
                            minute = "01:00 - 02:00",
                            action = "Extend telescopic gas sampling wand into high roof cavity where lighter methane gas pockets accumulate.",
                            physicalFocus = "Telescopic wand extension and digital reading verification (<0.75% CH4)."
                        ),
                        ReDrillStep(
                            minute = "02:00 - 03:00",
                            action = "Inspect resin roof bolt torque indicator pins. Mark date and chalk signature on statutory face inspection board.",
                            physicalFocus = "Torque verification and face board chalk recording."
                        )
                    ),
                    supervisorSignOffChecklist = listOf(
                        "Worker performed strata sounding tap from supported to unsupported boundary.",
                        "Roof cavity methane check completed below permissible statutory limit.",
                        "Self-contained self-rescuer (SCSR) seal physically verified."
                    )
                )
            }
            else -> {
                ThreeMinuteReDrill(
                    drillTitle = "3-Minute HEMM Haul Road 30m Perimeter & Radio Acknowledge Re-drill",
                    objective = "Ensure worker never enters blind spot without positive two-way horn confirmation from dumper operator.",
                    steps = listOf(
                        ReDrillStep(
                            minute = "00:00 - 01:00",
                            action = "Halt at safety berm crest (30m away from machinery). Visually scan for dumper reversing strobe light.",
                            physicalFocus = "30-meter perimeter boundary recognition."
                        ),
                        ReDrillStep(
                            minute = "01:00 - 02:00",
                            action = "Transmit two-way radio message: 'Dumper Operator, pedestrian requesting clearance across berm'. Wait for double horn honk.",
                            physicalFocus = "Clear audible two-way communication protocol."
                        ),
                        ReDrillStep(
                            minute = "02:00 - 03:00",
                            action = "Cross along designated pedestrian crossing berm while maintaining eye contact with operator cab.",
                            physicalFocus = "Continuous eye contact and designated walkway adherence."
                        )
                    ),
                    supervisorSignOffChecklist = listOf(
                        "Worker halted at 30m perimeter before entering active haul zone.",
                        "Two-way horn or radio acknowledgment obtained before crossing.",
                        "Class-3 retroreflective vest clean and visible."
                    )
                )
            }
        }
    }

    private fun generateRegulatoryCompliance(
        session: SimulationDrillSession,
        hasCritical: Boolean,
        risk: String
    ): RegulatoryCompliance {
        val isPass = !hasCritical && risk != "CRITICAL" && risk != "MEDIUM"
        val standards = when (session.category.uppercase()) {
            "FIRE_EVACUATION" -> listOf(
                "DGMS Coal Mines Regulations (CMR) 2017 - Regulation 139 (Escape Routes & Fire Plans)",
                "OSHA 29 CFR 1910.36 & 1910.38 (Emergency Action & Exit Routes)",
                "DGMS (Tech) Circular No. 04 of 2017 (Self-Contained Self-Rescuers in Mines)"
            )
            "CONFINED_SPACE" -> listOf(
                "DGMS (Tech) Circular No. 02 of 2019 (Confined Space & Sump Safety in Mines)",
                "OSHA 29 CFR 1910.146 (Permit-Required Confined Spaces)",
                "IS 11972: Code of practice for safety precaution to be taken when entering sewerage/sumps"
            )
            "ELECTRICAL_LOTO" -> listOf(
                "Central Electricity Authority (Measures relating to Safety and Electric Supply) Regulations, 2010 (Reg 30)",
                "OSHA 29 CFR 1910.147 (The Control of Hazardous Energy - Lockout/Tagout)",
                "DGMS Circular (Electrical) No. 01 of 2014"
            )
            "MINE_STRATA" -> listOf(
                "DGMS Coal Mines Regulations (CMR) 2017 - Regulation 123 (Strata Control)",
                "DGMS Coal Mines Regulations (CMR) 2017 - Regulation 153 (Precautions Against Inflammable Gas)",
                "OSHA 30 CFR Part 75 (Mandatory Safety Standards for Underground Coal Mines)"
            )
            "HEMM_HAUL_ROAD" -> listOf(
                "DGMS Circular No. 05 of 2016 (Safety Management in HEMM Haul Roads)",
                "DGMS (Tech) Circular No. 09 of 2008 (Audio-Visual Reversing Alarms & Proximity Warning)",
                "OSHA 29 CFR 1926.601 (Motor Vehicles in Industrial Mining)"
            )
            else -> listOf(
                "DGMS General Safety Standards for Indian Mines",
                "OSHA 29 CFR 1910 General Industry Regulations"
            )
        }
        return RegulatoryCompliance(
            dgmsCompliant = isPass,
            oshaCompliant = isPass,
            applicableStandards = standards
        )
    }
}
