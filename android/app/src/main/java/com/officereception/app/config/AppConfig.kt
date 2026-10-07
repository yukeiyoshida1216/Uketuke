package com.officereception.app.config

import androidx.compose.ui.graphics.Color
import com.officereception.app.BuildConfig

enum class AppLanguage {
    Japanese,
    English
}

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
        val CreamTop = Color(0xFFFFFBF0)
        val CreamCenter = Color(0xFFFFF8E4)
        val CreamBottom = Color(0xFFFFEFC0)
        val Accent = Color(0xFFE8A020)
        val AccentBorder = Color(0xFFF0C56A)
        val Card = Color(0xFFFFFFFF)
        val Ink = Color(0xFF4A3E31)
        val InkMuted = Color(0xFF8A8178)
        val Border = Color(0xFFF0D9A8)
        val Error = Color(0xFFB3261E)
        val White = Color(0xFFFFFFFF)
        val Yellow = CreamBottom
        val Yamabuki = Accent
    }

    object Brand {
        const val companyJa = "株式会社ライトパス"
        const val companyEnLine1 = "L I G H T"
        const val companyEnLine2 = "P A T H"
    }

    data class Copy(
        val welcome: String,
        val touchHint: String,
        val menuTitle: String,
        val generalTitle: String,
        val generalSubtitle: String,
        val interviewTitle: String,
        val interviewSubtitle: String,
        val otherTitle: String,
        val otherSubtitle: String,
        val delivery: String,
        val back: String,
        val submit: String,
        val retry: String,
        val home: String,
        val company: String,
        val visitorName: String,
        val partySize: String,
        val party1: String,
        val party2: String,
        val party3: String,
        val party4Plus: String,
        val destination: String,
        val destinationPlaceholder: String,
        val companyPlaceholder: String,
        val namePlaceholder: String,
        val requiredNote: String,
        val interviewFormHint: String,
        val purposeInterview: String,
        val purposeBriefing: String,
        val langJa: String,
        val langEn: String,
        val sending: String,
        val loading: String,
        val success: String,
        val errorTitle: String,
        val errorBody: String,
        val destinationsError: String
    )

    fun copy(language: AppLanguage): Copy = when (language) {
        AppLanguage.Japanese -> Copy(
            welcome = "WELCOME",
            touchHint = "画面をタッチしてください",
            menuTitle = "ご用件を選択してください",
            generalTitle = "企業様向け",
            generalSubtitle = "打ち合わせ・ご訪問",
            interviewTitle = "面接・会社説明",
            interviewSubtitle = "面接・会社説明でお越しの方",
            otherTitle = "その他",
            otherSubtitle = "点検やビル関係者など",
            delivery = "宅配/郵便",
            back = "←戻る",
            submit = "送信する",
            retry = "再試行",
            home = "最初の画面へ戻る",
            company = "会社名",
            visitorName = "氏名",
            partySize = "来社人数",
            party1 = "1人",
            party2 = "2人",
            party3 = "3人",
            party4Plus = "4人以上",
            destination = "担当者名",
            destinationPlaceholder = "選択してください",
            companyPlaceholder = "株式会社ライトパス",
            namePlaceholder = "ライト 一郎",
            requiredNote = "会社名・氏名・人数・担当者名はすべて必須です",
            interviewFormHint = "氏名を入力し、面接・会社説明のいずれかを選択してください",
            purposeInterview = "面接",
            purposeBriefing = "会社説明",
            langJa = "日本語",
            langEn = "EN",
            sending = "送信しています…",
            loading = "データを取得しています…",
            success = "入力ありがとうございます！",
            errorTitle = "送信できませんでした",
            errorBody = "通信に失敗しました。もう一度お試しください。",
            destinationsError = "訪問先を取得できませんでした。"
        )
        AppLanguage.English -> Copy(
            welcome = "WELCOME",
            touchHint = "Please touch the screen",
            menuTitle = "Please select your purpose",
            generalTitle = "Business visitors",
            generalSubtitle = "Meetings & visits",
            interviewTitle = "Interview / Briefing",
            interviewSubtitle = "For interviews or company briefings",
            otherTitle = "Other",
            otherSubtitle = "Inspections & building staff",
            delivery = "Delivery / Mail",
            back = "← Back",
            submit = "Submit",
            retry = "Retry",
            home = "Back to start",
            company = "Company",
            visitorName = "Name",
            partySize = "Party size",
            party1 = "1",
            party2 = "2",
            party3 = "3",
            party4Plus = "4+",
            destination = "Host",
            destinationPlaceholder = "Please select",
            companyPlaceholder = "Light Path Inc.",
            namePlaceholder = "Ichiro Light",
            requiredNote = "Company, name, party size, and host are required",
            interviewFormHint = "Enter your name and select Interview or Briefing",
            purposeInterview = "Interview",
            purposeBriefing = "Briefing",
            langJa = "日本語",
            langEn = "EN",
            sending = "Sending…",
            loading = "Loading…",
            success = "Thank you!",
            errorTitle = "Could not send",
            errorBody = "Network error. Please try again.",
            destinationsError = "Could not load hosts."
        )
    }

    object Text {
        val loading get() = copy(AppLanguage.Japanese).loading
        val sending get() = copy(AppLanguage.Japanese).sending
        val success get() = copy(AppLanguage.Japanese).success
        val errorTitle get() = copy(AppLanguage.Japanese).errorTitle
        val errorBody get() = copy(AppLanguage.Japanese).errorBody
        val destinationsError get() = copy(AppLanguage.Japanese).destinationsError
        val retry get() = copy(AppLanguage.Japanese).retry
        val home get() = copy(AppLanguage.Japanese).home
    }
}
