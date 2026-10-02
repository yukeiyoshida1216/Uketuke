package com.officereception.app.domain

object FormValidator {
    fun required(text: String): String? {
        val trimmed = text.trim()
        return trimmed.takeIf { it.isNotEmpty() }
    }

    fun partySize(text: String): Int? {
        val trimmed = text.trim()
        val value = trimmed.toIntOrNull() ?: return null
        return value.takeIf { it in 1..99 }
    }

    fun canSubmitGeneral(
        companyName: String,
        visitorName: String,
        partySizeText: String,
        destinationId: String?
    ): Boolean {
        return required(companyName) != null &&
            required(visitorName) != null &&
            partySize(partySizeText) != null &&
            !destinationId.isNullOrBlank()
    }

    fun canSubmitInterview(purpose: InterviewPurpose?, visitorName: String): Boolean {
        return purpose != null && required(visitorName) != null
    }
}
