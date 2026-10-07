package com.officereception.app.ui

import com.officereception.app.config.AppConfig
import com.officereception.app.domain.Destination
import com.officereception.app.domain.InterviewPurpose
import com.officereception.app.domain.NotifyPayload

enum class Screen {
    Loading,
    Welcome,
    Menu,
    GeneralForm,
    InterviewForm,
    Sending,
    Success,
    Error
}

data class ReceptionUiState(
    val screen: Screen = Screen.Loading,
    val companyName: String = "",
    val visitorName: String = "",
    val partySize: String = "",
    val interviewPurpose: InterviewPurpose? = null,
    val destinations: List<Destination> = emptyList(),
    val destinationsReady: Boolean = false,
    val selectedDestinationId: String? = null,
    val canRetry: Boolean = false,
    val showErrorHome: Boolean = true,
    val errorTitle: String = "",
    val errorBody: String = "",
    val statusMessage: String = AppConfig.Text.loading
)

sealed class PendingAction {
    data class Notify(
        val payload: NotifyPayload,
        val idempotencyKey: String
    ) : PendingAction()
    data object LoadDestinations : PendingAction()
}
