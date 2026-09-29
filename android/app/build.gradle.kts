import java.util.Properties

plugins {
    id("com.android.application")
}

val configFile = listOf("config.properties", "config.properties.example")
    .map { rootProject.file(it) }
    .first { it.exists() }

val kioskProps = Properties().apply {
    configFile.inputStream().use { load(it) }
}

fun gradleString(value: String): String {
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
}

val kioskUrl = kioskProps.getProperty("kiosk.url", "http://127.0.0.1:8787")
val lockDown = kioskProps.getProperty("kiosk.lockDown", "false").toBoolean()

android {
    namespace = "jp.reception.kiosk"
    compileSdk = 35

    defaultConfig {
        applicationId = "jp.reception.kiosk"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "KIOSK_URL", gradleString(kioskUrl))
        buildConfigField("boolean", "LOCK_DOWN", lockDown.toString())
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
