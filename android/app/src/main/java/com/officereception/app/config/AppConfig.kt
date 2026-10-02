package com.officereception.app.config

import androidx.compose.ui.graphics.Color
import com.officereception.app.BuildConfig

object AppConfig {
    object Timing {
        const val IDLE_TIMEOUT_MS = 30_000L
        const val COMPLETE_DISPLAY_MS = 5_000L
        const val NETWORK_TIMEOUT_MS = 10_000L
        const val DUPLICATE_WINDOW_MS = 10_000L
    }

    object Network {
        val apiBaseUrl: String = BuildConfig.API_BASE_URL
        const val automaticRetries = 0
    }

    object Colors {
        val Yellow = Color(0xFFFFE566)
        val Yamabuki = Color(0xFFF8B500)
        val White = Color(0xFFFFFFFF)
        val Ink = Color(0xFF3B2A00)
        val Error = Color(0xFFB3261E)
    }

    object Text {
        const val welcomeTitle = "ようこそ"
        const val welcomeHint = "画面をタップしてください"
        const val menuTitle = "ご用件を選んでください"
        const val general = "総合受付"
        const val interview = "面接・研修"
        const val delivery = "配達員"
        const val back = "戻る"
        const val next = "次へ"
        const val call = "呼び出す"
        const val retry = "再試行"
        const val home = "最初の画面へ戻る"
        const val company = "会社名"
        const val visitorName = "お名前"
        const val partySize = "来社人数"
        const val destinationTitle = "訪問先を選んでください"
        const val destinationLabel = "訪問先（どなた宛）"
        const val destinationPlaceholder = "選択してください"
        const val interviewTitle = "用件を選び、お名前を入力してください"
        const val purposeTitle = "用件"
        const val purposeInterview = "面接"
        const val purposeTraining = "研修"
        const val sending = "送信しています…"
        const val loading = "データを取得しています…"
        const val success = "入力ありがとうございます！"
        const val errorTitle = "送信できませんでした"
        const val errorBody = "通信に失敗しました。もう一度お試しください。"
        const val destinationsError = "訪問先を取得できませんでした。"
    }
}
