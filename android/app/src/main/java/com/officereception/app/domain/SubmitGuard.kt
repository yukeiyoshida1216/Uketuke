package com.officereception.app.domain

class SubmitGuard(
    private val windowMs: Long,
    private val now: () -> Long
) {
    @Volatile
    private var inFlight: Boolean = false
    private var lastSuccessFingerprint: String? = null
    private var lastSuccessAt: Long = 0L

    @Synchronized
    fun tryBegin(fingerprint: String): Boolean {
        if (inFlight) {
            return false
        }
        val last = lastSuccessFingerprint
        if (last != null && last == fingerprint && now() - lastSuccessAt < windowMs) {
            return false
        }
        inFlight = true
        return true
    }

    @Synchronized
    fun endSuccess(fingerprint: String) {
        inFlight = false
        lastSuccessFingerprint = fingerprint
        lastSuccessAt = now()
    }

    @Synchronized
    fun endFailure() {
        inFlight = false
    }

    fun isInFlight(): Boolean = inFlight
}
