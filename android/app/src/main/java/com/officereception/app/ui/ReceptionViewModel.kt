package com.officereception.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.officereception.app.config.AppConfig
import com.officereception.app.data.ReceptionRepository
import com.officereception.app.domain.FormValidator
import com.officereception.app.domain.InterviewPurpose
import com.officereception.app.domain.NotifyPayload
import com.officereception.app.domain.SubmitGuard
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ReceptionViewModel(
    private val repository: ReceptionRepository = ReceptionRepository(),
    private val now: () -> Long = { System.currentTimeMillis() }
) : ViewModel() {
    private val _state = MutableStateFlow(ReceptionUiState())
    val state: StateFlow<ReceptionUiState> = _state

    private val submitGuard = SubmitGuard(AppConfig.Timing.DUPLICATE_WINDOW_MS, now)
    private var idleJob: Job? = null
    private var completeJob: Job? = null
    private var destinationsJob: Job? = null
    private var pendingAction: PendingAction? = null
    @Volatile
    private var requestInFlight: Boolean = false

    init {
        pendingAction = PendingAction.LoadDestinations
        prefetchDestinations()
    }

    fun onUserActivity() {
        val screen = _state.value.screen
        if (screen == Screen.Loading ||
            screen == Screen.Sending ||
            screen == Screen.Success
        ) {
            return
        }
        restartIdleTimer()
    }

    fun onWelcomeTapped() {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(screen = Screen.Menu) }
    }

    fun onSelectGeneral() {
        if (!isInteractionEnabled()) return
        onUserActivity()
        if (!_state.value.destinationsReady || _state.value.destinations.isEmpty()) {
            pendingAction = PendingAction.LoadDestinations
            showLoadingScreen()
            prefetchDestinations()
            return
        }
        _state.update { it.copy(screen = Screen.GeneralForm) }
    }

    fun onSelectInterview() {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(screen = Screen.InterviewForm) }
    }

    fun onSelectDelivery() {
        if (!isInteractionEnabled()) return
        onUserActivity()
        submit(NotifyPayload.Delivery)
    }

    fun onCompanyNameChange(value: String) {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(companyName = value) }
    }

    fun onVisitorNameChange(value: String) {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(visitorName = value) }
    }

    fun onPartySizeChange(value: String) {
        if (!isInteractionEnabled()) return
        onUserActivity()
        val filtered = value.filter { it.isDigit() }.take(2)
        _state.update { it.copy(partySize = filtered) }
    }

    fun onDestinationPicked(id: String) {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(selectedDestinationId = id) }
    }

    fun onGeneralSubmit() {
        if (!isInteractionEnabled() || requestInFlight) return
        onUserActivity()
        val current = _state.value
        if (!FormValidator.canSubmitGeneral(
                current.companyName,
                current.visitorName,
                current.partySize,
                current.selectedDestinationId
            )
        ) {
            return
        }
        val company = FormValidator.required(current.companyName) ?: return
        val name = FormValidator.required(current.visitorName) ?: return
        val size = FormValidator.partySize(current.partySize) ?: return
        val destinationId = current.selectedDestinationId ?: return
        submit(
            NotifyPayload.General(
                companyName = company,
                visitorName = name,
                partySize = size,
                destinationId = destinationId
            )
        )
    }

    fun onInterviewPurposeSelected(purpose: InterviewPurpose) {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { it.copy(interviewPurpose = purpose) }
    }

    fun onInterviewSubmit() {
        if (!isInteractionEnabled() || requestInFlight) return
        onUserActivity()
        val purpose = _state.value.interviewPurpose ?: return
        val name = FormValidator.required(_state.value.visitorName) ?: return
        submit(NotifyPayload.Interview(purpose = purpose, visitorName = name))
    }

    fun onBack() {
        if (!isInteractionEnabled()) return
        onUserActivity()
        _state.update { current ->
            when (current.screen) {
                Screen.GeneralForm, Screen.InterviewForm -> current.copy(screen = Screen.Menu)
                else -> current
            }
        }
    }

    fun onGoHome() {
        if (_state.value.screen == Screen.Loading) return
        resetToWelcome()
    }

    fun onRetry() {
        when (val action = pendingAction) {
            is PendingAction.Notify -> {
                if (requestInFlight) return
                onUserActivity()
                submit(action.payload)
            }
            PendingAction.LoadDestinations -> {
                showLoadingScreen()
                prefetchDestinations()
            }
            null -> resetToWelcome()
        }
    }

    private fun isInteractionEnabled(): Boolean {
        val screen = _state.value.screen
        return screen != Screen.Loading &&
            screen != Screen.Sending &&
            screen != Screen.Success &&
            destinationsJob?.isActive != true
    }

    private fun showLoadingScreen() {
        idleJob?.cancel()
        completeJob?.cancel()
        _state.update {
            it.copy(
                screen = Screen.Loading,
                statusMessage = AppConfig.Text.loading,
                canRetry = false
            )
        }
    }

    private fun prefetchDestinations() {
        if (destinationsJob?.isActive == true) {
            return
        }
        pendingAction = PendingAction.LoadDestinations
        showLoadingScreen()
        destinationsJob = viewModelScope.launch {
            try {
                val destinations = withContext(Dispatchers.IO) { repository.fetchDestinations() }
                if (destinations.isEmpty()) {
                    throw IllegalStateException("empty destinations")
                }
                _state.update {
                    it.copy(
                        destinations = destinations,
                        destinationsReady = true,
                        selectedDestinationId = it.selectedDestinationId
                            ?.takeIf { id -> destinations.any { dest -> dest.id == id } },
                        screen = Screen.Welcome,
                        canRetry = false,
                        showErrorHome = true
                    )
                }
                pendingAction = null
                restartIdleTimer()
            } catch (_: Exception) {
                pendingAction = PendingAction.LoadDestinations
                _state.update {
                    it.copy(
                        destinations = emptyList(),
                        destinationsReady = false,
                        screen = Screen.Error,
                        canRetry = true,
                        showErrorHome = false,
                        errorTitle = AppConfig.Text.errorTitle,
                        errorBody = AppConfig.Text.destinationsError
                    )
                }
            }
        }
    }

    private fun submit(payload: NotifyPayload) {
        if (requestInFlight) return
        if (!submitGuard.tryBegin(payload.fingerprint())) {
            return
        }
        requestInFlight = true
        pendingAction = PendingAction.Notify(payload)
        idleJob?.cancel()
        completeJob?.cancel()
        _state.update { it.copy(screen = Screen.Sending, statusMessage = AppConfig.Text.sending) }
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) { repository.notify(payload) }
                submitGuard.endSuccess(payload.fingerprint())
                _state.update { it.copy(screen = Screen.Success) }
                startCompleteTimer()
            } catch (_: Exception) {
                submitGuard.endFailure()
                _state.update {
                    it.copy(
                        screen = Screen.Error,
                        canRetry = true,
                        showErrorHome = true,
                        errorTitle = AppConfig.Text.errorTitle,
                        errorBody = AppConfig.Text.errorBody
                    )
                }
                restartIdleTimer()
            } finally {
                requestInFlight = false
            }
        }
    }

    private fun startCompleteTimer() {
        completeJob?.cancel()
        completeJob = viewModelScope.launch {
            delay(AppConfig.Timing.COMPLETE_DISPLAY_MS)
            resetToWelcome()
        }
    }

    private fun restartIdleTimer() {
        idleJob?.cancel()
        val screen = _state.value.screen
        if (screen == Screen.Loading || screen == Screen.Sending || screen == Screen.Success) {
            return
        }
        idleJob = viewModelScope.launch {
            delay(AppConfig.Timing.IDLE_TIMEOUT_MS)
            resetToWelcome()
        }
    }

    private fun resetToWelcome() {
        idleJob?.cancel()
        completeJob?.cancel()
        if (pendingAction is PendingAction.Notify) {
            pendingAction = null
        }
        requestInFlight = false
        val cached = _state.value
        if (!cached.destinationsReady) {
            showLoadingScreen()
            prefetchDestinations()
            return
        }
        _state.value = ReceptionUiState(
            screen = Screen.Welcome,
            destinations = cached.destinations,
            destinationsReady = true
        )
        restartIdleTimer()
    }
}
