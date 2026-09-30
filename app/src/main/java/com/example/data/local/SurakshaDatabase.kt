package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        AssessmentRecordEntity::class,
        WorkerEntity::class,
        ScenarioEntity::class,
        AttemptEntity::class,
        SimulationEventEntity::class,
        CertificateEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class SurakshaDatabase : RoomDatabase() {

    abstract fun assessmentDao(): AssessmentDao
    abstract fun workerDao(): WorkerDao
    abstract fun attemptDao(): AttemptDao
    abstract fun scenarioDao(): ScenarioDao
    abstract fun certificateDao(): CertificateDao

    companion object {
        @Volatile
        private var INSTANCE: SurakshaDatabase? = null

        fun getInstance(context: Context): SurakshaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SurakshaDatabase::class.java,
                    "suraksha_ar.db"
                )
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            CoroutineScope(Dispatchers.IO).launch {
                                val database = getInstance(context)
                                populateInitialData(database)
                            }
                        }
                    })
                    .fallbackToDestructiveMigration(true)
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private suspend fun populateInitialData(db: SurakshaDatabase) {
            // Seed Workers
            val initialWorkers = listOf(
                WorkerEntity(
                    workerId = "WKR-4491",
                    name = "Rajesh Gope",
                    siteId = "SITE-JHARIA-04",
                    trade = "Haulage Attendant",
                    department = "Underground Haulage Incline No. 2",
                    preferredLanguage = "HINDI",
                    totalDrills = 3,
                    passedDrills = 1,
                    lastRiskStatus = "CRITICAL"
                ),
                WorkerEntity(
                    workerId = "WKR-8421",
                    name = "Ramesh Kumar Soren",
                    siteId = "SITE-JHARIA-04",
                    trade = "Sump Pump Mechanic",
                    department = "Ash Handling & Sump Division",
                    preferredLanguage = "HINDI",
                    totalDrills = 3,
                    passedDrills = 1,
                    lastRiskStatus = "CRITICAL"
                ),
                WorkerEntity(
                    workerId = "WKR-5512",
                    name = "Sunil Marandi",
                    siteId = "SITE-DHANBAD-02",
                    trade = "High Tension Electrician",
                    department = "Main Substation 33kV/11kV",
                    preferredLanguage = "HINDI",
                    totalDrills = 4,
                    passedDrills = 2,
                    lastRiskStatus = "CRITICAL"
                ),
                WorkerEntity(
                    workerId = "WKR-1904",
                    name = "Budhan Murmu",
                    siteId = "SITE-RANIGANJ-01",
                    trade = "Mine Face Sirdar",
                    department = "Underground Seam IV Extraction",
                    preferredLanguage = "SANTALI_OL_CHIKI",
                    totalDrills = 8,
                    passedDrills = 8,
                    lastRiskStatus = "LOW"
                ),
                WorkerEntity(
                    workerId = "WKR-3290",
                    name = "Anil Kisku",
                    siteId = "SITE-BOKARO-03",
                    trade = "Surveyor Assistant",
                    department = "Opencast Heavy Earth Moving",
                    preferredLanguage = "SANTALI_OL_CHIKI",
                    totalDrills = 5,
                    passedDrills = 3,
                    lastRiskStatus = "MEDIUM"
                ),
                WorkerEntity(
                    workerId = "WKR-7022",
                    name = "Manoj Prasad",
                    siteId = "SITE-JHARIA-04",
                    trade = "Continuous Miner Operator",
                    department = "Longwall Mechanized Panel",
                    preferredLanguage = "HINDI",
                    totalDrills = 6,
                    passedDrills = 5,
                    lastRiskStatus = "LOW"
                )
            )
            db.workerDao().insertWorkers(initialWorkers)

            // Seed Scenarios for PRD Module 1 & Module 2
            val initialScenarios = listOf(
                ScenarioEntity(
                    scenarioId = "SCEN-FIRE-EVAC-01",
                    moduleId = "FIRE_EVACUATION",
                    title = "Module 1: Fire & Emergency Evacuation Lab",
                    version = "1.2.0",
                    contentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    targetStandard = "DGMS CMR 2017 Reg 139 / OSHA 1910.38 / 1910.157"
                ),
                ScenarioEntity(
                    scenarioId = "SCEN-GAS-SUMP-02",
                    moduleId = "CONFINED_SPACE",
                    title = "Module 2: Gas Leak & Confined Space Entry Lab",
                    version = "1.2.0",
                    contentHash = "7bc8516aa8d8d34346e2ae2666fa5a1ab3ffaf375990234a9386d49be25fbfe7",
                    targetStandard = "OSHA 1910.146 / DGMS Tech Circular 02/2019"
                )
            )
            db.scenarioDao().insertScenarios(initialScenarios)
        }
    }
}
