package com.example.data.sample

import com.example.data.model.SimulationDrillSession
import com.example.data.model.SimulationEvent

object PredefinedDrills {

    val CONFINED_SPACE_FAIL = SimulationDrillSession(
        drillId = "DR-CS-2026-01",
        drillTitle = "Sump Confined Space Entry - Boiler Ash Trench",
        workerId = "WKR-8421",
        workerName = "Ramesh Kumar Soren",
        trade = "Sump Pump Mechanic",
        category = "CONFINED_SPACE",
        executionMode = "AR_MODE",
        targetStandard = "DGMS Tech Circular No 02/2019 & OSHA 29 CFR 1910.146",
        startTimeMs = System.currentTimeMillis() - 240000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-101",
                timestampMs = 12000,
                eventType = "PPE_INSPECTION_COMPLETED",
                zone = "Prep Bay",
                hazardType = "PPE_COMPLIANCE",
                details = "Helmet, heavy rubber boots, and chemical gloves donned correctly.",
                parameters = mapOf("helmet" to "true", "boots" to "true", "gloves" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-102",
                timestampMs = 28000,
                eventType = "HARNESS_DONNED",
                zone = "Prep Bay",
                hazardType = "FALL_HAZARD",
                details = "Full body harness straps checked with D-ring dorsal positioning.",
                parameters = mapOf("harness_type" to "Class_A_Full_Body", "lanyard_inspected" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-103",
                timestampMs = 45000,
                eventType = "APPROACH_MANHOLE",
                zone = "Boiler Ash Sump Manhole A",
                hazardType = "ZONE_TRANSITION",
                details = "Worker removed manhole cover grate manually.",
                parameters = mapOf("cover_removed" to "true", "air_vent_natural" to "open")
            ),
            SimulationEvent(
                eventId = "EVT-104",
                timestampMs = 52000,
                eventType = "PERMIT_TO_WORK_SKIPPED",
                zone = "Entry Point",
                hazardType = "REGULATORY_PERMIT",
                details = "CRITICAL VIOLATION: Worker proceeded to ladder without obtaining verified Confined Space Entry Permit (PTW).",
                parameters = mapOf("ptw_signed" to "false", "gas_tester_name" to "none")
            ),
            SimulationEvent(
                eventId = "EVT-105",
                timestampMs = 61000,
                eventType = "GAS_TESTING_OMITTED",
                zone = "Entry Point",
                hazardType = "TOXIC_ATMOSPHERE_ASPHYXIATION",
                details = "CRITICAL VIOLATION: Zero atmospheric pre-entry testing with calibrated 4-gas sniffer (CH4, O2, H2S, CO).",
                parameters = mapOf("ch4_tested" to "false", "o2_tested" to "false", "h2s_tested" to "false")
            ),
            SimulationEvent(
                eventId = "EVT-106",
                timestampMs = 74000,
                eventType = "STANDBY_BUDDY_ABSENT",
                zone = "Opening Rim",
                hazardType = "BUDDY_SAFETY_PROTOCOL",
                details = "CRITICAL VIOLATION: No certified standby attendant positioned at opening rim with retrieval winch.",
                parameters = mapOf("buddy_present" to "false", "radio_comm_verified" to "false")
            ),
            SimulationEvent(
                eventId = "EVT-107",
                timestampMs = 89000,
                eventType = "STEPPED_INSIDE_CONFINED_SPACE",
                zone = "Boiler Ash Sump Chamber",
                hazardType = "IMMINENT_DANGER_ENTRY",
                details = "Worker descended 3.5m down vertical ladder into unventilated dark chamber with stagnant slurry sludge.",
                parameters = mapOf("depth_meters" to "3.5", "ventilation_fan_on" to "false", "entry_speed_sec" to "15")
            )
        )
    )

    val FIRE_EVACUATION_BLOCKED_EXIT_FAIL = SimulationDrillSession(
        drillId = "DR-FIRE-2026-05",
        drillTitle = "Underground Mine Fire Evacuation (2D Interactive Fallback)",
        workerId = "WKR-4491",
        workerName = "Rajesh Gope",
        trade = "Haulage Attendant",
        category = "FIRE_EVACUATION",
        executionMode = "2D_FALLBACK_MODE",
        targetStandard = "DGMS CMR 2017 Reg 139 & OSHA 1910.38 / 1910.36",
        startTimeMs = System.currentTimeMillis() - 160000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-501",
                timestampMs = 6000,
                eventType = "FIRE_ALARM_SIREN_TRIGGERED",
                zone = "Underground Level 4 Heading",
                hazardType = "FIRE_EMERGENCY",
                details = "Audible mine klaxon siren and stench gas warning deployed.",
                parameters = mapOf("siren_decibels" to "105", "co_sensor_ppm" to "78")
            ),
            SimulationEvent(
                eventId = "EVT-502",
                timestampMs = 14000,
                eventType = "SCSR_SELF_RESCUER_DONNED",
                zone = "Heading 3 Refuge Bay",
                hazardType = "LIFE_SUPPORT",
                details = "EXEMPLARY SPEED: Worker donned SCSR oxygen self-rescuer in 14 seconds (standard < 30 sec).",
                parameters = mapOf("donning_time_sec" to "14", "nose_clip_fitted" to "true", "mouthpiece_inserted" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-503",
                timestampMs = 28000,
                eventType = "APPROACH_GALLERY_JUNCTION",
                zone = "Junction 4 Cross-Cut",
                hazardType = "EVACUATION_NAVIGATION",
                details = "Worker reached signage fork: South travelling airway (clear lifeline) vs North belt incline (smoke rising).",
                parameters = mapOf("lifeline_located" to "true", "smoke_visibility_meters" to "3.5")
            ),
            SimulationEvent(
                eventId = "EVT-504",
                timestampMs = 42000,
                eventType = "MOVED_TOWARD_BLOCKED_EXIT",
                zone = "North Conveyor Belt Drift",
                hazardType = "CRITICAL_BLOCKED_EXIT_VIOLATION",
                details = "CRITICAL VIOLATION: Worker ran into North belt gallery clearly indicated as BLOCKED EXIT by flashing red beacon and fire separation curtain. Ignored intake lifeline pointing to South escape shaft.",
                parameters = mapOf("signage_ignored" to "RED_BLOCKED_EXIT_BEACON", "lifeline_dropped" to "true", "toxic_co_ppm" to "380")
            ),
            SimulationEvent(
                eventId = "EVT-505",
                timestampMs = 55000,
                eventType = "TRAPPED_AT_FIRE_DOOR",
                zone = "North Fire Dam Bulkhead",
                hazardType = "IMMINENT_FIRE_TRAP",
                details = "Worker reached sealed steel fire bulkhead. Smoke density 95%. Trapped with zero egress.",
                parameters = mapOf("egress_blocked" to "true")
            )
        )
    )

    val LOTO_SUBSTATION_FAIL = SimulationDrillSession(
        drillId = "DR-LOTO-2026-02",
        drillTitle = "11kV Substation Incomer Isolation & Earthing",
        workerId = "WKR-5512",
        workerName = "Sunil Marandi",
        trade = "High Tension Electrician",
        category = "ELECTRICAL_LOTO",
        executionMode = "AR_MODE",
        targetStandard = "Central Electricity Authority (CEA) Regulations 2010 & OSHA 1910.147",
        startTimeMs = System.currentTimeMillis() - 300000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-201",
                timestampMs = 15000,
                eventType = "PPE_ARC_FLASH_DONNED",
                zone = "Switchgear Room A",
                hazardType = "ELECTRICAL_ARC_FLASH",
                details = "Donned 40 cal/cm2 arc flash suit, insulating gloves 17kV, and face shield.",
                parameters = mapOf("gloves_tested" to "true", "rating" to "Class_2_17kV")
            ),
            SimulationEvent(
                eventId = "EVT-202",
                timestampMs = 40000,
                eventType = "BREAKER_OPENED",
                zone = "Feeder 4 Panel",
                hazardType = "CIRCUIT_ISOLATION",
                details = "Turned feeder breaker trip control switch to TRIP. Mechanical flag indicated OPEN.",
                parameters = mapOf("breaker_position" to "OPEN", "indication_lamp" to "GREEN")
            ),
            SimulationEvent(
                eventId = "EVT-203",
                timestampMs = 65000,
                eventType = "RACK_OUT_BREAKER",
                zone = "Feeder 4 Cubicle",
                hazardType = "MECHANICAL_DISCONNECT",
                details = "Inserted racking crank and racked out breaker trolley to TEST/DISCONNECTED position.",
                parameters = mapOf("trolley_position" to "DISCONNECTED")
            ),
            SimulationEvent(
                eventId = "EVT-204",
                timestampMs = 82000,
                eventType = "ZERO_ENERGY_TEST_SKIPPED",
                zone = "Busbar Spout Bushings",
                hazardType = "STORED_ELECTRICAL_ENERGY",
                details = "CRITICAL VIOLATION: Failed to perform Live-Dead-Live zero voltage verification test with rated high-voltage detector wand.",
                parameters = mapOf("tested_live_source" to "false", "voltage_detector_used" to "false")
            ),
            SimulationEvent(
                eventId = "EVT-205",
                timestampMs = 95000,
                eventType = "PHYSICAL_PADLOCK_OMITTED",
                zone = "Shutter Mechanism",
                hazardType = "LOTO_INTEGRITY",
                details = "CRITICAL VIOLATION: Did not install red safety padlock and danger lockout tag on busbar shutter padlock eye.",
                parameters = mapOf("padlock_applied" to "false", "danger_tag_hung" to "false")
            ),
            SimulationEvent(
                eventId = "EVT-206",
                timestampMs = 110000,
                eventType = "TOOL_INSERTION_ATTEMPT",
                zone = "Busbar Bushing",
                hazardType = "ELECTROCUTION_RISK",
                details = "Worker reached hand tool towards spout without confirming earth switch closure.",
                parameters = mapOf("earth_switch_closed" to "false")
            )
        )
    )

    val COAL_MINE_STRATA_PASS = SimulationDrillSession(
        drillId = "DR-MIN-2026-03",
        drillTitle = "Underground Coal Face Roof Strata Sounding & Methane Check",
        workerId = "WKR-1904",
        workerName = "Budhan Murmu",
        trade = "Mine Face Sirdar",
        category = "MINE_STRATA",
        executionMode = "AR_MODE",
        targetStandard = "DGMS Coal Mines Regulations (CMR) 2017 Reg 123 & 153",
        startTimeMs = System.currentTimeMillis() - 200000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-301",
                timestampMs = 10000,
                eventType = "CAP_LAMP_AND_SELF_RESCUER_CHECK",
                zone = "Shaft Inset Pit Bottom",
                hazardType = "LIFE_SUPPORT",
                details = "Inspected DGMS approved cap lamp beam intensity and seal on SCSR (Self-Contained Self-Rescuer 30 min).",
                parameters = mapOf("cap_lamp_lux" to "3200", "scsr_indicator" to "BLUE_HERMETIC_PASS")
            ),
            SimulationEvent(
                eventId = "EVT-302",
                timestampMs = 35000,
                eventType = "GAS_MULTI_TEST_ROOF_CAVITY",
                zone = "Gallery 7 Heading",
                hazardType = "FLAMMABLE_METHANE_GAS",
                details = "Raised multi-gas sampling wand into high roof cavity. CH4 = 0.18% (Permissible < 0.75%), CO = 0 ppm, O2 = 20.8%.",
                parameters = mapOf("ch4_pct" to "0.18", "co_ppm" to "0", "o2_pct" to "20.8")
            ),
            SimulationEvent(
                eventId = "EVT-303",
                timestampMs = 60000,
                eventType = "BUDDY_SAFETY_RADIO_COMM",
                zone = "Gallery 7 Heading",
                hazardType = "COMMUNICATION",
                details = "Maintained line-of-sight with buddy timberman outside unsupported zone.",
                parameters = mapOf("buddy_name" to "Mangal Hansda", "distance_meters" to "4.2")
            ),
            SimulationEvent(
                eventId = "EVT-304",
                timestampMs = 85000,
                eventType = "SOUNDING_ROD_ROOF_INSPECTION",
                zone = "Fresh Cut Coal Face",
                hazardType = "STRATA_ROOF_FALL",
                details = "Tapped strata with standard brass-tipped sounding rod. Sound: Solid ringing tone, zero hollow drum sound detected.",
                parameters = mapOf("sounding_rod_used" to "true", "vibration_felt" to "none", "loose_scale_detected" to "none")
            ),
            SimulationEvent(
                eventId = "EVT-305",
                timestampMs = 110000,
                eventType = "ROOF_BOLT_TORQUE_CHECK",
                zone = "Fresh Cut Coal Face",
                hazardType = "STRATA_SUPPORT",
                details = "Checked torque indicator pin on last set of resin roof bolts. All within 120-150 Nm.",
                parameters = mapOf("torque_nm" to "135", "installed_support_compliant" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-306",
                timestampMs = 135000,
                eventType = "TAG_CLEARANCE_AND_BOARD_MARKING",
                zone = "Deputed Working Face",
                hazardType = "SUPERVISORY_LOG",
                details = "Chalked inspection initials, date, and gas readings on statutory face board.",
                parameters = mapOf("statutory_board_signed" to "true")
            )
        )
    )

    val HAUL_ROAD_MEDIUM_RISK = SimulationDrillSession(
        drillId = "DR-HEMM-2026-04",
        drillTitle = "Open Cast Haul Road 100T Dumper Reversing Buffer Zone",
        workerId = "WKR-3290",
        workerName = "Anil Kisku",
        trade = "Surveyor Assistant",
        category = "HEMM_HAUL_ROAD",
        executionMode = "2D_FALLBACK_MODE",
        targetStandard = "DGMS Circular No 05 of 2016 (HEMM Safety Guidelines)",
        startTimeMs = System.currentTimeMillis() - 190000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-401",
                timestampMs = 10000,
                eventType = "HIGH_VIS_VEST_INSPECTION",
                zone = "Mine Bench Office",
                hazardType = "VISIBILITY",
                details = "Class 3 fluorescent orange vest with 3M reflective retro-tapes confirmed.",
                parameters = mapOf("high_vis_grade" to "Class_3")
            ),
            SimulationEvent(
                eventId = "EVT-402",
                timestampMs = 35000,
                eventType = "ENTERING_HAUL_ROAD_JUNCTION",
                zone = "Haul Road Incline 1 in 16",
                hazardType = "TRAFFIC_MOVEMENT",
                details = "Walked along designated pedestrian berm walkway with safety bund on crest.",
                parameters = mapOf("berm_height_meters" to "1.8")
            ),
            SimulationEvent(
                eventId = "EVT-403",
                timestampMs = 60000,
                eventType = "BLIND_SPOT_PROXIMITY_VIOLATION",
                zone = "Dumper Reversing Berth",
                hazardType = "CRUSHING_HEAVY_MACHINERY",
                details = "MARGINAL VIOLATION: Worker stepped within 12 meters of rear left blind spot of CAT 777 Dumper for 9 seconds before audio-visual reversing alarm horn sounded.",
                parameters = mapOf("distance_to_tire_meters" to "11.5", "dwell_time_seconds" to "9", "in_mirror_view" to "false")
            ),
            SimulationEvent(
                eventId = "EVT-404",
                timestampMs = 78000,
                eventType = "TWO_WAY_RADIO_CONTACT",
                zone = "Dumper Berth",
                hazardType = "OPERATOR_COMMUNICATION",
                details = "Radioed dumper operator Channel 4: 'Dumper 14, hold stationary, pedestrian crossing rear left'. Operator confirmed.",
                parameters = mapOf("radio_confirmed" to "true", "horn_acknowledged" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-405",
                timestampMs = 95000,
                eventType = "SAFE_RETREAT_TO_BERM",
                zone = "Haul Road Crest",
                hazardType = "HAZARD_AVOIDANCE",
                details = "Retreated back to 30-meter safe perimeter zone outside turning radius.",
                parameters = mapOf("final_distance_meters" to "32.0")
            )
        )
    )

    val CONFINED_SPACE_ESCALATE_SAFE_PASS = SimulationDrillSession(
        drillId = "DR-CS-SAFE-06",
        drillTitle = "Module 2: Gas Leak & Sump Entry (Target Safe Outcome)",
        workerId = "WKR-1904",
        workerName = "Budhan Murmu",
        trade = "Mine Face Sirdar",
        category = "CONFINED_SPACE",
        executionMode = "2D_FALLBACK_MODE",
        targetStandard = "OSHA 1910.146 / DGMS Tech Circular 02/2019",
        startTimeMs = System.currentTimeMillis() - 120000,
        endTimeMs = System.currentTimeMillis(),
        events = listOf(
            SimulationEvent(
                eventId = "EVT-601",
                timestampMs = 8000,
                eventType = "SIGNAGE_INSPECTED",
                zone = "Virtual Sump Portal",
                hazardType = "WARNING_SIGN",
                details = "Inspected confined space hazard sign. Verified authorization requirements.",
                parameters = mapOf("signage_confirmed" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-602",
                timestampMs = 18000,
                eventType = "PPE_INSPECTION_COMPLETED",
                zone = "Prep Staging Bay",
                hazardType = "PPE_COMPLIANCE",
                details = "Full 4-gas detector, harness, and SCSR verified.",
                parameters = mapOf("ppe_complete" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-603",
                timestampMs = 32000,
                eventType = "ATMOSPHERIC_GAS_TEST_PERFORMED",
                zone = "Manhole Threshold",
                hazardType = "ATMOSPHERIC_MONITORING",
                details = "Lowered probe: O2 at 18.2% (Deficient), CH4 at 1.4% (Dangerous). Audible sniffer alarm sounded.",
                parameters = mapOf("o2_percent" to "18.2", "ch4_percent" to "1.4", "gas_alarm_sounded" to "true")
            ),
            SimulationEvent(
                eventId = "EVT-604",
                timestampMs = 45000,
                eventType = "INTENTIONAL_SAFE_ESCALATION",
                zone = "Safety Perimeter",
                hazardType = "HAZARD_MITIGATION",
                details = "TARGET SAFE OUTCOME: Worker intentionally selected 'DO NOT ENTER / ESCALATE'. Deployed physical barrier and logged toxic atmosphere.",
                parameters = mapOf("decision" to "DO_NOT_ENTER_ESCALATE", "hazard_escalated" to "true")
            )
        )
    )

    fun getAllPredefined(): List<SimulationDrillSession> = listOf(
        FIRE_EVACUATION_BLOCKED_EXIT_FAIL,
        CONFINED_SPACE_FAIL,
        CONFINED_SPACE_ESCALATE_SAFE_PASS,
        LOTO_SUBSTATION_FAIL,
        COAL_MINE_STRATA_PASS,
        HAUL_ROAD_MEDIUM_RISK
    )
}
