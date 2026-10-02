package com.officereception.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.lifecycle.viewmodel.compose.viewModel
import com.officereception.app.config.AppConfig
import com.officereception.app.ui.screens.ErrorScreen
import com.officereception.app.ui.screens.GeneralFormScreen
import com.officereception.app.ui.screens.InterviewFormScreen
import com.officereception.app.ui.screens.MenuScreen
import com.officereception.app.ui.screens.StatusScreen
import com.officereception.app.ui.screens.WelcomeScreen

@Composable
fun ReceptionApp(viewModel: ReceptionViewModel = viewModel()) {
    val state by viewModel.state.collectAsState()
    val interactionLocked = state.screen == Screen.Loading ||
        state.screen == Screen.Sending ||
        state.screen == Screen.Success

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AppConfig.Colors.White)
            .then(
                if (interactionLocked) {
                    Modifier
                } else {
                    Modifier.pointerInput(state.screen) {
                        awaitPointerEventScope {
                            while (true) {
                                awaitPointerEvent(PointerEventPass.Initial)
                                viewModel.onUserActivity()
                            }
                        }
                    }
                }
            )
    ) {
        when (state.screen) {
            Screen.Loading -> StatusScreen(message = state.statusMessage.ifEmpty { AppConfig.Text.loading })
            Screen.Welcome -> WelcomeScreen(onTap = viewModel::onWelcomeTapped)
            Screen.Menu -> MenuScreen(
                onGeneral = viewModel::onSelectGeneral,
                onInterview = viewModel::onSelectInterview,
                onDelivery = viewModel::onSelectDelivery
            )
            Screen.GeneralForm -> GeneralFormScreen(
                companyName = state.companyName,
                visitorName = state.visitorName,
                partySize = state.partySize,
                destinations = state.destinations,
                selectedDestinationId = state.selectedDestinationId,
                onCompanyNameChange = viewModel::onCompanyNameChange,
                onVisitorNameChange = viewModel::onVisitorNameChange,
                onPartySizeChange = viewModel::onPartySizeChange,
                onDestinationSelected = viewModel::onDestinationPicked,
                onSubmit = viewModel::onGeneralSubmit,
                onBack = viewModel::onBack
            )
            Screen.InterviewForm -> InterviewFormScreen(
                purpose = state.interviewPurpose,
                visitorName = state.visitorName,
                onPurposeSelected = viewModel::onInterviewPurposeSelected,
                onVisitorNameChange = viewModel::onVisitorNameChange,
                onSubmit = viewModel::onInterviewSubmit,
                onBack = viewModel::onBack
            )
            Screen.Sending -> StatusScreen(message = state.statusMessage)
            Screen.Success -> StatusScreen(message = AppConfig.Text.success)
            Screen.Error -> ErrorScreen(
                title = state.errorTitle,
                body = state.errorBody,
                onRetry = viewModel::onRetry,
                onHome = viewModel::onGoHome,
                showHome = state.showErrorHome
            )
        }
    }
}
