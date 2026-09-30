/**
 * SurakshaAR (SIH Project Code: SIH 26041)
 * State Machine & Rules-based Competency Evaluator Engine
 * Target: Industrial and mining workers in India (DGMS & OSHA Compliance)
 * Zero Fake ML: Pure deterministic state-machine and rules evaluation.
 */

export enum SimulationModuleType {
  FIRE_EVACUATION = "FIRE_EVACUATION",
  CONFINED_SPACE_GAS_LEAK = "CONFINED_SPACE_GAS_LEAK",
}

export enum CompetencyCode {
  COMPETENCY_MASTERED = "COMPETENCY_MASTERED",
  ERR_BLOCKED_EXIT_ATTEMPT = "ERR_BLOCKED_EXIT_ATTEMPT",
  ERR_ELECTRICAL_FIRE_WATER_MISUSE = "ERR_ELECTRICAL_FIRE_WATER_MISUSE",
  ERR_EVACUATION_ALARM_OMITTED = "ERR_EVACUATION_ALARM_OMITTED",
  ERR_GAS_TEST_MISSING = "ERR_GAS_TEST_MISSING",
  ERR_TOXIC_GAS_ENTRY_VIOLATION = "ERR_TOXIC_GAS_ENTRY_VIOLATION",
  ERR_NO_BUDDY_STANDBY = "ERR_NO_BUDDY_STANDBY",
  ERR_PTW_PERMIT_NOT_VERIFIED = "ERR_PTW_PERMIT_NOT_VERIFIED",
}

export interface SimulationEvent {
  step: number;
  action: string;
  timestamp: number;
  hazardType?: string;
  details?: string;
}

export interface CompetencyEvaluationResult {
  moduleType: SimulationModuleType;
  verdict: "PASS" | "FAIL";
  competencyStatus: "MASTERED" | "NOT_MASTERED";
  competencyCode: CompetencyCode;
  score: number;
  criticalErrorFlag: boolean;
  auditTrail: string[];
  remedialDrill: {
    title: string;
    objective: string;
    actionSteps: string[];
    supervisorSignOffRequired: boolean;
  };
}

/**
 * Module 1: Fire & Emergency Evacuation Lab
 * DGMS CMR 2017 Reg 139 / OSHA 1910.38 / 1910.157
 */
export class FireEvacuationEvaluator {
  static evaluate(params: {
    alarmRaised: boolean;
    extinguisherUsed: "CO2_DRY_POWDER" | "WATER_TYPE" | "NONE";
    evacuationRoute: "SAFE_EXIT_B_ASSEMBLY" | "BLOCKED_EXIT_A";
    events: SimulationEvent[];
  }): CompetencyEvaluationResult {
    const auditTrail: string[] = [];
    auditTrail.push("Spatial Event: Electrical cabinet fire ignited in pump chamber.");
    auditTrail.push("Spatial Event: Exit A dynamically obstructed by toxic dense smoke barrier.");

    let criticalError = false;
    let code = CompetencyCode.COMPETENCY_MASTERED;

    if (params.alarmRaised) {
      auditTrail.push("Conforming Action: Manual call point alarm activated.");
    } else {
      auditTrail.push("Warning: Evacuation initiated without sounding primary siren.");
      code = CompetencyCode.ERR_EVACUATION_ALARM_OMITTED;
    }

    if (params.extinguisherUsed === "WATER_TYPE") {
      criticalError = true;
      code = CompetencyCode.ERR_ELECTRICAL_FIRE_WATER_MISUSE;
      auditTrail.push("CRITICAL ERROR: Water used on energized electrical fire (Electrocution hazard).");
    }

    // OPERATING RULE 1: Moving towards blocked route = Instant Critical Failure
    if (params.evacuationRoute === "BLOCKED_EXIT_A") {
      criticalError = true;
      code = CompetencyCode.ERR_BLOCKED_EXIT_ATTEMPT;
      auditTrail.push("CRITICAL FATAL VIOLATION: Worker moved towards blocked Exit A into smoke engulfment.");
    } else {
      auditTrail.push("Safe Maneuver: Redirected via illuminated secondary lifeline to Exit B Assembly Point.");
    }

    const isPass = !criticalError && params.alarmRaised;
    return {
      moduleType: SimulationModuleType.FIRE_EVACUATION,
      verdict: isPass ? "PASS" : "FAIL",
      competencyStatus: isPass ? "MASTERED" : "NOT_MASTERED",
      competencyCode: code,
      score: criticalError ? 20 : !params.alarmRaised ? 45 : 95,
      criticalErrorFlag: criticalError,
      auditTrail,
      remedialDrill: {
        title: "Tactical Blindfold Lifeline Evacuation Drill",
        objective: "Form tactile muscle memory navigating away from smoke barriers directly to secondary exits.",
        actionSteps: [
          "Locate cone-shaped directional marker on hanging mine lifeline.",
          "Perform tactile check: Pointing towards fresh air intake.",
          "Walk briskly maintaining 3-point contact; do not stop until Assembly Point reached."
        ],
        supervisorSignOffRequired: true,
      },
    };
  }
}

/**
 * Module 2: Gas Leak & Confined Space Entry Lab
 * OSHA 1910.146 / DGMS Tech Circular 02/2019
 */
export class ConfinedSpaceGasEvaluator {
  static evaluate(params: {
    signageInspected: boolean;
    ppeVerified: boolean;
    gasClearanceTested: boolean;
    buddyPermitVerified: boolean;
    workerDecision: "DO_NOT_ENTER_ESCALATE" | "ENTERED_CHAMBER";
    events: SimulationEvent[];
  }): CompetencyEvaluationResult {
    const auditTrail: string[] = [];
    auditTrail.push("Simulation started at Sump Chamber Portal.");

    let criticalError = false;
    let code = CompetencyCode.COMPETENCY_MASTERED;

    if (params.signageInspected) auditTrail.push("Inspected confined space hazard sign.");
    if (params.ppeVerified) auditTrail.push("PPE check passed: 4-gas sniffer, harness, SCSR self-rescuer.");

    if (!params.gasClearanceTested) {
      auditTrail.push("Violation: Mandatory multi-gas testing skipped before approaching threshold.");
    } else {
      auditTrail.push("Telemetry: Gas test executed (O2: 18.1% - DEFICIENT, CH4: 1.3% - DANGEROUS).");
    }

    if (!params.buddyPermitVerified) {
      auditTrail.push("Violation: No standby buddy or PTW entry permit confirmed.");
    }

    // OPERATING RULE 1:
    // Entering without gas clearance or buddy = Automatic Instant FAIL & NOT_MASTERED
    if (params.workerDecision === "ENTERED_CHAMBER") {
      criticalError = true;
      code = !params.gasClearanceTested
        ? CompetencyCode.ERR_GAS_TEST_MISSING
        : !params.buddyPermitVerified
        ? CompetencyCode.ERR_NO_BUDDY_STANDBY
        : CompetencyCode.ERR_TOXIC_GAS_ENTRY_VIOLATION;
      auditTrail.push("CRITICAL FATAL VIOLATION: Worker entered unsafe chamber under hazardous atmosphere.");
    } else {
      // TARGET SAFE OUTCOME: Worker intentionally selects "DO NOT ENTER / ESCALATE"
      auditTrail.push("TARGET SAFE OUTCOME: Worker recognized danger and chose DO NOT ENTER / ESCALATE.");
    }

    const isPass = !criticalError && params.workerDecision === "DO_NOT_ENTER_ESCALATE";
    return {
      moduleType: SimulationModuleType.CONFINED_SPACE_GAS_LEAK,
      verdict: isPass ? "PASS" : "FAIL",
      competencyStatus: isPass ? "MASTERED" : "NOT_MASTERED",
      competencyCode: code,
      score: criticalError ? 25 : 100,
      criticalErrorFlag: criticalError,
      auditTrail,
      remedialDrill: {
        title: "3-Minute Lockout & Escalation Physical Re-drill",
        objective: "Inculcate involuntary habit: Touch threshold -> Check sniffer readout -> Step back and shout 'Ruko, Andar mat jao'.",
        actionSteps: [
          "Deploy physical barrier across manhole entrance.",
          "Verbally declare atmospheric readings to Safety Sirdar.",
          "Fill hazardous escalation voucher and log into site registry."
        ],
        supervisorSignOffRequired: true,
      },
    };
  }
}
